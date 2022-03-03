import { Buffer } from "buffer";

export const stringToBytes = (text: string) => {
  const buffer = new Buffer(text, "utf8");
  return Array.from(buffer.values());
};

export const bytesToString = (bytes: Uint8Array) => {
  const buffer = Buffer.from(bytes);
  return buffer.toString();
};

export function format(date: Date | string | undefined, _format: string) {
  if (date === undefined) {
    return "";
  }

  if (typeof date === "string") {
    date = new Date(date);
  }
  return _format
    .replace(/%dd/g, date.getDate().toString().padStart(2, "0"))
    .replace(/%d/g, date.getDate().toString())
    .replace(/%mm/g, (date.getMonth() + 1).toString().padStart(2, "0"))
    .replace(/%m/g, (date.getMonth() + 1).toString())
    .replace(/%YYYY/g, date.getFullYear().toString())
    .replace(/%YY/g, (date.getFullYear() % 100).toString())
    .replace(/%Y/g, date.getFullYear().toString())
    .replace(/%HH/g, date.getHours().toString().padStart(2, "0"))
    .replace(/%H/g, date.getHours().toString())
    .replace(/%MM/g, date.getMinutes().toString().padStart(2, "0"))
    .replace(/%M/g, date.getMinutes().toString())
    .replace(/%SS/g, date.getSeconds().toString().padStart(2, "0"))
    .replace(/%S/g, date.getSeconds().toString())
    .replace(/%f/g, date.getMilliseconds().toString().padStart(3, "0"));
}

export const emptyPromise = () => new Promise((resolve => resolve(null)));
