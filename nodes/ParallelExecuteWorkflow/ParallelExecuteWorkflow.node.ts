import type {
	ExecuteWorkflowData,
	IExecuteFunctions,
	IExecuteWorkflowInfo,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodeParameterResourceLocator,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError, jsonParse } from 'n8n-workflow';

import { parallelExecuteWorkflowDescription } from './description';
import { createConcurrencyLimiter } from './concurrency';

export class ParallelExecuteWorkflow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Parallel Execute Workflow',
		name: 'parallelExecuteWorkflow',
		icon: 'file:parallel.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{\"Workflow: \" + $parameter[\"workflowId\"]}}',
		description:
			'Execute a sub-workflow in parallel for each input item using Promise.all, with concurrency control',
		defaults: {
			name: 'Parallel Execute Workflow',
			color: '#ff6d5a',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: parallelExecuteWorkflowDescription,
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const source = this.getNodeParameter('source', 0) as string;
		const concurrencyLimit = this.getNodeParameter('concurrencyLimit', 0, 0) as number;

		const waitForSubWorkflow = this.getNodeParameter(
			'options.waitForSubWorkflow',
			0,
			true,
		) as boolean;

		const onFailure = this.getNodeParameter('options.onFailure', 0, 'stopAll') as string;

		const workflowProxy = this.getWorkflowDataProxy(0);
		const currentWorkflowId = workflowProxy.$workflow.id as string;

		// Resolve workflow info once (same workflow for all items)
		const workflowInfo = resolveWorkflowInfo(this, source);

		// Create concurrency limiter
		const limit = createConcurrencyLimiter(concurrencyLimit);

		// Build execution promises for all input items
		const createExecutionPromise = (item: INodeExecutionData, index: number) =>
			limit(() =>
				this.executeWorkflow(workflowInfo, [item], undefined, {
					doNotWaitToFinish: !waitForSubWorkflow,
					parentExecution: {
						executionId: workflowProxy.$execution.id,
						workflowId: currentWorkflowId,
						shouldResume: waitForSubWorkflow,
					},
				}).then((result) => ({ index, result })),
			);

		const executionPromises = items.map((item, i) => createExecutionPromise(item, i));

		// --- Fire-and-forget mode (no wait) ---
		if (!waitForSubWorkflow) {
			return handleFireAndForget(
				this,
				executionPromises,
				items,
				workflowInfo,
				currentWorkflowId,
			);
		}

		// --- Wait mode ---
		if (onFailure === 'stopAll') {
			return handlePromiseAll(
				this,
				executionPromises,
				items,
				workflowInfo,
				currentWorkflowId,
			);
		} else {
			return handlePromiseAllSettled(
				this,
				executionPromises,
				items,
				workflowInfo,
				currentWorkflowId,
			);
		}
	}
}

// ============================================================
// Resolve workflow info from source configuration
// ============================================================

function resolveWorkflowInfo(
	context: IExecuteFunctions,
	source: string,
): IExecuteWorkflowInfo {
	const workflowInfo: IExecuteWorkflowInfo = {};

	if (source === 'database') {
		const { value } = context.getNodeParameter(
			'workflowId',
			0,
			{},
		) as INodeParameterResourceLocator;
		workflowInfo.id = value as string;
	} else if (source === 'parameter') {
		const workflowJson = context.getNodeParameter('workflowJson', 0) as string;
		workflowInfo.code = jsonParse(workflowJson);
	}

	return workflowInfo;
}

// ============================================================
// Execution Strategy: Fire-and-Forget
// ============================================================

async function handleFireAndForget(
	context: IExecuteFunctions,
	promises: Array<Promise<{ index: number; result: ExecuteWorkflowData }>>,
	items: INodeExecutionData[],
	workflowInfo: IExecuteWorkflowInfo,
	currentWorkflowId: string,
): Promise<INodeExecutionData[][]> {
	const settled = await Promise.allSettled(promises);
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const outcome = settled[i];

		if (outcome.status === 'fulfilled') {
			returnData.push({
				...items[i],
				metadata: {
					subExecution: {
						executionId: outcome.value.result.executionId,
						workflowId: workflowInfo.id ?? currentWorkflowId,
					},
				},
			});
		} else {
			if (context.continueOnFail()) {
				returnData.push({
					json: { error: (outcome.reason as Error).message },
					pairedItem: { item: i },
				});
			} else {
				throw new NodeOperationError(context.getNode(), outcome.reason as Error, {
					message: `Error starting sub-workflow for item at index ${i}`,
					itemIndex: i,
				});
			}
		}
	}

	context.setMetadata({ subExecutionsCount: items.length });
	return [returnData];
}

// ============================================================
// Execution Strategy: Promise.all (Fail-fast)
// ============================================================

async function handlePromiseAll(
	context: IExecuteFunctions,
	promises: Array<Promise<{ index: number; result: ExecuteWorkflowData }>>,
	items: INodeExecutionData[],
	workflowInfo: IExecuteWorkflowInfo,
	currentWorkflowId: string,
): Promise<INodeExecutionData[][]> {
	try {
		const results = await Promise.all(promises);
		const returnData: INodeExecutionData[][] = [];

		for (const { index, result } of results) {
			const workflowResult = result.data as INodeExecutionData[][];

			for (const [outputIndex, outputData] of workflowResult.entries()) {
				for (const item of outputData) {
					item.pairedItem = { item: index };
					item.metadata = {
						subExecution: {
							executionId: result.executionId,
							workflowId: workflowInfo.id ?? currentWorkflowId,
						},
					};
				}

				if (returnData[outputIndex] === undefined) {
					returnData[outputIndex] = [];
				}
				returnData[outputIndex].push(...outputData);
			}
		}

		context.setMetadata({ subExecutionsCount: items.length });
		return returnData.length > 0 ? returnData : [[]];
	} catch (error) {
		if (context.continueOnFail()) {
			return [
				[
					{
						json: { error: (error as Error).message },
						pairedItem: { item: 0 },
					},
				],
			];
		}
		throw error;
	}
}

// ============================================================
// Execution Strategy: Promise.allSettled (Continue on failure)
// ============================================================

async function handlePromiseAllSettled(
	context: IExecuteFunctions,
	promises: Array<Promise<{ index: number; result: ExecuteWorkflowData }>>,
	items: INodeExecutionData[],
	workflowInfo: IExecuteWorkflowInfo,
	currentWorkflowId: string,
): Promise<INodeExecutionData[][]> {
	const settled = await Promise.allSettled(promises);
	const returnData: INodeExecutionData[][] = [[]];

	for (let i = 0; i < settled.length; i++) {
		const outcome = settled[i];

		if (outcome.status === 'fulfilled') {
			const { index, result } = outcome.value;
			const workflowResult = result.data as INodeExecutionData[][];

			for (const [outputIndex, outputData] of workflowResult.entries()) {
				for (const item of outputData) {
					item.pairedItem = { item: index };
					item.metadata = {
						subExecution: {
							executionId: result.executionId,
							workflowId: workflowInfo.id ?? currentWorkflowId,
						},
					};
				}

				if (returnData[outputIndex] === undefined) {
					returnData[outputIndex] = [];
				}
				returnData[outputIndex].push(...outputData);
			}
		} else {
			// Failed sub-workflow — add error item to first output
			const errorMessage = (outcome.reason as Error).message || 'Unknown error';
			returnData[0].push({
				json: {
					error: errorMessage,
					itemIndex: i,
					status: 'failed',
				},
				pairedItem: { item: i },
			});
		}
	}

	context.setMetadata({ subExecutionsCount: items.length });
	return returnData;
}
