export class ConsecutiveCacheMap<TKey, TValue> {
	public readonly keySet: Set<TKey>
	public readonly map: Map<TKey, TValue>

	public constructor() {
		this.map = new Map()
		this.keySet = new Set()
	}

	public get(key: TKey): TValue | undefined {
		return this.map.get(key)
	}

	public getOrCreate(key: TKey, create: () => TValue): TValue {
		if (!this.keySet.has(key)) {
			this.keySet.add(key)
		}

		let value = this.map.get(key)
		if (value === null || value === undefined) {
			value = create()
			this.map.set(key, value)
		}

		return value
	}

	public resetUsedSet(): void {
		this.keySet.clear()
	}

	public set(key: TKey, value: TValue): void {
		if (!this.keySet.has(key)) {
			this.keySet.add(key)
		}

		this.map.set(key, value)
	}

	public vaporize(onVaporize?: (entry: [key: TKey, value: TValue]) => void): void {
		for (const [key, value] of this.map) {
			if (this.keySet.has(key)) {
				continue
			}

			this.map.delete(key)
			onVaporize?.([key, value])
		}
	}
}
