const colors = {
  light: {
    text: "#1A2F4A",
    tint: "#2563EB",
    background: "#EEF6FF",
    foreground: "#1A2F4A",
    card: "#FFFFFF",
    cardForeground: "#1A2F4A",
    primary: "#2563EB",
    primaryForeground: "#FFFFFF",
    secondary: "#E0EDFF",
    secondaryForeground: "#1A2F4A",
    muted: "#F0F7FF",
    mutedForeground: "#5B7A99",
    accent: "#F97316",
    accentForeground: "#FFFFFF",
    destructive: "#DC2626",
    destructiveForeground: "#FFFFFF",
    border: "#C3DDFB",
    input: "#E8F2FF",
    success: "#16A34A",
    gold: "#F59E0B",
    silver: "#94A3B8",
    bronze: "#B45309",
  },
  radius: 14,
};

export const rankColors: Record<string, string> = {
  Rookie: "#94A3B8",
  Bronze: "#B45309",
  Silver: "#64748B",
  Gold: "#D97706",
  Platinum: "#0891B2",
  Diamond: "#7C3AED",
  Elite: "#DB2777",
  Legend: "#F97316",
};

export const rankGradients: Record<string, [string, string]> = {
  Rookie: ["#CBD5E1", "#94A3B8"],
  Bronze: ["#FDE68A", "#B45309"],
  Silver: ["#E2E8F0", "#64748B"],
  Gold: ["#FDE68A", "#D97706"],
  Platinum: ["#BAE6FD", "#0891B2"],
  Diamond: ["#DDD6FE", "#7C3AED"],
  Elite: ["#FBCFE8", "#DB2777"],
  Legend: ["#FED7AA", "#F97316"],
};

export const rankEmojis: Record<string, string> = {
  Rookie: "🏀",
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💿",
  Diamond: "💎",
  Elite: "⭐",
  Legend: "👑",
};

export const rankThresholds = [
  { name: "Rookie",   min: 0,    max: 99,   desc: "Just getting started. Learn the fundamentals and earn your first LP." },
  { name: "Bronze",   min: 100,  max: 299,  desc: "You've proven you can ball. Keep grinding for consistency." },
  { name: "Silver",   min: 300,  max: 599,  desc: "Solid player. Your fundamentals are showing on the court." },
  { name: "Gold",     min: 600,  max: 999,  desc: "Above average. You're making smart plays and winning clutch moments." },
  { name: "Platinum", min: 1000, max: 1499, desc: "Top-tier competitor. Your game reads and footwork are elite-level." },
  { name: "Diamond",  min: 1500, max: 1999, desc: "Rare talent. You dominate most opponents with ease." },
  { name: "Elite",    min: 2000, max: 2999, desc: "One of the best. Only the most dedicated reach this tier." },
  { name: "Legend",   min: 3000, max: Infinity, desc: "Born Legend. You've mastered the game. The court is yours." },
];

export function getRankFromPoints(points: number): string {
  for (const tier of rankThresholds) {
    if (points >= tier.min && points <= tier.max) return tier.name;
  }
  return "Rookie";
}

export default colors;
