// Utility to match multi-word queries against multiple fields
export function matchesQuery(query, ...values) {
    if (!query) return true;
    const q = String(query).trim().toLowerCase();
    if (!q) return true;

  // Combine all provided values into one searchable string
    const combined = values
    .filter((v) => v !== undefined && v !== null)
    .map((v) => String(v).toLowerCase())
    .join(' ');

  // Direct substring match (covers whole phrase searches)
    if (combined.includes(q)) return true;

  // Tokenize query and ensure all tokens appear somewhere in the combined string
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((t) => combined.includes(t));
}
