type statusCode = number;

class ServerError extends Error {
  statusCode: statusCode;
  constructor(statusCode: statusCode, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ServerError;
