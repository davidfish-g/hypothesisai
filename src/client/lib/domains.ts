export const SCIENCE_DOMAINS = [
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Mathematics",
  "Psychology",
  "Neuroscience",
  "Astronomy",
  "Medicine",
] as const;

export const HOME_LEADERBOARD_DOMAINS = ["Biology", "Physics", "Chemistry"] as const;

export function domainPath(domain: string) {
  return `/leaderboard/${encodeURIComponent(domain.toLowerCase())}`;
}

export function domainFromPathParam(param?: string) {
  const decoded = decodeURIComponent(param ?? "");
  const knownDomain = SCIENCE_DOMAINS.find(
    (domain) => domain.toLowerCase() === decoded.toLowerCase()
  );

  return knownDomain ?? decoded;
}
