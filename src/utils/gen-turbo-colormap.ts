import { dot } from './dot'
import { rgbArrayToCssString } from './rgb-array-to-css-string'
import { saturate } from './saturate'

/**
 * Generate Turbo colormap
 *
 * Adapted from
 * https://gist.github.com/mikhailov-work/0d177465a8151eb6ede1768d51d476c7
 *
 * Copyright 2019 Google LLC. Apache-2.0 License
 */
export function genTurboColormap(x: number): string {
	const v4KRed = [0.13572138, 4.6153926, -42.66032258, 132.13108234]
	const v4KGreen = [0.09140261, 2.19418839, 4.84296658, -14.18503333]
	const v4KBlue = [0.1066733, 12.64194608, -60.58204836, 110.36276771]
	const v2KRed = [-152.94239396, 59.28637943]
	const v2KGreen = [4.27729857, 2.82956604]
	const v2KBlue = [-89.90310912, 27.34824973]

	x = saturate(x)
	const x2 = x * x
	const x3 = x2 * x
	const v4 = [1, x, x2, x3]
	const v2 = [x2 * x2, x3 * x2]
	const color = [
		dot(v4, v4KRed) + dot(v2, v2KRed),
		dot(v4, v4KGreen) + dot(v2, v2KGreen),
		dot(v4, v4KBlue) + dot(v2, v2KBlue),
	]
	return rgbArrayToCssString(color)
}
