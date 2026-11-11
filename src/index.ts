import type { TpPlugin } from 'tweakpane'
import { ProfilerBladePlugin } from './profiler-blade-plugin'
import pluginCss from './styles/plugin.scss?inline'

export type { ProfilerBladeApi } from './profiler-blade-api'
// TODO evaluate need for these exports
export { ProfilerBladeDefaultMeasureHandler } from './profiler-blade-default-measure-handler'
export type { ProfilerBladeMeasureHandler } from './profiler-blade-measure-handler'
export { ProfilerBladePlugin } from './profiler-blade-plugin'

export const id = 'profiler'

export const css: string = pluginCss

export const plugins: TpPlugin[] = [ProfilerBladePlugin]

export { ProfilerBladePlugin as plugin } from './profiler-blade-plugin'
export type { ProfilerBladePluginParams } from './profiler-blade-plugin-params'
