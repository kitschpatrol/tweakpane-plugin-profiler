import type { Blade, LabelProps } from '@tweakpane/core'
import type { ProfilerController } from './profiler-controller'

export type ProfilerBladeControllerConfig = {
	blade: Blade
	labelProps: LabelProps
	valueController: ProfilerController
}
