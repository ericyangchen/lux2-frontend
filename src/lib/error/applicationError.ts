export class ApplicationError extends Error {
  constructor({
    statusCode,
    message,
  }: {
    statusCode?: number;
    message?: string;
  }) {
    super();
    this.name = this.constructor.name;
    this.stack = new Error().stack;

    this.message = message || "Unknown error";
    this.statusCode = statusCode;
  }

  statusCode?: number;
  message: string;
}
