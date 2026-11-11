export type ProfilerBladeMeasureHandler = {
	measureStart: () => () => number | Promise<number>
}
