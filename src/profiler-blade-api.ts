import { BladeApi } from '@tweakpane/core'
import type { ProfilerBladeController } from './profiler-blade-controller'
import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'

export class ProfilerBladeApi extends BladeApi<ProfilerBladeController> {
	public get measureHandler(): ProfilerBladeMeasureHandler {
		return this.controller.valueController.measureHandler
	}

	public set measureHandler(measureHandler: ProfilerBladeMeasureHandler) {
		this.controller.valueController.measureHandler = measureHandler
	}

	public measure(name: string, fn: () => void): void {
		this.controller.valueController.measure(name, fn)
	}

	// eslint-disable-next-line ts/promise-function-async -- Forward the original promise without changing its identity or completion timing.
	public measureAsync(name: string, fn: () => Promise<void>): Promise<void> {
		return this.controller.valueController.measureAsync(name, fn)
	}

	// eslint-disable-next-line ts/promise-function-async -- Forward the original promise without changing its identity or completion timing.
	public measureEnd(): Promise<void> {
		return this.controller.valueController.measureEnd()
	}
	public measureStart(name: string): void {
		this.controller.valueController.measureStart(name)
	}
}
