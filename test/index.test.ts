import { Pane } from 'tweakpane'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ProfilerBladeMeasureHandler } from '../src/index'
import * as plugin from '../src/index'
import { ProfilerBladeApi } from '../src/profiler-blade-api'

type Clock = { now: number }

const rgbColorPattern = /^rgb\(/u

/** A measure handler that reads a clock the test advances by hand. */
function createClockHandler(clock: Clock): ProfilerBladeMeasureHandler {
	return {
		measureStart() {
			const begin = clock.now
			return () => clock.now - begin
		},
	}
}

/** Let measurements started with the synchronous API settle. */
async function settleMeasurements(): Promise<void> {
	await new Promise((resolve) => {
		setTimeout(resolve, 0)
	})
}

describe('profiler plugin', () => {
	let pane: Pane | undefined

	afterEach(() => {
		pane?.dispose()
		pane = undefined
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	function setup(params: Record<string, unknown> = {}) {
		pane = new Pane()
		pane.registerPlugin(plugin)
		const blade = pane.addBlade({ interval: 0, ...params, view: 'profiler' })
		if (!(blade instanceof ProfilerBladeApi)) {
			throw new TypeError('The profiler blade API was not created')
		}

		const { element } = blade
		const label = element.querySelector('.tp-profilerv_label')
		const tooltip = element.querySelector<HTMLElement>('.tp-profilerv_tooltip')
		if (!label || !tooltip) {
			throw new Error('The profiler view was not created')
		}

		return { blade, element, label, pane, tooltip }
	}

	function getEntryWidths(element: HTMLElement) {
		return Array.from(element.querySelectorAll('.tp-profilerv_entry'), (entry) =>
			entry.querySelector('rect')?.getAttribute('width'),
		)
	}

	describe('parameters', () => {
		it('accepts only profiler blades with valid parameters', () => {
			const measureHandler = createClockHandler({ now: 0 })
			expect(plugin.plugin.accept({ view: 'profiler' })?.params.view).toBe('profiler')
			expect(
				plugin.plugin.accept({
					calcMode: 'median',
					measureHandler,
					targetDelta: 8,
					view: 'profiler',
				})?.params,
			).toMatchObject({ calcMode: 'median', measureHandler, targetDelta: 8 })
			expect(plugin.plugin.accept({})).toBeNull()
			expect(plugin.plugin.accept({ view: 'another-blade' })).toBeNull()
			expect(plugin.plugin.accept({ calcMode: 'percentile', view: 'profiler' })).toBeNull()
			expect(plugin.plugin.accept({ targetDelta: '16', view: 'profiler' })).toBeNull()
			expect(plugin.plugin.accept({ measureHandler: {}, view: 'profiler' })).toBeNull()
		})

		it('warns about legacy measure handlers only for profiler blades', () => {
			const warn = vi.spyOn(console, 'warn').mockReturnValue(undefined)
			const legacyHandler = { measure: () => 0 }
			expect(
				plugin.plugin.accept({ measureHandler: legacyHandler, view: 'another-blade' }),
			).toBeNull()
			expect(warn).not.toHaveBeenCalled()
			expect(plugin.plugin.accept({ measureHandler: legacyHandler, view: 'profiler' })).toBeNull()
			expect(warn).toHaveBeenCalledOnce()
		})
	})

	it('registers the bundle and installs its compiled styles', () => {
		const { blade } = setup()
		expect(blade.measureHandler).toBeInstanceOf(plugin.ProfilerBladeDefaultMeasureHandler)
		expect(plugin.css).toContain('.tp-profilerv')
		expect(plugin.css).not.toContain('@use')
		expect(document.head.textContent).toContain('.tp-profilerv')
	})

	describe('view', () => {
		it('renders measured entries on each tick', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, element, label } = setup({
				interval: 100,
				measureHandler: createClockHandler(clock),
				targetDelta: 8,
			})
			expect(label.textContent).toBe('0.00 ms')

			blade.measureStart('update')
			clock.now += 1
			blade.measureStart('render')
			clock.now += 3
			await blade.measureEnd()
			await blade.measureEnd()
			expect(getEntryWidths(element)).toEqual([])

			await vi.advanceTimersByTimeAsync(100)
			expect(label.textContent).toBe('4.00 ms')
			const entries = [...element.querySelectorAll<SVGGElement>('.tp-profilerv_entry')]
			expect(entries.map((entry) => entry.dataset.delta)).toEqual(['4', '3'])
			// The bar scale is 160 / max(targetDelta, total) = 20 pixels per millisecond
			expect(getEntryWidths(element)).toEqual(['79px', '59px'])
			expect(entries[0]?.querySelector('rect')?.getAttribute('fill')).toMatch(rgbColorPattern)
		})

		it('formats deltas with the configured unit and fraction digits', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, label } = setup({
				deltaUnit: 'ticks',
				fractionDigits: 1,
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			expect(label.textContent).toBe('0.0 ticks')
			blade.measureStart('work')
			clock.now += 2.25
			await blade.measureEnd()
			await vi.advanceTimersByTimeAsync(100)
			expect(label.textContent).toBe('2.3 ticks')
		})

		it('shows the hovered entry path and delta in a tooltip', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, element, tooltip } = setup({
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			blade.measureStart('update')
			blade.measureStart('render')
			clock.now += 3
			await blade.measureEnd()
			await blade.measureEnd()
			await vi.advanceTimersByTimeAsync(100)
			expect(tooltip.style.display).toBe('none')

			const renderRect = element.querySelectorAll('.tp-profilerv_entryrect')[1]
			renderRect?.dispatchEvent(new MouseEvent('mouseenter'))
			expect(tooltip.style.display).toBe('block')
			expect(tooltip.textContent).toBe('/update/render\n3.00 ms')

			renderRect?.dispatchEvent(new MouseEvent('mouseleave'))
			expect(tooltip.style.display).toBe('none')
		})

		it('removes entries that are no longer measured and hides their tooltip', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, element, tooltip } = setup({
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			blade.measureStart('update')
			blade.measureStart('render')
			clock.now += 1
			await blade.measureEnd()
			blade.measureStart('physics')
			clock.now += 2
			await blade.measureEnd()
			await blade.measureEnd()
			await vi.advanceTimersByTimeAsync(100)
			expect(element.querySelectorAll('.tp-profilerv_entry')).toHaveLength(3)
			element
				.querySelectorAll('.tp-profilerv_entryrect')[2]
				?.dispatchEvent(new MouseEvent('mouseenter'))
			expect(tooltip.textContent).toBe('/update/physics\n2.00 ms')

			blade.measureStart('update')
			blade.measureStart('render')
			clock.now += 1
			await blade.measureEnd()
			await blade.measureEnd()
			await vi.advanceTimersByTimeAsync(100)
			expect(element.querySelectorAll('.tp-profilerv_entry')).toHaveLength(2)
			expect(tooltip.style.display).toBe('none')
		})

		it.each([
			['frame', '9.00 ms'],
			['mean', '4.00 ms'],
			['median', '2.00 ms'],
		])('displays the %s of recent measurements', async (calcMode, expected) => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, label } = setup({
				calcMode,
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			for (const delta of [1, 2, 9]) {
				blade.measureStart('work')
				clock.now += delta
				await blade.measureEnd()
			}

			await vi.advanceTimersByTimeAsync(100)
			expect(label.textContent).toBe(expected)
		})

		it('limits the history to the buffer size', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, label } = setup({
				bufferSize: 2,
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			for (const delta of [1, 2, 9]) {
				blade.measureStart('work')
				clock.now += delta
				await blade.measureEnd()
			}

			await vi.advanceTimersByTimeAsync(100)
			expect(label.textContent).toBe('5.50 ms')
		})

		it('does not tick automatically when the interval is 0', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, label } = setup({ interval: 0, measureHandler: createClockHandler(clock) })
			expect(vi.getTimerCount()).toBe(0)
			blade.measureStart('work')
			clock.now += 2
			await blade.measureEnd()
			await vi.advanceTimersByTimeAsync(1000)
			expect(label.textContent).toBe('0.00 ms')
		})

		it('inherits the pane disabled state', () => {
			const { element, pane: currentPane } = setup()
			const view = element.querySelector('.tp-profilerv')
			currentPane.disabled = true
			expect(view?.classList.contains('tp-v-disabled')).toBe(true)
			currentPane.disabled = false
			expect(view?.classList.contains('tp-v-disabled')).toBe(false)
		})

		it('stops ticking when the blade is disposed', async () => {
			vi.useFakeTimers()
			const clock = { now: 0 }
			const { blade, element, label } = setup({
				interval: 100,
				measureHandler: createClockHandler(clock),
			})
			expect(vi.getTimerCount()).toBe(1)
			blade.measureStart('work')
			clock.now += 2
			await blade.measureEnd()

			blade.dispose()
			expect(vi.getTimerCount()).toBe(0)
			await vi.advanceTimersByTimeAsync(500)
			expect(label.textContent).toBe('0.00 ms')
			expect(element.isConnected).toBe(false)
		})
	})

	describe('measurement', () => {
		it('records nested synchronous measurements', async () => {
			const clock = { now: 0 }
			const { blade } = setup({ measureHandler: createClockHandler(clock) })
			const physics = () => {
				clock.now += 2
			}

			const render = () => {
				clock.now += 3
			}

			blade.measure('update', () => {
				clock.now += 1
				blade.measure('physics', physics)
				blade.measure('render', render)
			})
			await settleMeasurements()

			const [update] = blade.controller.valueController.renderEntry().children
			expect(update).toMatchObject({ delta: 6, name: 'update', selfDelta: 1 })
			expect(update?.children.map(({ delta, name }) => ({ delta, name }))).toEqual([
				{ delta: 2, name: 'physics' },
				{ delta: 3, name: 'render' },
			])
		})

		it('records asynchronous measurements', async () => {
			const clock = { now: 0 }
			const { blade } = setup({ measureHandler: createClockHandler(clock) })
			await blade.measureAsync('load', async () => {
				clock.now += 4
				await Promise.resolve()
				clock.now += 1
			})
			await settleMeasurements()

			const [load] = blade.controller.valueController.renderEntry().children
			expect(load).toMatchObject({ delta: 5, name: 'load' })
		})

		it('uses a measure handler assigned after creation', async () => {
			const { blade } = setup()
			const measureHandler = { measureStart: () => () => 7 }
			blade.measureHandler = measureHandler
			expect(blade.measureHandler).toBe(measureHandler)
			blade.measureStart('work')
			await blade.measureEnd()
			expect(blade.controller.valueController.renderEntry().delta).toBe(7)
		})

		it('measures elapsed performance time by default', () => {
			vi.spyOn(performance, 'now').mockReturnValueOnce(10).mockReturnValueOnce(25)
			const measureEnd = new plugin.ProfilerBladeDefaultMeasureHandler().measureStart()
			expect(measureEnd()).toBe(15)
		})

		it('rejects measureEnd() without a matching measureStart()', async () => {
			const { blade } = setup()
			await expect(blade.measureEnd()).rejects.toThrow(
				'Profiler measureEnd() was called without a matching measureStart().',
			)
		})
	})

	describe('compatibility', () => {
		function setupConstant() {
			return setup({ measureHandler: { measureStart: () => () => 2 } })
		}

		it('preserves the completion timing of asynchronous measurements', async () => {
			const { blade } = setupConstant()
			await blade.measureAsync('immediate', async () => {
				await Promise.resolve()
			})
			expect(blade.controller.valueController.renderEntry().delta).toBe(0)
			await Promise.resolve()
			await Promise.resolve()
			expect(blade.controller.valueController.renderEntry().delta).toBe(2)
		})

		it('preserves the field order of serialized measurement entries', async () => {
			const { blade } = setupConstant()
			blade.measureStart('entry')
			await blade.measureEnd()
			const entry = blade.controller.valueController.renderEntry()
			for (const value of [entry, ...entry.children]) {
				expect(Object.keys(value)).toEqual([
					'name',
					'delta',
					'deltaMean',
					'deltaMedian',
					'selfDelta',
					'selfDeltaMean',
					'selfDeltaMedian',
					'children',
				])
			}
		})

		it('rejects invalid calculation modes assigned by JavaScript consumers', () => {
			const { blade } = setupConstant()
			const controller = blade.controller.valueController
			Reflect.set(controller.view, 'calcMode', 'invalid')
			expect(() => {
				controller.view.update(controller.renderEntry())
			}).toThrow('Unreachable! calcMode must be one of "frame", "mean", or "median"')
		})
	})
})
