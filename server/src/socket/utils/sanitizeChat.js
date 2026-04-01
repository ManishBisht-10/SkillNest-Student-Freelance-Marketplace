/** Basic XSS hardening for chat text (no HTML). */
export function sanitizeChatText(input) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, 5000)
    .replace(/[<>]/g, "");
}
