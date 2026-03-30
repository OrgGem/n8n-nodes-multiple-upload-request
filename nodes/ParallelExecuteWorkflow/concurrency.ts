/**
 * Simple concurrency limiter for parallel execution.
 * Zero dependencies — replaces p-limit for CJS compatibility.
 *
 * Usage:
 *   const limit = createConcurrencyLimiter(5);
 *   const results = await Promise.all(tasks.map(task => limit(() => task())));
 */

type ConcurrencyLimiterFn = <T>(fn: () => Promise<T>) => Promise<T>;

export function createConcurrencyLimiter(concurrency: number): ConcurrencyLimiterFn {
	// If concurrency is 0 or negative, no limit — run everything immediately
	if (concurrency <= 0) {
		return <T>(fn: () => Promise<T>) => fn();
	}

	let activeCount = 0;
	const queue: Array<() => void> = [];

	const next = () => {
		if (queue.length > 0 && activeCount < concurrency) {
			activeCount++;
			const resolve = queue.shift()!;
			resolve();
		}
	};

	return <T>(fn: () => Promise<T>): Promise<T> => {
		return new Promise<T>((resolve, reject) => {
			const run = () => {
				fn()
					.then(resolve)
					.catch(reject)
					.finally(() => {
						activeCount--;
						next();
					});
			};

			if (activeCount < concurrency) {
				activeCount++;
				run();
			} else {
				queue.push(run);
			}
		});
	};
}
