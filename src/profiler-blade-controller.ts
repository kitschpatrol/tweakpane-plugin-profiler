import type { LabelView } from '@tweakpane/core'
import { BladeController, LabelController } from '@tweakpane/core'
import type { ProfilerBladeControllerConfig } from './profiler-blade-controller-configs'
import type { ProfilerController } from './profiler-controller'

export class ProfilerBladeController extends BladeController<LabelView> {
	public readonly labelController: LabelController<ProfilerController>
	public readonly valueController: ProfilerController

	public constructor(doc: Document, config: ProfilerBladeControllerConfig) {
		const bc = config.valueController
		const lc = new LabelController(doc, {
			blade: config.blade,
			props: config.labelProps,
			valueController: bc,
		})

		super({
			blade: config.blade,
			view: lc.view,
			viewProps: bc.viewProps,
		})

		this.valueController = bc
		this.labelController = lc
	}
}
