import { binarySearch } from './binary-search'

/**
 * Useful for fps calc
 */
export class HistoryPercentileCalculator {
	public get median(): number {
		return this.percentile(50)
	}
	private __history: number[] = []
	private __index = 0
	private readonly __length: number

	private __sorted: number[] = []

	public constructor(length: number) {
		this.__length = length
	}

	public percentile(percentile: number): number {
		return this.__history.length === 0
			? 0
			: (this.__sorted[Math.round(percentile * 0.01 * (this.__history.length - 1))] ?? 0)
	}

	public push(value: number): void {
		const previous = this.__history[this.__index]
		this.__history[this.__index] = value
		this.__index = (this.__index + 1) % this.__length

		// Remove the prev from sorted array
		if (this.__sorted.length === this.__length) {
			const previousIndex = binarySearch(this.__sorted, previous)
			this.__sorted.splice(previousIndex, 1)
		}

		const index = binarySearch(this.__sorted, value)
		this.__sorted.splice(index, 0, value)
	}

	public reset(): void {
		this.__index = 0
		this.__history = []
		this.__sorted = []
	}
}
