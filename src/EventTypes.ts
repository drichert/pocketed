const EventTypes = {
	CONTROLLER: 0x00,
	PITCH_BEND: 0x01,
	MONO_AFTERTOUCH: 0x02,
	POLY_AFTERTOUCH: 0x04,

	NRPN0_MSB: 0x10,
	NRPN0_LSB: 0x11,
	// TODO - Add remaining event types
}

export default EventTypes