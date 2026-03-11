export interface ErrorBody {
  errors: Record<string, string[]>;
}

class HttpException extends Error {
  errorCode: number;
  body: ErrorBody;
  constructor(errorCode: number, body: ErrorBody) {
    super(JSON.stringify(body));
    this.errorCode = errorCode;
    this.body = body;
  }
}

export default HttpException;
