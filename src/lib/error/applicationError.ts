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

    this.isAuthError =
      (typeof message === "string" && message.startsWith("Auth Error")) ??
      false;
  }

  statusCode?: number;
  message: string;
  isAuthError: boolean;
}
