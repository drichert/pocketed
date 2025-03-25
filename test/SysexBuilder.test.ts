import { SysexBuilder, KnobConfig } from "../src/SysexBuilder"
import { describe, expect, it } from "@jest/globals"

describe("SysexBuilder", () => {
	describe("instantiation", () => {
		it("creates a new instance", () => {
			const builder = new SysexBuilder()

			expect(builder).toBeInstanceOf(SysexBuilder)
		})

		it("initializes the bytes array", () => {
			const builder = new SysexBuilder()

			expect(builder.getBytes()).toBeInstanceOf(Uint8Array)
			expect(builder.getBytes().length).toEqual(67)
		})
	})

	describe("load", () => {
		it("loads the config", async () => {
			const builder = await SysexBuilder.load("test")

			expect(builder).toBeInstanceOf(SysexBuilder)
			expect(builder.getConfig().preset).toBe(111)
		})
	})

	describe("getConfig", () => {
		it("returns the config", () => {
			const builder = new SysexBuilder()

			expect(builder.getConfig().preset).toBe(0)
		})
	})

	//describe("singleStore", () => {
	//	it("appends sysex bytes to store the preset", () => {
	//		const builder = new SysexBuilder()

	//		builder.singleStore()

	//		expect(builder.getBytes().length).toBe(9)

	//		expect(Array.from(builder.getBytes())).toEqual([
	//			0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, 0x00, 0x00, 0xF7
	//		])
	//	})
	//})

	//describe("singleDump", () => {
	//	it("appends sysex bytes for knob settings", async () => {
	//		const builder = await SysexBuilder.load("test")

	//		builder.singleDump()

	//		expect(builder.getBytes().length).toBe(58)
	//	})
	//})

	describe("clearBytes", () => {
		it("empties the bytes array", async () => {
			const builder = await SysexBuilder.load("test")

			//builder.singleDump()

			expect(builder.getBytes().length).toBeGreaterThan(0)

			builder.clearBytes()

			expect(builder.getBytes().length).toEqual(0)
		})
	})

	describe("setKnob", () => {
		it("throws on invalid knob number", async () => {
			const builder = await SysexBuilder.load("test")

			expect(() => builder.getKnob(0)).toThrow("Invalid knob number")
		})

		it("writes cc knob config to bytes array", () => {
			const builder = new SysexBuilder()

			const knobConfig: KnobConfig = {
				number: 11,
				channel: 7,
				cc: 89
			}

			builder.setKnob(knobConfig)

			const bytes = builder.getBytes()

			expect(bytes[10 + 9]).toBe(7)
			expect(bytes[10 + 26]).toBe(0)
			expect(bytes[10 + 42]).toBe(89)
		})

		it("writes nrpn knob config to bytes array", () => {
			const builder = new SysexBuilder()

			const knobConfig: KnobConfig = {
				number: 12,
				channel: 16,
				nrpn: 77
			}

			builder.setKnob(knobConfig)

			const bytes = builder.getBytes()

			expect(bytes[11 + 9]).toBe(16)
			expect(bytes[11 + 26]).toBe(16)
			expect(bytes[11 + 42]).toBe(77)
		})
	})

	describe("getKnob", () => {
		it("throws on invalid knob number", async () => {
			const builder = await SysexBuilder.load("test")

			expect(() => builder.getKnob(0)).toThrow("Invalid knob number")
		})

		it("reads knob config from bytes array", async () => {
			const builder = await SysexBuilder.load("test")

			expect(builder.getKnob(1)).toEqual({
				number: 1,
				channel: 1,
				cc: 22
			})

			expect(builder.getKnob(6)).toEqual({
				number: 6,
				channel: 12,
				nrpn: 88
			})
		})
	})
})
