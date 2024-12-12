const formatObjectToString = (obj, indent = 2) => {
    if (obj === undefined || obj === null) {
        return String(obj);
    }

    if (typeof obj !== "object") {
        return String(obj);
    }

    const spaces = " ".repeat(indent);
    let result = "{\n";

    for (const [key, value] of Object.entries(obj)) {
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
};

module.exports = formatObjectToString;