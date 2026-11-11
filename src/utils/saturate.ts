/** Clamp a number to the unit interval. */
export function saturate(x: number): number {
	return Math.min(Math.max(x, 0), 1)
}
