/**
 * Minimal validation helper — no extra dependency needed.
 * Returns a list of error messages for the given field rules.
 *
 * Example:
 *   const errors = validateBody(req.body, {
 *     name: { required: true, type: "string" },
 *     price: { required: true, type: "number", min: 0 },
 *   });
 */
function validateBody(body, rules) {
    const errors = [];
    body = body || {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = body[field];
        const present = value !== undefined && value !== null && value !== "";

        if (rule.required && !present) {
            errors.push(`${field} is required`);
            continue;
        }
        if (!present) continue;

        if (rule.type === "number" && typeof value !== "number") {
            errors.push(`${field} must be a number`);
        }
        if (rule.type === "string" && typeof value !== "string") {
            errors.push(`${field} must be a string`);
        }
        if (rule.type === "number" && typeof value === "number") {
            if (rule.min !== undefined && value < rule.min) {
                errors.push(`${field} must be >= ${rule.min}`);
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push(`${field} must be <= ${rule.max}`);
            }
        }
    }

    return errors;
}

module.exports = { validateBody };
