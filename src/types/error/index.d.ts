export interface IStatusError extends Error {
  statusCode: number;
  status?: number;
}
