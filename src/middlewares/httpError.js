class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(msg, details) { return new HttpError(400, msg, details); }
  static notFound(msg) { return new HttpError(404, msg); }
  static conflict(msg) { return new HttpError(409, msg); }
}

module.exports = HttpError;
