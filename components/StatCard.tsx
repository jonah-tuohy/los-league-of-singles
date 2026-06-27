import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  small?: boolean;
}

export function StatCard({ label, value, color, small = false }: StatCardProps) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text
        style={[
          styles.value,
          { color: color || colors.primary, fontSize: small ? 22 : 28 },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  value: { fontWeight: "800" as const },
  label: { fontSize: 11, fontWeight: "500" as const, textAlign: "center" },
});
