import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const PRO_FEATURES = [
  "Unlimited AI coaching sessions",
  "Advanced training programs",
  "Priority matchmaking",
  "Exclusive Pro titles & badges",
  "Detailed analytics dashboard",
  "Higher betting limits",
];

interface MembershipBannerProps {
  onUpgrade: () => void;
}

export function MembershipBanner({ onUpgrade }: MembershipBannerProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.secondary,
          borderColor: colors.primary,
        },
      ]}
    >
      <View style={styles.header}>
        <Feather name="zap" size={20} color={colors.gold} />
        <Text style={[styles.title, { color: colors.foreground }]}>LOS Pro</Text>
        <View style={[styles.badge, { backgroundColor: colors.gold }]}>
          <Text style={styles.badgeText}>UPGRADE</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Unlock the full court experience
      </Text>
      <View style={styles.features}>
        {PRO_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={onUpgrade}
        activeOpacity={0.8}
      >
        <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
          Go Pro — 999 coins/month
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800" as const, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "800" as const, color: "#000" },
  subtitle: { fontSize: 14 },
  features: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13 },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { fontSize: 15, fontWeight: "700" as const },
});
