export const TESTFLIGHT_INVITE_URL = "https://testflight.apple.com/join/F6dJTez3";

export function getInviteMessage(): string {
  return `Join me on Trace — use this to download and join the beta: ${TESTFLIGHT_INVITE_URL}`;
}

export function buildSmsUrl(phone?: string | null): string {
  const body = encodeURIComponent(getInviteMessage());
  const separator = process.env.EXPO_OS === "ios" ? "&" : "?";

  if (phone) {
    const sanitized = phone.replace(/[^\d+]/g, "");
    if (sanitized.length > 0) {
      return `sms:${sanitized}${separator}body=${body}`;
    }
  }

  return `sms:${separator}body=${body}`;
}
