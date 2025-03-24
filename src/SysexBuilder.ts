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

	//getBytes(): number[] {
	getBytes(): Uint8Array {
		return Uint8Array.from(this.bytes)
	}

	singleDump() {
		this.bytes = this.bytes.concat([
			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.presetNumber, 0x00, 0xF7
		])

		const zeros = (n: number = 16): Uint8Array => {
			return Uint8Array.from(Array(n).fill(0x00))
		}

		// Master channel by default
		const channelBytes = Uint8Array.from(zeros())

		// CC by default
		const eventTypeBytes = Uint8Array.from(zeros())

		const eventArgumentBytes = Uint8Array.from(zeros())

		for (const knobSettings of this.config.knobs) {
			this.setKnob(knobSettings)

			//console.log("KNOB", knob)
			//const ndx = knob.number - 1

			//channelBytes[ndx] = knob.channel || 0x00

			//if (knob.nrpn) {
			//	eventTypeBytes[ndx] = EventTypes.NRPN0_MSB
			//	eventArgumentBytes[ndx] = knob.nrpn
			//} else if (knob.cc) {
			//	eventTypeBytes[ndx] = EventTypes.CONTROLLER
			//	eventArgumentBytes[ndx] = knob.cc
			//} else {
			//	throw new Error('Invalid knob configuration')
			//}
		}

		this.bytes = this.bytes.concat(
			Array.from(channelBytes),
			Array.from(eventTypeBytes),
			Array.from(eventArgumentBytes)
		)

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

	setKnob(
		knobNumber: number,
		channel: number = 0,
		cc: number | null = null,
		nrpn: number | null = null
	) {
		const ndx = knobNumber - 1
		const channelNdx = ndx + 9
		const eventTypeNdx = ndx + 25
		const eventArgumentNdx = ndx + 41

		if (!(cc || nrpn)) {
			throw new Error('Invalid knob configuration')
		}

		this.bytes[channelNdx] = channel
		this.bytes[eventTypeNdx] = cc ? EventTypes.CONTROLLER : EventTypes.NRPN0_MSB 
		this.bytes[eventArgumentNdx] = cc || nrpn || 0 // 0?
	}

	render(): Uint8Array {
		this.clearBytes()

		this.singleDump()
		this.singleStore()

		return this.getBytes()
	}
}

export default SysexBuilder