import EventTypes from './EventTypes'

type SysexBuilderConfig = {
	presetNumber: number
	knobs: [
		{
			number: number,
			channel?: number,
			cc?: number
			nrpn?: number
		}
	]
}

class SysexBuilder {
	private bytes: number[] = []

	private config: SysexBuilderConfig = {
		presetNumber: 0,
		knobs: [{ number: 1 }]
	}

	static async load(configName: string) {
		const builder = new SysexBuilder()

		await builder.loadConfig(configName)

		return builder
	}

	clearBytes(): number[] {
		return this.bytes = []
	}

	//setPresetNumber(presetNumber: number): number {
	//	return this.presetNumber = presetNumber
	//}
	getConfig(): SysexBuilderConfig {
		return this.config
	}

	getBytes(): number[] {
		return this.bytes
	}

	singleDump() {
		this.bytes = this.bytes.concat([
			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.presetNumber, 0x00, 0xF7
		])

		// Master channel by default
		const channelBytes = Array(16).fill(0x00)

		// CC by default
		const eventTypeBytes = Array(16).fill(EventTypes.CONTROLLER)

		const eventArgumentBytes = Array(16).fill(0x00)

		for (const knob of this.config.knobs) {
			console.log("KNOB", knob)
			const ndx = knob.number - 1

			channelBytes[ndx] = knob.channel || 0x00

			if (knob.nrpn) {
				eventTypeBytes[ndx] = EventTypes.NRPN0_MSB
				eventArgumentBytes[ndx] = knob.nrpn
			} else if (knob.cc) {
				eventTypeBytes[ndx] = EventTypes.CONTROLLER
				eventArgumentBytes[ndx] = knob.cc
			} else {
				throw new Error('Invalid knob configuration')
			}
		}

		this.bytes = this.bytes.concat(channelBytes, eventTypeBytes, eventArgumentBytes)
		this.bytes.push(0xF7)
	}

	singleStore() {
		this.bytes = this.bytes.concat([
			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.presetNumber, 0x00, 0xF7
		])
	}

	async loadConfig(configName: string): Promise<SysexBuilderConfig> {
		return this.config = await import(`../knob-configs/${configName}.json`)
	}
}

export default SysexBuilder