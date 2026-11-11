import type { BaseBladeParams } from '@tweakpane/core'
import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'

export type ProfilerBladePluginParams = BaseBladeParams & {
	bufferSize?: number
	calcMode?: 'frame' | 'mean' | 'median'
	deltaUnit?: string
	fractionDigits?: number
	interval?: number
	label?: string
	measureHandler?: ProfilerBladeMeasureHandler
	targetDelta?: number
	view: 'profiler'
}
