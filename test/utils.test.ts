import { describe, expect, it } from 'vitest'
import { binarySearch } from '../src/utils/binary-search'
import { ConsecutiveCacheMap } from '../src/utils/consecutive-cache-map'
import { dot } from '../src/utils/dot'
import { genTurboColormap } from '../src/utils/gen-turbo-colormap'
import { HistoryMeanCalculator } from '../src/utils/history-mean-calculator'
import { HistoryPercentileCalculator } from '../src/utils/history-percentile-calculator'

const rgbColorPattern = /^rgb\( ([\d.]+), ([\d.]+), ([\d.]+) \)$/u

describe('binarySearch', () => {
	it('finds the first index of a value or its insertion index', () => {
		expect(binarySearch([1, 2, 2, 3], 2)).toBe(1)
		expect(binarySearch([1, 2, 2, 3], 0)).toBe(0)
		expect(binarySearch([1, 2, 2, 3], 2.5)).toBe(3)
		expect(binarySearch([1, 2, 2, 3], 4)).toBe(4)
		expect(binarySearch([], 1)).toBe(0)
	})

	it('finds the first index where the predicate returns false', () => {
		expect(binarySearch([1, 3, 5, 7], (element) => element < 4)).toBe(2)
		expect(binarySearch([1, 3, 5, 7], () => true)).toBe(4)
		expect(binarySearch([1, 3, 5, 7], () => false)).toBe(0)
	})
})

describe('HistoryMeanCalculator', () => {
	it('averages the most recent values within its window', () => {
		const calculator = new HistoryMeanCalculator(3)
		expect(calculator.mean).toBe(0)
		calculator.push(1)
		calculator.push(2)
		expect(calculator.mean).toBe(1.5)
		calculator.push(3)
		calculator.push(10)
		expect(calculator.mean).toBe(5)
	})

	it('resets to an empty history', () => {
		const calculator = new HistoryMeanCalculator(3)
		calculator.push(4)
		calculator.reset()
		expect(calculator.mean).toBe(0)
		calculator.push(2)
		expect(calculator.mean).toBe(2)
	})
})

describe('HistoryPercentileCalculator', () => {
	it('reports percentiles of the most recent values within its window', () => {
		const calculator = new HistoryPercentileCalculator(3)
		expect(calculator.median).toBe(0)
		calculator.push(5)
		calculator.push(1)
		calculator.push(3)
		expect(calculator.median).toBe(3)
		expect(calculator.percentile(0)).toBe(1)
		expect(calculator.percentile(100)).toBe(5)
		calculator.push(7)
		expect(calculator.percentile(0)).toBe(1)
		expect(calculator.percentile(100)).toBe(7)
		expect(calculator.median).toBe(3)
		calculator.push(9)
		expect(calculator.percentile(0)).toBe(3)
	})

	it('resets to an empty history', () => {
		const calculator = new HistoryPercentileCalculator(3)
		calculator.push(4)
		calculator.reset()
		expect(calculator.median).toBe(0)
	})
})

describe('ConsecutiveCacheMap', () => {
	it('creates values once and vaporizes entries unused since the last reset', () => {
		const map = new ConsecutiveCacheMap<string, number>()
		let created = 0
		const create = () => ++created
		expect(map.getOrCreate('a', create)).toBe(1)
		expect(map.getOrCreate('a', create)).toBe(1)
		map.set('b', 5)

		map.resetUsedSet()
		map.getOrCreate('a', create)
		const vaporized: Array<[string, number]> = []
		map.vaporize((entry) => {
			vaporized.push(entry)
		})
		expect(vaporized).toEqual([['b', 5]])
		expect(map.get('a')).toBe(1)
		expect(map.get('b')).toBeUndefined()
	})
})

describe('color math', () => {
	it('calculates dot products, treating missing elements as zero', () => {
		expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
		expect(dot([1, 2], [3])).toBe(3)
		expect(dot([], [])).toBe(0)
	})

	it('generates clamped Turbo colormap colors', () => {
		expect(genTurboColormap(0)).toMatch(rgbColorPattern)
		expect(genTurboColormap(-1)).toBe(genTurboColormap(0))
		expect(genTurboColormap(2)).toBe(genTurboColormap(1))
		expect(genTurboColormap(0.5)).not.toBe(genTurboColormap(0))
		for (const x of [0, 0.25, 0.5, 0.75, 1]) {
			const components = rgbColorPattern.exec(genTurboColormap(x))?.slice(1).map(Number) ?? []
			expect(components).toHaveLength(3)
			for (const component of components) {
				expect(component).toBeGreaterThanOrEqual(0)
				expect(component).toBeLessThanOrEqual(256)
			}
		}
	})
})
