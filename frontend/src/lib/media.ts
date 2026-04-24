const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

const normalizedApiBase = API_BASE_URL.replace(/\/+$/, "");

export const resolveHeroUpdateMediaUrl = (input: {
  mediaFileName?: string | null;
  mediaUrl?: string | null;
}) => {
  if (input.mediaFileName) {
    return `${normalizedApiBase}/updates/media/${encodeURIComponent(input.mediaFileName)}`;
  }

  return input.mediaUrl ?? null;
};
