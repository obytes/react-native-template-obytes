/**
 * JStyle Packet Builder
 * Constructs 16-byte command packets with CRC for the JStyle ring protocol
 *
 * Based on: com.jstyle.blesdk2301.Util.BleSDK
 */

// Command constants from DeviceConst.java (blesdk_2301)
// IMPORTANT: These values are directly from the original JStyle Android SDK
export const CMD = {
  // Basic commands
  SET_TIME: 0x01, // SetDeviceTime / Handshake
  GET_TIME: 0x41, // GetDeviceTime
  SET_USER_INFO: 0x02, // SetPersonalInfo
  GET_USER_INFO: 0x42, // GetPersonalInfo

  // Data sync commands (0x5x range)
  GET_TOTAL_DATA: 0x51, // Total activity data
  GET_DETAIL_DATA: 0x52, // Detail activity data
  GET_SLEEP_DATA: 0x53, // Sleep data
  GET_HEART_DATA: 0x54, // Dynamic HR
  GET_ONCE_HEART_DATA: 0x55, // Static HR
  GET_HRV_TEST_DATA: 0x56, // HRV data

  // Device info commands
  ENABLE_ACTIVITY: 0x09, // Real-time step
  GET_BATTERY_LEVEL: 0x13, // Battery
  GET_VERSION: 0x27, // Device version
  GET_ADDRESS: 0x22, // MAC address

  // Other commands
  RESET: 0x12, // Reset device
  MCU_RESET: 0x2e, // MCU Reset
  SET_AUTO: 0x2a, // Set automatic settings
  GET_AUTO: 0x2b, // Get automatic settings

  // Temperature and SpO2
  READ_TEMP_HISTORY: 0x62, // Temperature history
  GET_SPO2_DATA: 0x66, // Automatic SpO2 monitoring
} as const;

// Mode constants
export const MODE: {
  READ_START: number;
  READ_CONTINUE: number;
  DELETE: number;
} = {
  READ_START: 0x00,
  READ_CONTINUE: 0x02,
  DELETE: 0x99,
};

/**
 * Calculate CRC8 checksum for a packet
 * Sum of all bytes except the last one, masked to 0xFF
 */
export function calculateCrc(packet: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < packet.length - 1; i++) {
    crc += packet[i];
  }
  return crc & 0xff;
}

/**
 * Create a 16-byte packet buffer with CRC
 */
export function createPacket(cmd: number, data: number[] = []): Uint8Array {
  const packet = new Uint8Array(16);
  packet[0] = cmd;

  // Fill in data bytes
  for (let i = 0; i < data.length && i < 14; i++) {
    packet[i + 1] = data[i];
  }

  // Calculate and set CRC as last byte
  packet[15] = calculateCrc(packet);

  return packet;
}

/**
 * Convert a date to BCD-encoded bytes for the packet
 */
function dateToBcd(date: Date): number[] {
  const year = date.getFullYear() % 100; // Last 2 digits
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // Convert to BCD format
  return [
    Number.parseInt(year.toString(), 10),
    Number.parseInt(month.toString(), 10),
    Number.parseInt(day.toString(), 10),
    Number.parseInt(hour.toString(), 10),
    Number.parseInt(minute.toString(), 10),
    Number.parseInt(second.toString(), 10),
  ];
}

/**
 * Packet builder for specific commands
 */
export const PacketBuilder = {
  /**
   * CMD 0x01: Set device time
   */
  setDeviceTime(date: Date = new Date()): Uint8Array {
    const bcd = dateToBcd(date);

    // Get timezone offset
    const tzOffset = date.getTimezoneOffset() / -60;
    const tzByte = tzOffset >= 0 ? tzOffset + 0x80 : Math.abs(tzOffset);

    const data = [...bcd, 0, tzByte];
    return createPacket(CMD.SET_TIME, data);
  },

  /**
   * CMD 0x41: Get device time
   */
  getDeviceTime(): Uint8Array {
    return createPacket(CMD.GET_TIME);
  },

  /**
   * CMD 0x02: Set personal info
   */
  setPersonalInfo({
    gender,
    age,
    height,
    weight,
    stepLength = 70,
  }: {
    gender: number;
    age: number;
    height: number;
    weight: number;
    stepLength?: number;
  }): Uint8Array {
    return createPacket(CMD.SET_USER_INFO, [
      gender,
      age,
      height,
      weight,
      stepLength,
    ]);
  },

  /**
   * CMD 0x42: Get personal info
   */
  getPersonalInfo(): Uint8Array {
    return createPacket(CMD.GET_USER_INFO);
  },

  /**
   * CMD 0x52: Get detail activity data
   */
  getDetailActivityData(
    mode: number = MODE.READ_START,
    deltaDate?: Date,
  ): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_DETAIL_DATA, data);
  },

  /**
   * CMD 0x53: Get detail sleep data
   */
  getDetailSleepData(
    mode: number = MODE.READ_START,
    deltaDate?: Date,
  ): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_SLEEP_DATA, data);
  },

  /**
   * CMD 0x54: Get dynamic heart rate data
   */
  getDynamicHR(mode: number = MODE.READ_START, deltaDate?: Date): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_HEART_DATA, data);
  },

  /**
   * CMD 0x51: Get total activity data
   */
  getTotalActivityData(
    mode: number = MODE.READ_START,
    deltaDate?: Date,
  ): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_TOTAL_DATA, data);
  },

  /**
   * CMD 0x09: Enable/disable real-time step
   */
  realTimeStep(enable: boolean, tempEnable: boolean = false): Uint8Array {
    return createPacket(CMD.ENABLE_ACTIVITY, [
      enable ? 1 : 0,
      tempEnable ? 1 : 0,
    ]);
  },

  /**
   * CMD 0x13: Get device battery level
   */
  getBatteryLevel(): Uint8Array {
    return createPacket(CMD.GET_BATTERY_LEVEL);
  },

  /**
   * CMD 0x27: Get device version
   */
  getDeviceVersion(): Uint8Array {
    return createPacket(CMD.GET_VERSION);
  },

  /**
   * CMD 0x22: Get device MAC address
   */
  getDeviceMacAddress(): Uint8Array {
    return createPacket(CMD.GET_ADDRESS);
  },

  /**
   * CMD 0x55: Get static (once) heart rate data
   */
  getStaticHR(mode: number = MODE.READ_START, deltaDate?: Date): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_ONCE_HEART_DATA, data);
  },

  /**
   * CMD 0x56: Get HRV test data
   */
  getHRVData(mode: number = MODE.READ_START, deltaDate?: Date): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_HRV_TEST_DATA, data);
  },

  /**
   * CMD 0x66: Get automatic SpO2 monitoring data
   */
  getSpO2Data(mode: number = MODE.READ_START, deltaDate?: Date): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.GET_SPO2_DATA, data);
  },

  /**
   * CMD 0x62: Get temperature history data
   */
  getTemperatureData(
    mode: number = MODE.READ_START,
    deltaDate?: Date,
  ): Uint8Array {
    const data = [mode, 0, 0];
    if (deltaDate) {
      const bcd = dateToBcd(deltaDate);
      data.push(...bcd);
    }
    return createPacket(CMD.READ_TEMP_HISTORY, data);
  },

  /**
   * CMD 0x12: Reset device
   */
  reset(): Uint8Array {
    return createPacket(CMD.RESET);
  },

  /**
   * CMD 0x2e: MCU Reset
   */
  mcuReset(): Uint8Array {
    return createPacket(CMD.MCU_RESET);
  },
};

export default PacketBuilder;
