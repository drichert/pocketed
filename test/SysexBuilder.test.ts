import SysexBuilder from "../src/SysexBuilder"
import { describe, expect, it, test } from "@jest/globals"

describe("SysexBuilder", () => {
	describe("load", () => {
		it("loads the config", async () => {
			const builder = await SysexBuilder.load("test")

			expect(builder).toBeInstanceOf(SysexBuilder)
			expect(builder.getConfig().presetNumber).toBe(111)
		})
	})

	describe("getConfig", () => {
		it("returns the config", () => {
			const builder = new SysexBuilder()

			expect(builder.getConfig().presetNumber).toBe(0)
		})
	})

	describe("singleStore", () => {
		it("appends sysex bytes to store the preset", () => {
			const builder = new SysexBuilder()

			builder.singleStore()

			expect(builder.getBytes().length).toBe(9)

			expect(Array.from(builder.getBytes())).toEqual([
				0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, 0x00, 0x00, 0xF7
			])
		})
	})

	describe("singleDump", () => {
		it("appends sysex bytes for knob settings", async () => {
			const builder = await SysexBuilder.load("test")

			builder.singleDump()

			expect(builder.getBytes().length).toBe(58)
		})
	})

	describe("clearBytes", () => {
		it("empties the bytes array", async () => {
			const builder = await SysexBuilder.load("test")

			builder.singleDump()

			expect(builder.getBytes().length).not.toEqual(0)

			builder.clearBytes()

			expect(builder.getBytes().length).toEqual(0)
		})
	})
})