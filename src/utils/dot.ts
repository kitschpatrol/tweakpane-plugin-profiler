/**
 * Calculate the dot product of two numeric arrays. Missing elements of `b`
 * count as zero.
 */
export function dot(a: number[], b: number[]): number {
	let sum = 0

	for (const [i, element] of a.entries()) {
		sum += element * (b[i] ?? 0)
	}

	return sum
}
