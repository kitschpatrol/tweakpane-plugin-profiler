import type { Ticker } from '@tweakpane/core'
import { Constants, IntervalTicker, ManualTicker } from '@tweakpane/core'

/** Create a ticker for the provided document. */
export function createTicker(document: Document, interval: number | undefined): Ticker {
	return interval === 0
		? new ManualTicker()
		: new IntervalTicker(document, interval ?? Constants.monitor.defaultInterval)
}
