import { IStatusError } from 'types';

/* eslint-disable no-unused-vars */
export enum ErrorType {
  // 1xx: Informational
  Continue = 'continue',
  SwitchingProtocols = 'switchingProtocols',

  // 2xx: Success
  Ok = 'ok',
  Created = 'created',
  Accepted = 'accepted',
  NoContent = 'noContent',

  // 3xx: Redirection
  MovedPermanently = 'movedPermanently',
  Found = 'found',
  NotModified = 'notModified',

  // 4xx: Client Errors
  BadRequest = 'badRequest',
  Unauthorized = 'unauthorized',
  Forbidden = 'forbidden',
  NotFound = 'notFound',
  MethodNotAllowed = 'methodNotAllowed',
  Conflict = 'conflict',
  Gone = 'gone',
  UnprocessableEntity = 'unprocessableEntity',
  TooManyRequests = 'tooManyRequests',

  // 5xx: Server Errors
  InternalServerError = 'internalServerError',
  NotImplemented = 'notImplemented',
  BadGateway = 'badGateway',
  ServiceUnavailable = 'serviceUnavailable',
  GatewayTimeout = 'gatewayTimeout',

  // Fallback
  Unknown = 'unknownErrorType',
}

const ErrorCodeMap: Record<ErrorType, number> = {
  // 1xx
  [ErrorType.Continue]: 100,
  [ErrorType.SwitchingProtocols]: 101,

  // 2xx
  [ErrorType.Ok]: 200,
  [ErrorType.Created]: 201,
  [ErrorType.Accepted]: 202,
  [ErrorType.NoContent]: 204,

  // 3xx
  [ErrorType.MovedPermanently]: 301,
  [ErrorType.Found]: 302,
  [ErrorType.NotModified]: 304,

  // 4xx
  [ErrorType.BadRequest]: 400,
  [ErrorType.Unauthorized]: 401,
  [ErrorType.Forbidden]: 403,
  [ErrorType.NotFound]: 404,
  [ErrorType.MethodNotAllowed]: 405,
  [ErrorType.Conflict]: 409,
  [ErrorType.Gone]: 410,
  [ErrorType.UnprocessableEntity]: 422,
  [ErrorType.TooManyRequests]: 429,

  // 5xx
  [ErrorType.InternalServerError]: 500,
  [ErrorType.NotImplemented]: 501,
  [ErrorType.BadGateway]: 502,
  [ErrorType.ServiceUnavailable]: 503,
  [ErrorType.GatewayTimeout]: 504,

  // Fallback
  [ErrorType.Unknown]: 500,
};

function createStatusError(code: number, message: string): IStatusError {
  const error = new Error(message) as IStatusError;
  error.statusCode = code;
  return error;
}

function statusError(type: ErrorType, message?: string): IStatusError {
  const code = ErrorCodeMap[type] || ErrorCodeMap[ErrorType.Unknown];
  return createStatusError(code, message || type);
}

export const StatusError = {
  // 1xx
  continue: (message?: string) => statusError(ErrorType.Continue, message),
  switchingProtocols: (message?: string) => statusError(ErrorType.SwitchingProtocols, message),

  // 2xx
  ok: (message?: string) => statusError(ErrorType.Ok, message),
  created: (message?: string) => statusError(ErrorType.Created, message),
  accepted: (message?: string) => statusError(ErrorType.Accepted, message),
  noContent: (message?: string) => statusError(ErrorType.NoContent, message),

  // 3xx
  movedPermanently: (message?: string) => statusError(ErrorType.MovedPermanently, message),
  found: (message?: string) => statusError(ErrorType.Found, message),
  notModified: (message?: string) => statusError(ErrorType.NotModified, message),

  // 4xx
  badRequest: (message?: string) => statusError(ErrorType.BadRequest, message),
  unauthorized: (message?: string) => statusError(ErrorType.Unauthorized, message),
  forbidden: (message?: string) => statusError(ErrorType.Forbidden, message),
  notFound: (message?: string) => statusError(ErrorType.NotFound, message),
  methodNotAllowed: (message?: string) => statusError(ErrorType.MethodNotAllowed, message),
  conflict: (message?: string) => statusError(ErrorType.Conflict, message),
  gone: (message?: string) => statusError(ErrorType.Gone, message),
  unprocessableEntity: (message?: string) => statusError(ErrorType.UnprocessableEntity, message),
  tooManyRequests: (message?: string) => statusError(ErrorType.TooManyRequests, message),

  // 5xx
  internalServerError: (message?: string) => statusError(ErrorType.InternalServerError, message),
  notImplemented: (message?: string) => statusError(ErrorType.NotImplemented, message),
  badGateway: (message?: string) => statusError(ErrorType.BadGateway, message),
  serviceUnavailable: (message?: string) => statusError(ErrorType.ServiceUnavailable, message),
  gatewayTimeout: (message?: string) => statusError(ErrorType.GatewayTimeout, message),

  // fallback
  unknown: (message?: string) => statusError(ErrorType.Unknown, message),
};

// | **Status Code** | **Status**            | **When to Use**                                                              |
// | --------------- | --------------------- | ---------------------------------------------------------------------------- |
// | **100**         | Continue              | Client should continue with request body (used in chunked transfer encoding) |
// | **101**         | Switching Protocols   | Server switching protocols (e.g., to WebSocket)                              |
// | **200**         | OK                    | Request succeeded (GET, PUT, DELETE, etc.)                                   |
// | **201**         | Created               | Resource successfully created (POST)                                         |
// | **202**         | Accepted              | Request accepted but not completed yet                                       |
// | **204**         | No Content            | Request successful, no response body (DELETE/PUT)                            |
// | **301**         | Moved Permanently     | Resource moved to a new URL (permanently)                                    |
// | **302**         | Found                 | Temporary redirection                                                        |
// | **304**         | Not Modified          | Cached version is still valid                                                |
// | **400**         | Bad Request           | Invalid request payload, missing parameters, or syntax errors                |
// | **401**         | Unauthorized          | Authentication failed or missing credentials (e.g., wrong password)          |
// | **403**         | Forbidden             | Authenticated but not authorized (e.g., user accessing admin route)          |
// | **404**         | Not Found             | Resource or endpoint not found                                               |
// | **405**         | Method Not Allowed    | HTTP method not supported on the endpoint                                    |
// | **409**         | Conflict              | Duplicate entry or resource state conflict (e.g., same email during signup)  |
// | **410**         | Gone                  | Resource has been permanently deleted                                        |
// | **422**         | Unprocessable Entity  | Semantic/validation errors (e.g., weak password, invalid email format)       |
// | **429**         | Too Many Requests     | Rate limit exceeded                                                          |
// | **500**         | Internal Server Error | Generic server error                                                         |
// | **501**         | Not Implemented       | Requested method not supported by the server                                 |
// | **502**         | Bad Gateway           | Invalid response from upstream server                                        |
// | **503**         | Service Unavailable   | Server temporarily overloaded or under maintenance                           |
// | **504**         | Gateway Timeout       | Upstream server didn’t respond in time                                       |

// | **Scenario**                      | **Recommended Code**      |
// | --------------------------------- | ------------------------- |
// | Invalid password                  | 401 Unauthorized          |
// | Missing required field            | 400 Bad Request           |
// | Email already exists              | 409 Conflict              |
// | Weak password or validation error | 422 Unprocessable Entity  |
// | Not logged in                     | 401 Unauthorized          |
// | Accessing resource without rights | 403 Forbidden             |
// | API endpoint not found            | 404 Not Found             |
// | Server crash                      | 500 Internal Server Error |
// | Too many login attempts           | 429 Too Many Requests     |
