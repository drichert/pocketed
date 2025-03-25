import EventTypes from './EventTypes'

export type KnobConfig = {
	number: number,
	channel: number,
	cc?: number
	nrpn?: number
}

type SysexBuilderConfig = {
	preset: number
	knobs: KnobConfig[]
}

export class SysexBuilder {
	configPath: string = `${__dirname}/../knob-configs`

	private bytes: number[] = []

	private config: SysexBuilderConfig = {
		preset: 0,
		knobs: []
	}

	static async load(configName: string) {
		const builder = new SysexBuilder()

		await builder.loadConfig(configName)

		return builder
	}

	constructor() {
		this.initSingleDump()
		this.singleStore()
	}

	clearBytes(): number[] {
		return this.bytes = []
	}

	getConfig(): SysexBuilderConfig {
		return this.config
	}

	getBytes(): Uint8Array {
		return Uint8Array.from(this.bytes)
	}

	initSingleDump() {
		this.bytes = this.bytes.concat([
			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, 0x20, this.config.preset, 0x00
		])

		const zeros = (n: number = 16): Uint8Array => {
			return Uint8Array.from(Array(n).fill(0x00))
		}

		// Master channel by default
		const channelBytes = Uint8Array.from(zeros())

		// CC by default
		const eventTypeBytes = Uint8Array.from(zeros())

		const eventArgumentBytes = Uint8Array.from(zeros())

		this.bytes = this.bytes.concat(
			Array.from(channelBytes),
			Array.from(eventTypeBytes),
			Array.from(eventArgumentBytes)
		)

		this.bytes.push(0xF7)

		for (const knobSettings of this.config.knobs) {
			this.setKnob(knobSettings)
		}
	}

	singleStore() {
		this.bytes = this.bytes.concat([
			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.preset, 0x00, 0xF7
		])
	}

	async loadConfig(configName: string): Promise<SysexBuilderConfig> {
		this.config = await import(`${this.configPath}/${configName}.json`)

		for (const knobSettings of this.config.knobs) {
			this.setKnob(knobSettings)
		}

		return this.config
	}

	setKnob(knobConfig: KnobConfig) {
		this.validateKnobNumber(knobConfig.number)

		const ndx = knobConfig.number - 1
		const channelNdx = ndx + 9
		const eventTypeNdx = ndx + 26
		const eventArgumentNdx = ndx + 42

		if (!(knobConfig.cc || knobConfig.nrpn)) {
			throw new Error('Invalid knob configuration')
		}

		this.bytes[channelNdx] = knobConfig.channel
		this.bytes[eventTypeNdx] = knobConfig.cc ?
			EventTypes.CONTROLLER : EventTypes.NRPN0_MSB 
		this.bytes[eventArgumentNdx] = knobConfig.cc || knobConfig.nrpn || 0 // 0?
	}

	getKnob(knobNumber: number): KnobConfig {
		this.validateKnobNumber(knobNumber)

		// TODO add constants for offsets
		const ndx = knobNumber - 1
		const channelNdx = ndx + 9
		const eventTypeNdx = ndx + 26
		const eventArgumentNdx = ndx + 42

		const isCC = this.bytes[eventTypeNdx] === EventTypes.CONTROLLER
		const isNRPN = this.bytes[eventTypeNdx] === EventTypes.NRPN0_MSB

		return {
			number: knobNumber,
			channel: this.bytes[channelNdx] || 0,
			...(isCC ? { cc: this.bytes[eventArgumentNdx] } : {}),
			...(isNRPN ? { nrpn: this.bytes[eventArgumentNdx] } : {})
		}
	}

	//render(): Uint8Array {
	//	this.clearBytes()

	//	this.singleDump()
	//	this.singleStore()

	//	return this.getBytes()
	//}

	dump(): Buffer {
		return Buffer.from(this.getBytes())
	}

	private validateKnobNumber(knobNumber: number) {
		if (knobNumber < 1 || knobNumber > 16) {
			throw new Error('Invalid knob number')
		}
	}
}