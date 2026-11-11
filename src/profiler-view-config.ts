import type { ViewProps } from '@tweakpane/core'

export type ProfilerViewConfig = {
	calcMode: 'frame' | 'mean' | 'median'
	deltaUnit: string
	fractionDigits: number
	targetDelta: number
	viewProps: ViewProps
}
