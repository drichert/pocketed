"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventTypes_1 = __importDefault(require("./EventTypes"));
class SysexBuilder {
    constructor() {
        this.bytes = [];
        this.config = {
            presetNumber: 0,
            knobs: [{ number: 1 }]
        };
    }
    static load(configName) {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = new SysexBuilder();
            yield builder.loadConfig(configName);
            return builder;
        });
    }
    clearBytes() {
        return this.bytes = [];
    }
    //setPresetNumber(presetNumber: number): number {
    //	return this.presetNumber = presetNumber
    //}
    singleDump() {
        this.bytes = this.bytes.concat([
            0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.presetNumber, 0x00, 0xF7
        ]);
        // Master channel by default
        const channelBytes = Array(16).fill(0x00);
        // CC by default
        const eventTypeBytes = Array(16).fill(EventTypes_1.default.CONTROLLER);
        const eventArgumentBytes = Array(16).fill(0x00);
        for (const knob of this.config.knobs) {
            const ndx = knob.number - 1;
            channelBytes[ndx] = knob.channel || 0x00;
            if (knob.nrpn) {
                eventTypeBytes[ndx] = EventTypes_1.default.NRPN0_MSB;
                eventArgumentBytes[ndx] = knob.nrpn;
            }
            else if (knob.cc) {
                eventTypeBytes[ndx] = EventTypes_1.default.CONTROLLER;
                eventArgumentBytes[ndx] = knob.cc;
            }
            else {
                throw new Error('Invalid knob configuration');
            }
        }
    }
    singleStore() {
        this.bytes = this.bytes.concat([
            0xF0, 0x00, 0x20, 0x20, 0x14, 0x00, this.config.presetNumber, 0x00, 0xF7
        ]);
    }
    loadConfig(configName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config = yield Promise.resolve(`${`./knob-configs/${configName}.json`}`).then(s => __importStar(require(s)));
        });
    }
}
exports.default = SysexBuilder;
