import * as moment from "moment-timezone";

const PHILIPPINES_TIMEZONE = "Asia/Manila";

export const getCurrentTimeInPhilippines = (): string => {
  return moment.tz(PHILIPPINES_TIMEZONE).format("YYYY-MM-DD HH:mm:ss.SSSZ");
};

export const getCurrentDateInPhilippines = (): string => {
  return moment.tz(PHILIPPINES_TIMEZONE).format("YYYY-MM-DD");
};

export const convertToPhilippinesTimezone = (time?: string): string => {
  if (!time) return "";

  const date = new Date(time);

  return moment
    .tz(date, PHILIPPINES_TIMEZONE)
    .format("YYYY-MM-DD HH:mm:ss.SSSZ");
};

export const convertTimeToDate = (time?: string): string => {
  if (!time) return "";

  const date = new Date(time);

  return moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY-MM-DD");
};

export const addTimeInterval = (time: string, interval: string): string => {
  const date = new Date(time);

  return moment
    .tz(date, PHILIPPINES_TIMEZONE)
    .add(interval)
    .format("YYYY-MM-DD HH:mm:ss.SSSZ");
};

export const convertDatabaseTimeToReadablePhilippinesTime = (
  time?: string
): string => {
  if (!time) return "";

  const date = new Date(time);

  return moment.tz(date, PHILIPPINES_TIMEZONE).format("YYYY/MM/DD HH:mm:ss");
};

export const convertToStartOfDay = (time?: Date): string => {
  if (!time) return "";

  return moment
    .tz(time, PHILIPPINES_TIMEZONE)
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss.SSSZ");
};

export const convertToEndOfDay = (time?: Date): string => {
  if (!time) return "";

  return moment
    .tz(time, PHILIPPINES_TIMEZONE)
    .endOf("day")
    .format("YYYY-MM-DD HH:mm:ss.SSSZ");
};
