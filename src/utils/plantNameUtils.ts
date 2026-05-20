/**
 * Utility function to extract a common name from the formatted commonNames string.
 * It prioritizes Costa Rica if present, and falls back to other countries,
 * or finally back to the default name.
 */
export function getCommonNameForNameField(commonNamesStr: string | undefined, defaultName: string): string {
  if (!commonNamesStr || typeof commonNamesStr !== 'string') return defaultName;
  
  const lines = commonNamesStr.split('\n');
  
  // 1. Look for Costa Rica first (case-insensitive)
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.toLowerCase().includes('costa rica:')) {
      const parts = cleanLine.split(':');
      if (parts.length > 1) {
        const name = parts.slice(1).join(':').trim();
        if (name) {
          // Capitalize first letter
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    }
  }
  
  // 2. Look for any other country line with a colon
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.includes(':')) {
      const parts = cleanLine.split(':');
      if (parts.length > 1) {
        const name = parts.slice(1).join(':').trim();
        if (name) {
          // Capitalize first letter
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    }
  }
  
  // 3. Fallback: Clean bullets from first line if it's not empty
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^[-\*\s\•\+]+/g, '').trim();
    if (firstLine && !firstLine.includes(':')) {
      return firstLine.charAt(0).toUpperCase() + firstLine.slice(1);
    }
  }
  
  return defaultName;
}
