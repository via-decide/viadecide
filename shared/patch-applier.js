/**
 * Unified Delta Patching Utility
 */
export function applyJSONPatch(sourceString, patchJSON) {
  try {
    const lines = sourceString.split('\n');
    const hunks = typeof patchJSON === 'string' ? JSON.parse(patchJSON) : patchJSON;

    if (!Array.isArray(hunks)) throw new Error("Patch must be an array of hunks");

    // Sort hunks descending by startLine to avoid line-shift collisions during mutations
    hunks.sort((a, b) => (b.startLine || 0) - (a.startLine || 0));

    hunks.forEach((hunk) => {
      const { startLine, deleteCount, insertLines = [] } = hunk;
      
      // Validation
      if (typeof startLine !== 'number' || typeof deleteCount !== 'number') {
        throw new Error('Hunk missing valid startLine or deleteCount');
      }
      
      // Ensure zero-indexed safety if provided lines are 1-indexed
      const targetIndex = Math.max(0, startLine - 1);
      
      // Safely apply the delta block
      lines.splice(targetIndex, deleteCount, ...insertLines);
    });

    return lines.join('\n');
  } catch (error) {
    console.error("Delta Patching Failed:", error);
    return sourceString; // Return original on failure
  }
}

// Support for CommonJS/Browser globals if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyJSONPatch };
} else if (typeof window !== 'undefined') {
  window.ViaPatchApplier = { applyJSONPatch };
}
