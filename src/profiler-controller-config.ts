import type { Ticker, ViewProps } from '@tweakpane/core'
import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'

export type ProfilerControllerConfig = {
	bufferSize: number
	calcMode: 'frame' | 'mean' | 'median'
	deltaUnit: string
	fractionDigits: number
	measureHandler: ProfilerBladeMeasureHandler
	targetDelta: number
	ticker: Ticker
	viewProps: ViewProps
}
