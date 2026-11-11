export type ProfilerEntry = {
	children: ProfilerEntry[]
	delta: number
	deltaMean: number
	deltaMedian: number
	name: string
	selfDelta: number
	selfDeltaMean: number
	selfDeltaMedian: number
}
