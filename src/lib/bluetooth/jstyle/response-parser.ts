/**
 * JStyle Response Parser
 * Parses binary response packets from the JStyle ring
 *
 * Based on: com.jstyle.blesdk2301.other.ResolveUtil
 */

import { CMD } from './packet-builder';

// Response data types
export type BatteryData = {
  level: number;
};

export type DeviceVersionData = {
  version: string;
};

export type DeviceTimeData = {
  deviceTime: string;
  gpsTime?: string;
};

export type SleepDataItem = {
  startTime: string;
  totalSleepTime: number;
  sleepQuality: number[];
  unitLength: number; // 1 = 1 minute, 5 = 5 minutes
};

export type ActivityDataItem = {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  stepsArray: number[];
};

export type HeartRateItem = {
  date: string;
  heartRate: number;
};

export type HRVDataItem = {
  date: string;
  hrv: number;
  vascularAging: number;
  stress: number;
  heartRate: number;
  highBP: number;
  lowBP: number;
};

export type SpO2DataItem = {
  date: string;
  bloodOxygen: number;
};

export type TemperatureDataItem = {
  date: string;
  temperature: number;
};

export type ParsedResponse = {
  dataType: string;
  isEnd: boolean;
  data: unknown;
};

/**
 * Helper: Get value from byte with position multiplier (Little Endian)
 * Equivalent to: (int) ((b & 0xff) * Math.pow(256, count))
 */
function getValue(byte: number, position: number): number {
  return (byte & 0xff) * Math.pow(256, position);
}

/**
 * Helper: Convert BCD byte to string (e.g., 0x24 -> "24")
 */
function bcd2String(byte: number): string {
  const high = (byte & 0xf0) >>> 4;
  const low = byte & 0x0f;
  return `${high}${low}`;
}

/**
 * Helper: Convert byte to 2-digit hex string
 */
function byteToHexString(byte: number): string {
  const hex = (byte & 0xff).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

/**
 * Parse date from packet bytes (BCD format)
 */
function parseDate(data: Uint8Array, startIndex: number): string {
  return (
    `20${bcd2String(data[startIndex])}.${bcd2String(data[startIndex + 1])}.${bcd2String(data[startIndex + 2])} `
    + `${bcd2String(data[startIndex + 3])}:${bcd2String(data[startIndex + 4])}:${bcd2String(data[startIndex + 5])}`
  );
}

/**
 * Parse date from packet bytes (Hex format)
 */
function parseDateHex(data: Uint8Array, startIndex: number): string {
  return (
    `20${byteToHexString(data[startIndex])}.${byteToHexString(data[startIndex + 1])}.${byteToHexString(data[startIndex + 2])} `
    + `${byteToHexString(data[startIndex + 3])}:${byteToHexString(data[startIndex + 4])}:${byteToHexString(data[startIndex + 5])}`
  );
}

/**
 * Response Parser
 */
export const ResponseParser = {
  /**
   * Determine the command type from the first byte
   */
  getCommandType(data: Uint8Array): number {
    return data[0];
  },

  /**
   * Check if the response indicates end of data (0xFF marker)
   */
  isEndMarker(data: Uint8Array): boolean {
    return data[data.length - 1] === 0xff;
  },

  /**
   * Check if the response is an empty data response (command echo + all zeros + CRC)
   */
  isEmptyDataResponse(data: Uint8Array): boolean {
    if (data.length < 16) return false;
    for (let i = 1; i < 15; i++) {
      if (data[i] !== 0) return false;
    }
    return true;
  },

  /**
   * Parse battery level response (CMD 0x13)
   */
  parseBattery(data: Uint8Array): BatteryData {
    return {
      level: getValue(data[1], 0),
    };
  },

  /**
   * Parse device version response (CMD 0x27)
   */
  parseDeviceVersion(data: Uint8Array): DeviceVersionData {
    let version = '';
    for (let i = 1; i < 5; i++) {
      version += data[i].toString(16).toUpperCase();
      if (i < 4) version += '.';
    }
    return { version };
  },

  /**
   * Parse device time response (CMD 0x41)
   */
  parseDeviceTime(data: Uint8Array): DeviceTimeData {
    const deviceTime
      = `20${byteToHexString(data[1])}-${byteToHexString(data[2])}-${byteToHexString(data[3])} `
      + `${byteToHexString(data[4])}:${byteToHexString(data[5])}:${byteToHexString(data[6])}`;

    const gpsTime = `${byteToHexString(data[9])}.${byteToHexString(data[10])}.${byteToHexString(data[11])}`;

    return { deviceTime, gpsTime };
  },

  /**
   * Parse sleep data response (CMD 0x53)
   */
  parseSleepData(data: Uint8Array): { items: SleepDataItem[]; isEnd: boolean } {
    const items: SleepDataItem[] = [];
    const length = data.length;
    let isEnd = false;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    if (data[length - 1] === 0xff && data[length - 2] === CMD.GET_SLEEP_DATA) {
      isEnd = true;
    }

    if (length === 130 || (isEnd && length === 132)) {
      // 1-minute resolution
      const startTime = parseDate(data, 3);
      const sleepLength = getValue(data[9], 0);
      const sleepQuality: number[] = [];

      for (let j = 0; j < sleepLength; j++) {
        sleepQuality.push(getValue(data[10 + j], 0));
      }

      items.push({
        startTime,
        totalSleepTime: sleepLength,
        sleepQuality,
        unitLength: 1,
      });
    }
    else {
      // 5-minute resolution (34-byte chunks)
      const chunkSize = 34;
      const numChunks = Math.floor(length / chunkSize);

      for (let i = 0; i < numChunks; i++) {
        const offset = i * chunkSize;
        const sleepLength = getValue(data[9 + offset], 0);

        if (sleepLength === 0) continue;

        const startTime
          = `20${bcd2String(data[3 + offset])}-${bcd2String(data[4 + offset])}-${bcd2String(data[5 + offset])} `
          + `${bcd2String(data[6 + offset])}:${bcd2String(data[7 + offset])}:${bcd2String(data[8 + offset])}`;

        const sleepQuality: number[] = [];

        for (let j = 0; j < sleepLength && j < 24; j++) {
          sleepQuality.push(getValue(data[10 + j + offset], 0));
        }

        items.push({
          startTime,
          totalSleepTime: sleepLength,
          sleepQuality,
          unitLength: 5,
        });
      }
    }

    return { items, isEnd };
  },

  /**
   * Parse detail activity data response (CMD 0x52) — 25-byte chunks
   */
  parseDetailActivityData(data: Uint8Array): {
    items: ActivityDataItem[];
    isEnd: boolean;
  } {
    const items: ActivityDataItem[] = [];
    const length = data.length;
    const chunkSize = 25;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    const numChunks = Math.floor(length / chunkSize);
    const isEnd = data[length - 1] === 0xff;

    for (let i = 0; i < numChunks; i++) {
      const offset = i * chunkSize;
      const date = parseDateHex(data, 3 + offset);

      let steps = 0;
      for (let j = 0; j < 2; j++) {
        steps += getValue(data[9 + j + offset], j);
      }

      let cal = 0;
      for (let j = 0; j < 2; j++) {
        cal += getValue(data[11 + j + offset], j);
      }

      let distance = 0;
      for (let j = 0; j < 2; j++) {
        distance += getValue(data[13 + j + offset], j);
      }

      const stepsArray: number[] = [];
      for (let j = 0; j < 10; j++) {
        stepsArray.push(getValue(data[15 + j + offset], 0));
      }

      items.push({
        date,
        steps,
        calories: cal / 100,
        distance: distance / 100,
        stepsArray,
      });
    }

    return { items, isEnd };
  },

  /**
   * Parse static heart rate response (CMD 0x55) — 10-byte chunks
   */
  parseStaticHR(data: Uint8Array): { items: HeartRateItem[]; isEnd: boolean } {
    const items: HeartRateItem[] = [];
    const length = data.length;
    const chunkSize = 10;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    const numChunks = Math.floor(length / chunkSize);
    const isEnd = data[length - 1] === 0xff;

    for (let i = 0; i < numChunks; i++) {
      const offset = i * chunkSize;
      const date = parseDateHex(data, 3 + offset);
      const heartRate = getValue(data[9 + offset], 0);

      items.push({ date, heartRate });
    }

    return { items, isEnd };
  },

  /**
   * Parse HRV data response (CMD 0x56) — 15-byte chunks
   */
  parseHRVData(data: Uint8Array): { items: HRVDataItem[]; isEnd: boolean } {
    const items: HRVDataItem[] = [];
    const length = data.length;
    const chunkSize = 15;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    const numChunks = Math.floor(length / chunkSize);
    const isEnd = data[length - 1] === 0xff;

    for (let i = 0; i < numChunks; i++) {
      const offset = i * chunkSize;
      const date = parseDateHex(data, 3 + offset);

      items.push({
        date,
        hrv: getValue(data[9 + offset], 0),
        vascularAging: getValue(data[10 + offset], 0),
        heartRate: getValue(data[11 + offset], 0),
        stress: getValue(data[12 + offset], 0),
        highBP: getValue(data[13 + offset], 0),
        lowBP: getValue(data[14 + offset], 0),
      });
    }

    return { items, isEnd };
  },

  /**
   * Parse SpO2 data response (CMD 0x66) — 10-byte chunks
   */
  parseSpO2Data(data: Uint8Array): { items: SpO2DataItem[]; isEnd: boolean } {
    const items: SpO2DataItem[] = [];
    const length = data.length;
    const chunkSize = 10;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    const numChunks = Math.floor(length / chunkSize);
    const isEnd = data[length - 1] === 0xff;

    for (let i = 0; i < numChunks; i++) {
      const offset = i * chunkSize;
      const date = parseDateHex(data, 3 + offset);
      const bloodOxygen = getValue(data[9 + offset], 0);

      items.push({ date, bloodOxygen });
    }

    return { items, isEnd };
  },

  /**
   * Parse temperature data response (CMD 0x62) — 11-byte chunks
   */
  parseTemperatureData(data: Uint8Array): {
    items: TemperatureDataItem[];
    isEnd: boolean;
  } {
    const items: TemperatureDataItem[] = [];
    const length = data.length;
    const chunkSize = 11;

    if (this.isEmptyDataResponse(data)) {
      return { items: [], isEnd: true };
    }

    const numChunks = Math.floor(length / chunkSize);
    const isEnd = data[length - 1] === 0xff;

    for (let i = 0; i < numChunks; i++) {
      const offset = i * chunkSize;
      const date = parseDate(data, 3 + offset);

      // Temperature: 2 bytes * 0.1
      const tempValue
        = getValue(data[9 + offset], 0) + getValue(data[10 + offset], 1);

      items.push({
        date,
        temperature: tempValue * 0.1,
      });
    }

    return { items, isEnd };
  },
};

export default ResponseParser;
