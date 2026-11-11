/**
 * I don't like reduce
 */
export function arraySum(array: number[]): number {
	let sum = 0
	for (const v of array) {
		sum += v
	}

	return sum
}
