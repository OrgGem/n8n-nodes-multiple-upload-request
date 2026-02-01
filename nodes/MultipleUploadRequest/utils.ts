import type { IBinaryData } from 'n8n-workflow';

/**
 * Match a filename against a pattern with wildcard support
 * Supports * (matches any characters) and ? (matches single character)
 */
export function wildcardMatch(filename: string, pattern: string): boolean {
	// Escape special regex characters except * and ?
	const escapedPattern = pattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*/g, '.*')
		.replace(/\?/g, '.');

	const regex = new RegExp(`^${escapedPattern}$`, 'i');
	return regex.test(filename);
}

/**
 * Filter binary files based on pattern
 */
export function filterBinaryFiles(
	binaryFiles: Record<string, IBinaryData>,
	pattern: string,
): Record<string, IBinaryData> {
	if (!pattern || pattern === '*') {
		return binaryFiles;
	}

	const filtered: Record<string, IBinaryData> = {};
	for (const [key, value] of Object.entries(binaryFiles)) {
		if (wildcardMatch(key, pattern)) {
			filtered[key] = value;
		}
	}

	return filtered;
}
