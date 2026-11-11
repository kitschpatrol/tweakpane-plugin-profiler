import type { BladePlugin, LabelPropsObject } from '@tweakpane/core'
import { createPlugin, parseRecord, ValueMap } from '@tweakpane/core'
import type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'
import type { ProfilerBladePluginParams } from './profiler-blade-plugin-params'
import { ProfilerBladeApi } from './profiler-blade-api'
import { ProfilerBladeController } from './profiler-blade-controller'
import { ProfilerBladeDefaultMeasureHandler } from './profiler-blade-default-measure-handler'
import { ProfilerController } from './profiler-controller'
import { createTicker } from './utils/create-ticker'

function parseCalcMode(value: unknown): 'frame' | 'mean' | 'median' | undefined {
	switch (value) {
		case 'frame':
		case 'mean':
		case 'median': {
			return value
		}

		default: {
			return undefined
		}
	}
}

function parseMeasureHandler(value: unknown): ProfilerBladeMeasureHandler | undefined {
	if (typeof value === 'object' && value !== null && 'measureStart' in value) {
		return value as ProfilerBladeDefaultMeasureHandler
	}

	if (typeof value === 'object' && value !== null && 'measure' in value) {
		console.warn(
			'The API of `ProfilerBladeDefaultMeasureHandler` has been changed in v0.4.0! Please define `measureStart` instead of `measure`. Fallback to the default measure handler.',
		)
	}

	return undefined
}

export const ProfilerBladePlugin: BladePlugin<ProfilerBladePluginParams> = createPlugin({
	accept(params: Record<string, unknown>) {
		// Reject other blades before parsing, since parsing the measure handler can log a warning
		if (params.view !== 'profiler') {
			return null
		}

		const result = parseRecord<ProfilerBladePluginParams>(params, (p) => ({
			bufferSize: p.optional.number,
			calcMode: p.optional.custom(parseCalcMode),
			deltaUnit: p.optional.string,
			fractionDigits: p.optional.number,
			interval: p.optional.number,
			label: p.optional.string,
			measureHandler: p.optional.custom(parseMeasureHandler),
			targetDelta: p.optional.number,
			view: p.required.constant('profiler'),
		}))

		return result ? { params: result } : null
	},
	api(args) {
		return args.controller instanceof ProfilerBladeController
			? new ProfilerBladeApi(args.controller)
			: null
	},
	controller(args) {
		const interval = args.params.interval ?? 500
		const targetDelta = args.params.targetDelta ?? 16.67
		const bufferSize = args.params.bufferSize ?? 30
		const deltaUnit = args.params.deltaUnit ?? 'ms'
		const fractionDigits = args.params.fractionDigits ?? 2
		const calcMode = args.params.calcMode ?? 'mean'
		const measureHandler = args.params.measureHandler ?? new ProfilerBladeDefaultMeasureHandler()

		return new ProfilerBladeController(args.document, {
			blade: args.blade,
			labelProps: ValueMap.fromObject<LabelPropsObject>({
				label: args.params.label,
			}),
			valueController: new ProfilerController(args.document, {
				bufferSize,
				calcMode,
				deltaUnit,
				fractionDigits,
				measureHandler,
				targetDelta,
				ticker: createTicker(args.document, interval),
				viewProps: args.viewProps,
			}),
		})
	},
	id: 'profiler',
	type: 'blade',
})
