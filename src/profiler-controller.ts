import type { Controller, Ticker, ViewProps } from '@tweakpane/core'
import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'
import type { ProfilerControllerConfig } from './profiler-controller-config'
import type { ProfilerEntry } from './profiler-entry'
import { ProfilerView } from './profiler-view'
import { arrayClear } from './utils/array-clear'
import { arraySum } from './utils/array-sum'
import { ConsecutiveCacheMap } from './utils/consecutive-cache-map'
import { HistoryMeanCalculator } from './utils/history-mean-calculator'
import { HistoryPercentileCalculator } from './utils/history-percentile-calculator'

type CalcCache = {
	childrenCacheMap: ConsecutiveCacheMap<string, CalcCache>
	childrenPromiseDelta: Array<Promise<number>>
	latest: number
	meanCalc: HistoryMeanCalculator
	measureEnd: (() => number | Promise<number>) | null
	medianCalc: HistoryPercentileCalculator
}

export class ProfilerController implements Controller<ProfilerView> {
	public bufferSize: number
	public measureHandler: ProfilerBladeMeasureHandler

	public targetDelta: number
	public readonly view: ProfilerView
	public readonly viewProps: ViewProps
	private readonly rootCalcCache_: CalcCache
	private readonly rootCalcCacheStack_: CalcCache[]

	private readonly ticker_: Ticker

	public constructor(doc: Document, config: ProfilerControllerConfig) {
		this.targetDelta = config.targetDelta
		this.bufferSize = config.bufferSize

		this.onTick_ = this.onTick_.bind(this)

		this.ticker_ = config.ticker
		this.ticker_.emitter.on('tick', this.onTick_)

		this.viewProps = config.viewProps

		this.view = new ProfilerView(doc, {
			calcMode: config.calcMode,
			deltaUnit: config.deltaUnit,
			fractionDigits: config.fractionDigits,
			targetDelta: this.targetDelta,
			viewProps: this.viewProps,
		})

		this.viewProps.handleDispose(() => {
			this.ticker_.dispose()
		})

		this.measureHandler = config.measureHandler

		this.rootCalcCache_ = this.createNewEntryCalcCache_()
		this.rootCalcCacheStack_ = [this.rootCalcCache_]
	}

	public measure(name: string, fn: () => void): void {
		this.measureStart(name)
		fn()
		void this.measureEnd()
	}

	public async measureAsync(name: string, fn: () => Promise<void>): Promise<void> {
		this.measureStart(name)
		await fn()
		void this.measureEnd()
	}

	public async measureEnd(): Promise<void> {
		const calcCache = this.rootCalcCacheStack_.at(-1)
		const parentCalcCache = this.rootCalcCacheStack_.at(-2)
		if (calcCache === undefined || parentCalcCache === undefined) {
			throw new Error('Profiler measureEnd() was called without a matching measureStart().')
		}

		const promiseDelta = Promise.resolve(calcCache.measureEnd!())
		calcCache.measureEnd = null
		parentCalcCache.childrenPromiseDelta.push(promiseDelta)

		this.rootCalcCacheStack_.pop()
		calcCache.childrenCacheMap.vaporize()

		const children = await Promise.all(calcCache.childrenPromiseDelta)
		const sumChildrenDelta = arraySum(children)
		const selfDelta = (await promiseDelta) - sumChildrenDelta

		calcCache.meanCalc.push(selfDelta)
		calcCache.medianCalc.push(selfDelta)
		calcCache.latest = selfDelta
	}

	public measureStart(name: string): void {
		const parentCalcCache = this.rootCalcCacheStack_.at(-1) ?? this.rootCalcCache_
		const calcCache = parentCalcCache.childrenCacheMap.getOrCreate(name, () =>
			this.createNewEntryCalcCache_(),
		)
		calcCache.childrenCacheMap.resetUsedSet()
		arrayClear(calcCache.childrenPromiseDelta)
		this.rootCalcCacheStack_.push(calcCache)

		calcCache.measureEnd = this.measureHandler.measureStart()
	}

	public renderEntry(): ProfilerEntry {
		return this.renderEntryFromCalcCache_('', this.rootCalcCache_)
	}

	private createNewEntryCalcCache_(): CalcCache {
		return {
			childrenCacheMap: new ConsecutiveCacheMap(),
			childrenPromiseDelta: [],
			latest: 0,
			meanCalc: new HistoryMeanCalculator(this.bufferSize),
			measureEnd: null,
			medianCalc: new HistoryPercentileCalculator(this.bufferSize),
		}
	}

	private onTick_(): void {
		this.view.update(this.renderEntry())
	}

	private renderEntryFromCalcCache_(name: string, calcCache: CalcCache): ProfilerEntry {
		const children: ProfilerEntry[] = []
		for (const childName of calcCache.childrenCacheMap.keySet) {
			const child = calcCache.childrenCacheMap.get(childName)!
			children.push(this.renderEntryFromCalcCache_(childName, child))
		}

		const selfDelta = calcCache.latest
		const selfDeltaMean = calcCache.meanCalc.mean
		const selfDeltaMedian = calcCache.medianCalc.median

		const childrenDeltaSum = arraySum(children.map((child) => child.delta))
		const childrenDeltaMeanSum = arraySum(children.map((child) => child.deltaMean))
		const childrenDeltaMedianSum = arraySum(children.map((child) => child.deltaMedian))

		const delta = selfDelta + childrenDeltaSum
		const deltaMean = selfDeltaMean + childrenDeltaMeanSum
		const deltaMedian = selfDeltaMedian + childrenDeltaMedianSum

		/* eslint-disable perfectionist/sort-objects -- Preserve the field order of serialized public profiler entries. */
		return {
			name,
			delta,
			deltaMean,
			deltaMedian,
			selfDelta,
			selfDeltaMean,
			selfDeltaMedian,
			children,
		}
		/* eslint-enable perfectionist/sort-objects */
	}
}
