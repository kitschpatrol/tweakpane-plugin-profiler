/**
 * Useful for tap tempo
 */
export class HistoryMeanCalculator {
	public get mean(): number {
		const count = Math.min(this.__count, this.__length)
		return count === 0 ? 0 : this.__cache / count
	}
	public get recalcForEach(): number {
		return this.__recalcForEach
	}
	public set recalcForEach(value: number) {
		const delta = value - this.__recalcForEach
		this.__recalcForEach = value
		this.__countUntilRecalc = Math.max(0, this.__countUntilRecalc + delta)
	}
	private __cache = 0
	private __count = 0
	private __countUntilRecalc = 0
	private __history: number[] = []

	private __index = 0

	private readonly __length: number

	private __recalcForEach = 0

	public constructor(length: number) {
		this.__length = length
		this.__recalcForEach = length
		for (let i = 0; i < length; i++) {
			this.__history[i] = 0
		}
	}

	public push(value: number): void {
		const previous = this.__history[this.__index] ?? 0
		this.__history[this.__index] = value
		this.__count++
		this.__index = (this.__index + 1) % this.__length

		if (this.__countUntilRecalc === 0) {
			this.recalc()
		} else {
			this.__countUntilRecalc--
			this.__cache -= previous
			this.__cache += value
		}
	}

	public recalc(): void {
		this.__countUntilRecalc = this.__recalcForEach
		const sum = this.__history
			.slice(0, Math.min(this.__count, this.__length))
			.reduce((sum, v) => sum + v, 0)
		this.__cache = sum
	}

	public reset(): void {
		this.__index = 0
		this.__count = 0
		this.__cache = 0
		this.__countUntilRecalc = 0
		for (let i = 0; i < this.__length; i++) {
			this.__history[i] = 0
		}
	}
}
