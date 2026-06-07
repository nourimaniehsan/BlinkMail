const OTP_REGEX = /(?<!\d)(\d{4,8})(?!\d)/;

export function detectOtp(...values: Array<string | null | undefined>) {
  const text = values.filter(Boolean).join(" ");
  return text.match(OTP_REGEX)?.[1] ?? null;
}

