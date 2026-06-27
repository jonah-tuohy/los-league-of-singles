import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rankColors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";
import { GameCard } from "@/components/GameCard";
import { RankBadge } from "@/components/RankBadge";
import { StatCard } from "@/components/StatCard";
import { useColors } from "@/hooks/useColors";

const AI_TIPS = [
  "Stay low in your defensive stance — width creates resistance.",
  "Drive to your strong side, then crossover to keep defenders guessing.",
  "In 5v5, spacing is everything. Don't crowd the paint.",
  "Watch the defender's hips — they tell you where they're going, not their eyes.",
  "Finish with your off-hand at the rim to avoid shot blockers.",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, games } = useApp();
  const tip = AI_TIPS[new Date().getDay() % AI_TIPS.length];
  const recentGames = games.slice(0, 5);
  const winRate =
    user.wins + user.losses > 0
      ? Math.round((user.wins / (user.wins + user.losses)) * 100)
      : 0;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="home" />
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push("/friends")}
            activeOpacity={0.8}
          >
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" }]}>
              <Feather name="users" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor:
                    (rankColors[user.rank] || colors.primary) + "22",
                  borderColor: rankColors[user.rank] || colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: rankColors[user.rank] || colors.primary },
                ]}
              >
                {user.avatar}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Rank Card */}
      <View
        style={[
          styles.rankCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.rankRow}>
          <RankBadge rank={user.rank} size="lg" />
          <View style={styles.rankInfo}>
            <Text style={[styles.rankTitle, { color: colors.foreground }]}>
              {user.rank} Division
            </Text>
            <Text style={[styles.rankPoints, { color: colors.mutedForeground }]}>
              {user.points.toLocaleString()} LP
            </Text>
            {user.winStreak >= 2 && (
              <View
                style={[
                  styles.streakBadge,
                  { backgroundColor: colors.accent + "22" },
                ]}
              >
                <Feather name="trending-up" size={12} color={colors.accent} />
                <Text style={[styles.streakText, { color: colors.accent }]}>
                  {user.winStreak} win streak
                </Text>
              </View>
            )}
          </View>
          <View
            style={[styles.coinsBadge, { backgroundColor: colors.gold + "22" }]}
          >
            <Feather name="dollar-sign" size={14} color={colors.gold} />
            <Text style={[styles.coinsText, { color: colors.gold }]}>
              {user.coins}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Wins" value={user.wins} color={colors.success} />
        <StatCard label="Losses" value={user.losses} color={colors.destructive} />
        <StatCard label="Win Rate" value={`${winRate}%`} color={colors.primary} />
      </View>

      {/* Quick Play */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Quick Play
        </Text>
      </View>
      <View style={styles.quickPlayRow}>
        {(["1v1", "3v3", "5v5"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.quickPlayBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() =>
              router.push({ pathname: "/game/create", params: { mode } })
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.quickPlayMode, { color: colors.primary }]}>
              {mode}
            </Text>
            <Text
              style={[styles.quickPlayLabel, { color: colors.mutedForeground }]}
            >
              Play Now
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Tip */}
      <TouchableOpacity
        style={[
          styles.tipCard,
          {
            backgroundColor: colors.primary + "15",
            borderColor: colors.primary + "44",
          },
        ]}
        onPress={() => router.push("/coach")}
        activeOpacity={0.85}
      >
        <View style={styles.tipHeader}>
          <Feather name="cpu" size={16} color={colors.primary} />
          <Text style={[styles.tipLabel, { color: colors.primary }]}>
            AI Coach Tip
          </Text>
          <Feather name="chevron-right" size={16} color={colors.primary} />
        </View>
        <Text style={[styles.tipText, { color: colors.foreground }]}>
          "{tip}"
        </Text>
      </TouchableOpacity>

      {/* Recent Games */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recent Games
        </Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/play")}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {recentGames.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="activity" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No games yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Create or join a game to get started
          </Text>
        </View>
      ) : (
        recentGames.map((game) => <GameCard key={game.id} game={game} compact />)
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: "500" as const },
  name: { fontSize: 24, fontWeight: "800" as const },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700" as const },
  rankCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  rankRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  rankInfo: { flex: 1, gap: 4 },
  rankTitle: { fontSize: 18, fontWeight: "700" as const },
  rankPoints: { fontSize: 13 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  streakText: { fontSize: 11, fontWeight: "600" as const },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coinsText: { fontSize: 16, fontWeight: "700" as const },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  seeAll: { fontSize: 13, fontWeight: "600" as const },
  quickPlayRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickPlayBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  quickPlayMode: { fontSize: 18, fontWeight: "800" as const },
  quickPlayLabel: { fontSize: 11, fontWeight: "500" as const },
  tipCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipLabel: { flex: 1, fontSize: 13, fontWeight: "600" as const },
  tipText: { fontSize: 14, lineHeight: 22, fontStyle: "italic" },
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
