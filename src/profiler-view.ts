import type { View } from '@tweakpane/core'
import { ClassName } from '@tweakpane/core'
import type { ProfilerEntry } from './profiler-entry'
import type { ProfilerViewConfig } from './profiler-view-config'
import { ConsecutiveCacheMap } from './utils/consecutive-cache-map'
import { genTurboColormap } from './utils/gen-turbo-colormap'
import { saturate } from './utils/saturate'

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName('profiler')

// Custom view class should implement `View` interface
export class ProfilerView implements View {
	public calcMode: 'frame' | 'mean' | 'median'
	public deltaUnit: string
	public readonly element: HTMLElement
	public fractionDigits: number
	public targetDelta: number
	private readonly entryContainerElement_: SVGGElement
	private readonly entryElementCacheMap_: ConsecutiveCacheMap<string, SVGGElement>
	private hoveringEntry_: null | string
	private readonly labelElement_: HTMLDivElement
	private readonly svgRootElement_: SVGElement
	private readonly tooltipElement_: HTMLDivElement
	private readonly tooltipInsideElement_: HTMLDivElement

	public constructor(doc: Document, config: ProfilerViewConfig) {
		this.targetDelta = config.targetDelta
		this.deltaUnit = config.deltaUnit
		this.fractionDigits = config.fractionDigits
		this.calcMode = config.calcMode

		this.element = doc.createElement('div')
		this.element.classList.add(className())
		config.viewProps.bindClassModifiers(this.element)

		this.svgRootElement_ = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
		this.svgRootElement_.classList.add(className('root'))
		this.element.append(this.svgRootElement_)

		this.entryContainerElement_ = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
		this.entryContainerElement_.classList.add(className('container'))
		this.entryContainerElement_.setAttribute('transform', 'translate( 1, 1 )')
		this.svgRootElement_.append(this.entryContainerElement_)

		this.tooltipElement_ = doc.createElement('div')
		this.tooltipElement_.classList.add(className('tooltip'))
		this.tooltipElement_.style.display = 'none'
		this.element.append(this.tooltipElement_)

		this.tooltipInsideElement_ = doc.createElement('div')
		this.tooltipInsideElement_.classList.add(className('tooltipinside'))
		this.tooltipElement_.append(this.tooltipInsideElement_)

		this.labelElement_ = doc.createElement('div')
		this.labelElement_.classList.add(className('label'))
		this.labelElement_.textContent = this.deltaToDisplayDelta_(0)
		this.element.append(this.labelElement_)

		this.entryElementCacheMap_ = new ConsecutiveCacheMap()

		this.hoveringEntry_ = null
	}

	public update(rootEntry: ProfilerEntry): void {
		const rootEntryDelta = this.entryToDelta_(rootEntry)

		this.labelElement_.textContent = this.deltaToDisplayDelta_(rootEntryDelta)

		this.entryElementCacheMap_.resetUsedSet()

		const unit = 160 / Math.max(this.targetDelta, rootEntryDelta)

		let x = 0
		for (const child of rootEntry.children) {
			const childElement = this.addEntry_(child, '', this.entryContainerElement_, unit)
			childElement.setAttribute('transform', `translate( ${x}, 0 )`)
			x += this.entryToDelta_(child) * unit
		}

		this.entryElementCacheMap_.vaporize(([path, element]) => {
			element.remove()

			if (this.hoveringEntry_ === path) {
				this.hoveringEntry_ = null
			}
		})

		this.updateTooltip_()
	}

	private addEntry_(
		entry: ProfilerEntry,
		parentPath: string,
		parent: SVGElement,
		unit: number,
	): SVGElement {
		const path = `${parentPath}/${entry.name}`

		const g = this.entryElementCacheMap_.getOrCreate(path, () => {
			const newG = document.createElementNS('http://www.w3.org/2000/svg', 'g')
			newG.classList.add(className('entry'))
			parent.append(newG)

			this.entryElementCacheMap_.set(path, newG)

			const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
			rect.classList.add(className('entryrect'))
			newG.append(rect)

			rect.addEventListener('mouseenter', () => {
				this.hoveringEntry_ = path
				this.updateTooltip_()
			})

			rect.addEventListener('mouseleave', () => {
				this.hoveringEntry_ = null
				this.updateTooltip_()
			})

			return newG
		})

		const delta = this.entryToDelta_(entry)

		g.dataset.delta = `${delta}`

		const rect = g.firstChild as SVGRectElement

		rect.setAttribute('width', `${Math.max(0.01, delta * unit - 1)}px`)
		rect.setAttribute('height', `9px`)

		const turboX = 0.15 + 0.7 * saturate(delta / this.targetDelta)
		rect.setAttribute('fill', genTurboColormap(turboX))

		if (entry.children.length > 0) {
			let x = 0
			for (const child of entry.children) {
				const childElement = this.addEntry_(child, path, g, unit)
				childElement.setAttribute('transform', `translate( ${x}, 10 )`)
				x += this.entryToDelta_(child) * unit
			}
		}

		return g
	}

	private deltaToDisplayDelta_(delta: number): string {
		return `${delta.toFixed(this.fractionDigits)} ${this.deltaUnit}`
	}

	private entryToDelta_(entry: ProfilerEntry): number {
		if (this.calcMode === 'frame') {
			return entry.delta
		}

		if (this.calcMode === 'mean') {
			return entry.deltaMean
		}

		// eslint-disable-next-line ts/no-unnecessary-condition -- JavaScript consumers can assign an invalid public calculation mode.
		if (this.calcMode === 'median') {
			return entry.deltaMedian
		}

		throw new Error('Unreachable! calcMode must be one of "frame", "mean", or "median"')
	}

	private updateTooltip_(): void {
		const path = this.hoveringEntry_

		if (path === null || path === '') {
			this.tooltipElement_.style.display = 'none'
		} else {
			const element = this.entryElementCacheMap_.get(path)

			const dataDelta = element?.dataset.delta
			const displayDelta = this.deltaToDisplayDelta_(Number(dataDelta ?? '0.0'))
			const text = `${path}\n${displayDelta}`

			this.tooltipElement_.style.display = 'block'

			this.tooltipInsideElement_.textContent = text
		}
	}
}
