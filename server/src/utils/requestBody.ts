import { ApiError } from "./ApiError.js";

type RequestBody = Record<string, unknown>;

const isRequestBody = (value: unknown): value is RequestBody =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getRequestBody = (value: unknown): RequestBody => {
  if (!isRequestBody(value)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }
  return value;
};

export const getRequiredString = (
  body: RequestBody,
  field: string,
): string => {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `${field} is required`);
  }
  return value;
};

export const getOptionalString = (
  body: RequestBody,
  field: string,
): string | undefined => {
  const value = body[field];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be a string`);
  }
  return value;
};

export const getOptionalStringArray = (
  body: RequestBody,
  field: string,
): string[] | undefined => {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (
    !Array.isArray(value) ||
    !value.every((item: unknown) => typeof item === "string")
  ) {
    throw new ApiError(400, `${field} must be an array of strings`);
  }
  return value;
};

export const getOptionalNumber = (
  body: RequestBody,
  field: string,
): number | undefined => {
  const value = body[field];
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `${field} must be a number`);
  }
  return parsed;
};

export const getOptionalStringRecord = (
  body: RequestBody,
  field: string,
): Record<string, string> | undefined => {
  const value = body[field];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, `${field} must be an object of strings`);
  }

  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "string") {
      throw new ApiError(400, `${field} must be an object of strings`);
    }
    result[key] = item;
  }
  return result;
};
