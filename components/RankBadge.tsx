import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { rankColors } from "@/constants/colors";
import { useColors } from "@/hooks/useColors";

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const RANK_ICONS: Record<string, string> = {
  Rookie: "R",
  Bronze: "B",
  Silver: "S",
  Gold: "G",
  Platinum: "P",
  Diamond: "D",
  Elite: "E",
  Legend: "L",
};

export function RankBadge({ rank, size = "md", showLabel = true }: RankBadgeProps) {
  const colors = useColors();
  const rankColor = rankColors[rank] || "#9CA3AF";

  const sizes = {
    sm: { badge: 28, font: 10, label: 11 },
    md: { badge: 40, font: 14, label: 13 },
    lg: { badge: 56, font: 20, label: 15 },
  };
  const s = sizes[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: s.badge,
            height: s.badge,
            borderRadius: s.badge / 2,
            backgroundColor: rankColor + "22",
            borderColor: rankColor,
            borderWidth: 2,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: s.font, color: rankColor }]}>
          {RANK_ICONS[rank] || "R"}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: s.label, color: rankColor }]}>
          {rank}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 4 },
  badge: { alignItems: "center", justifyContent: "center" },
  icon: { fontWeight: "800" as const },
  label: { fontWeight: "700" as const },
});
