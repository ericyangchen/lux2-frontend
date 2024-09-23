export class ApplicationError extends Error {
  constructor({
    statusCode,
    message,
    timestamp,
    path,
  }: {
    statusCode?: number;
    message?: string;
    timestamp?: string;
    path?: string;
  }) {
    super();
    this.name = this.constructor.name;
    this.stack = new Error().stack;

    this.message = message || "Unknown error";
    this.statusCode = statusCode;
    this.timestamp = timestamp;
    this.path = path;
  }

  statusCode?: number;
  message: string;
  timestamp?: string;
  path?: string;
}
