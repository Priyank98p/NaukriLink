import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import type { ParamsDictionary } from "express-serve-static-core";

type SafeRequestHandler = (
  req: Request<ParamsDictionary, unknown, unknown>,
  res: Response,
  next: NextFunction,
) => unknown;

const asyncHandler = (
  requestHandler: SafeRequestHandler,
): RequestHandler<ParamsDictionary, unknown, unknown> => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };
