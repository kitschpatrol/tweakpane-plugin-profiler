import { saturate } from './saturate'

/** Convert normalized RGB components to a CSS color string. */
export function rgbArrayToCssString(array: number[]): string {
	const arrayPrepared = array.map((v) => saturate(v) * 256)
	return `rgb( ${arrayPrepared.join(', ')} )`
}
