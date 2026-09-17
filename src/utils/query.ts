export const toQueryString = (
  params: Record<string, string | number | undefined> | object,
): string => {
  const parts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  return parts.join('&');
};
