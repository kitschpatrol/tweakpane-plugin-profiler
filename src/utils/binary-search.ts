// Adapted from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers

/**
 * Find the first index of a value in a sorted array using binary search.
 *
 * @param array A sorted array
 * @param element The value to look for
 *
 * @returns The index of the first element equal to `element`. If there is no
 *   equal element, the index where `element` would be inserted to keep the
 *   array sorted, which is `array.length` when it is larger than every
 *   element.
 */
export function binarySearch<T>(array: ArrayLike<T>, element: T): number
/**
 * Find the first index in a sorted array for which a predicate returns `false`
 * using binary search.
 *
 * @param array A sorted array
 * @param compare Return `true` when the target lies to the right of the given
 *   element, and `false` when it is the given element or lies to its left.
 *
 * @returns The first index for which `compare` returns `false`, or
 *   `array.length` when it returns `true` for every element.
 */
export function binarySearch<T>(array: ArrayLike<T>, compare: (element: T) => boolean): number
/** Search with either a comparison callback or a target value. */
export function binarySearch<T>(
	array: ArrayLike<T>,
	elementOrCompare: ((element: T) => boolean) | T,
): number {
	if (typeof elementOrCompare !== 'function') {
		// eslint-disable-next-line unicorn/no-useless-recursion -- Share the comparator implementation.
		return binarySearch(array, (element) => element < elementOrCompare)
	}

	const compare = elementOrCompare as (element: T) => boolean

	let start = 0
	let end = array.length

	while (start < end) {
		const center = Math.floor((start + end) / 2)
		// The center is always within the array bounds
		const centerElement = array[center] as T

		const compareResult = compare(centerElement)

		if (compareResult) {
			start = center + 1
		} else {
			end = center
		}
	}

	return start
}
