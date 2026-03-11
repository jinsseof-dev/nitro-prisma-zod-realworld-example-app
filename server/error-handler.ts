import type { NitroErrorHandler } from 'nitropack/types';
import HttpException from './models/http-exception.model';

const errorHandler: NitroErrorHandler = async function (error, event) {
  const cause = error.cause ?? error;

  if (cause instanceof HttpException) {
    setResponseStatus(event, cause.errorCode);
    setResponseHeader(event, 'content-type', 'application/json');
    await send(event, JSON.stringify(cause.body));
    return;
  }

  // Fallback for unhandled errors
  const statusCode = error.statusCode ?? 500;
  const body = { errors: { server: [error.statusMessage ?? 'internal server error'] } };
  setResponseStatus(event, statusCode);
  setResponseHeader(event, 'content-type', 'application/json');
  await send(event, JSON.stringify(body));
};

export default errorHandler;
