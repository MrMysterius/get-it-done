export function generateErrorWithStatus(error: any, status: number, details: any = undefined) {
  const err = new Error(error);
  err.status = status;
  err.details = details;
  return err;
}
