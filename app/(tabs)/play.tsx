import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorsHook } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";
import { GameCard } from "@/components/GameCard";

const MODES = [
  { id: "1v1", label: "1 vs 1", desc: "Solo duel", icon: "user", players: 2 },
  { id: "2v2", label: "2 vs 2", desc: "Pair up", icon: "users", players: 4 },
  { id: "3v3", label: "3 vs 3", desc: "Small squad", icon: "users", players: 6 },
  { id: "4v4", label: "4 vs 4", desc: "Full team", icon: "users", players: 8 },
  { id: "5v5", label: "5 vs 5", desc: "Full court", icon: "users", players: 10 },
] as const;

export default function PlayScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { games } = useApp();
  const [filter, setFilter] = useState<"all" | "active" | "finished">("all");

  const filteredGames = games.filter((g) =>
    filter === "all" ? true : g.status === filter
  );

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="play" />
      <BasketballBorder />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPadding + 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Find a Game</Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
        Choose your mode and set your bet
      </Text>

      {/* Mode Grid */}
      <View style={styles.modeGrid}>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: "/game/create", params: { mode: mode.id } });
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.modeBig, { color: colors.primary }]}>{mode.id}</Text>
            <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>
              {mode.desc}
            </Text>
            <View style={[styles.modeFooter, { borderTopColor: colors.border }]}>
              <Feather name="users" size={12} color={colors.mutedForeground} />
              <Text style={[styles.modeFooterText, { color: colors.mutedForeground }]}>
                {mode.players} players
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter + Games */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Games</Text>
      </View>
      <View style={styles.filterRow}>
        {(["all", "active", "finished"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
            ]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredGames.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="activity" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No games here</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Start a new game above
          </Text>
        </View>
      ) : (
        filteredGames.map((game) => (
          <TouchableOpacity
            key={game.id}
            onPress={() => router.push({ pathname: "/game/[id]", params: { id: game.id } })}
            activeOpacity={0.9}
          >
            <GameCard game={game} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 28, fontWeight: "800" as const, marginBottom: 4 },
  pageSubtitle: { fontSize: 14, marginBottom: 20 },
  modeGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 12, marginBottom: 24 },
  modeCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  modeBig: { fontSize: 24, fontWeight: "800" as const },
  modeDesc: { fontSize: 13 },
  modeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  modeFooterText: { fontSize: 11 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "600" as const },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" as const },
  emptyText: { fontSize: 13, textAlign: "center" },
});
