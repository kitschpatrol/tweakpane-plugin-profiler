import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'

export class ProfilerBladeDefaultMeasureHandler implements ProfilerBladeMeasureHandler {
	public measureStart(): () => number {
		const begin = performance.now()
		return () => performance.now() - begin
	}
}
