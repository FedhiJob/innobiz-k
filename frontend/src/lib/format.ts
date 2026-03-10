export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};
