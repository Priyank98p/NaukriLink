export const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

export const getJwtExpirationSeconds = (name: string): number => {
  const value = getRequiredEnv(name);
  const match = /^(\d+)(ms|s|m|h|d|w|y)?$/.exec(value);

  if (!match?.[1]) {
    throw new Error(`${name} must be a numeric JWT duration`);
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "ms";
  const secondsPerUnit: Record<string, number> = {
    ms: 0.001,
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
    w: 7 * 24 * 60 * 60,
    y: 365 * 24 * 60 * 60,
  };
  const multiplier = secondsPerUnit[unit];

  if (multiplier === undefined || !Number.isFinite(amount)) {
    throw new Error(`${name} must be a supported JWT duration`);
  }

  const durationSeconds = amount * multiplier;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error(`${name} must be a positive JWT duration`);
  }

  return durationSeconds;
};
