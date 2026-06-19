export function formatObjectToString(obj: unknown, indent = 2): string {
  if (obj === undefined || obj === null) return String(obj);
  if (typeof obj !== "object") return String(obj);

  const spaces = " ".repeat(indent);
  let result = "{\n";

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result += `${spaces}${key}: `;
    if (typeof value === "object" && value !== null) {
      result += formatObjectToString(value, indent + 2);
    } else if (typeof value === "string") {
      result += `"${value}"`;
    } else {
      result += String(value);
    }
    result += ",\n";
  }

  return result + " ".repeat(Math.max(0, indent - 2)) + "}";
}
