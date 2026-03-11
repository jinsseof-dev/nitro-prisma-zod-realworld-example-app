import type { NitroErrorHandler } from 'nitropack/types';
import HttpException from './models/http-exception.model';

const errorHandler: NitroErrorHandler = async function (error, event) {
  const cause = error.cause ?? error;
  let statusCode: number;
  let body: { errors: Record<string, string[]> } | { message: string } | string;

  if (cause instanceof HttpException) {
    statusCode = cause.errorCode;
    body = cause.message;
  } else if (error.statusCode && error.data) {
    statusCode = error.statusCode;
    body = error.data;
  } else {
    return;
  }

  setResponseStatus(event, statusCode);
  setResponseHeader(event, 'content-type', 'application/json');
  await send(event, JSON.stringify(body));
};

export default errorHandler;
