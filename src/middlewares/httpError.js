class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static badRequest(msg, details) { return new HttpError(400, msg, details); }
  static notFound(msg) { return new HttpError(404, msg); }
  static conflict(msg) { return new HttpError(409, msg); }

  // Converte os erros do Zod em 400 com a lista { field, message }
  static fromZod(zodError, msg, root = '(body)') {
    const details = zodError.issues.map((i) => ({
      field: i.path.join('.') || root,
      message: i.code === 'unrecognized_keys' ? `campo(s) não permitido(s): ${i.keys.join(', ')}` : i.message,
    }));
    return new HttpError(400, msg, details);
  }
}

module.exports = HttpError;
