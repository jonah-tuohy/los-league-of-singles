import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorsHook } from "@/hooks/useColors";
import { rankColors, rankThresholds, rankEmojis, rankGradients } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";
import { RankBadge } from "@/components/RankBadge";

const FILTERS = ["Global", "Weekly", "By Mode"] as const;

const DIVISION_PERKS: Record<string, string[]> = {
  Rookie:   ["Access to standard games", "AI Ref support", "Basic leaderboard"],
  Bronze:   ["All Rookie perks", "Bronze title frame", "Bet up to 100 coins/game"],
  Silver:   ["All Bronze perks", "Silver title frame", "Custom avatar border", "Weekly silver chest"],
  Gold:     ["All Silver perks", "Gold title frame", "Priority matchmaking", "Gold chest weekly"],
  Platinum: ["All Gold perks", "Platinum badge", "2× LP on win streaks", "Exclusive court access"],
  Diamond:  ["All Platinum perks", "Diamond glow effect", "3× LP win streak bonus", "Diamond chest"],
  Elite:    ["All Diamond perks", "Elite rank aura", "5× LP on win streaks", "Elite season rewards"],
  Legend:   ["All Elite perks", "👑 Legend crown", "Unlimited bets", "Season MVP nomination", "Legacy title"],
};

const MOCK_PLAYER_COUNTS: Record<string, number> = {
  Rookie: 5840, Bronze: 3120, Silver: 1890, Gold: 940,
  Platinum: 420, Diamond: 180, Elite: 62, Legend: 11,
};

type PageTab = "leaderboard" | "divisions";

export default function LeaderboardScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const { leaderboard, user } = useApp();
  const [filter, setFilter] = useState<typeof FILTERS[number]>("Global");
  const [pageTab, setPageTab] = useState<PageTab>("leaderboard");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 100;

  const userEntry = {
    id: user.id,
    name: user.name,
    username: user.username,
    rank: user.rank,
    points: user.points,
    wins: user.wins,
    avatar: user.avatar,
    title: user.titles.find((t) => t.earned)?.name,
  };

  const fullList = [userEntry, ...leaderboard]
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  const renderLeaderItem = ({ item, index }: { item: typeof fullList[number]; index: number }) => {
    const isUser = item.id === user.id;
    const position = index + 1;
    const medalColor =
      position === 1 ? colors.gold :
      position === 2 ? colors.silver :
      position === 3 ? colors.bronze :
      colors.mutedForeground;

    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: isUser ? colors.primary + "18" : colors.card,
            borderColor: isUser ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.positionContainer}>
          {position <= 3 ? (
            <Feather name="award" size={18} color={medalColor} />
          ) : (
            <Text style={[styles.position, { color: colors.mutedForeground }]}>#{position}</Text>
          )}
        </View>
        <View
          style={[styles.avatar, { backgroundColor: (rankColors[item.rank] || colors.primary) + "22", borderColor: rankColors[item.rank] || colors.primary }]}
        >
          <Text style={[styles.avatarText, { color: rankColors[item.rank] || colors.primary }]}>{item.avatar}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
            {isUser && (
              <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.youText}>YOU</Text>
              </View>
            )}
          </View>
          {item.title && <Text style={[styles.titleLabel, { color: colors.accent }]}>{item.title}</Text>}
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{item.username}</Text>
        </View>
        <View style={styles.right}>
          <RankBadge rank={item.rank} size="sm" showLabel={false} />
          <Text style={[styles.points, { color: colors.primary }]}>{item.points.toLocaleString()}</Text>
          <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>LP</Text>
        </View>
      </View>
    );
  };

  const renderDivisions = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.divContent, { paddingBottom: botPad }]}
      showsVerticalScrollIndicator={false}
    >
      {/* User's current position */}
      <View style={[styles.yourRankBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
        <Text style={{ fontSize: 28 }}>{rankEmojis[user.rank] ?? "🏀"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.yourRankLabel, { color: colors.mutedForeground }]}>YOUR CURRENT RANK</Text>
          <Text style={[styles.yourRankName, { color: colors.primary }]}>{user.rank}</Text>
          <Text style={[styles.yourRankPts, { color: colors.mutedForeground }]}>{user.points} LP earned</Text>
        </View>
        <RankBadge rank={user.rank} size="md" showLabel={false} />
      </View>

      {/* All 8 tiers */}
      {rankThresholds.map((tier, idx) => {
        const isCurrentRank = tier.name === user.rank;
        const rc = rankColors[tier.name] || colors.primary;
        const emoji = rankEmojis[tier.name] ?? "🏀";
        const perks = DIVISION_PERKS[tier.name] ?? [];
        const playerCount = MOCK_PLAYER_COUNTS[tier.name] ?? 0;
        const isMaxed = tier.max === Infinity;

        return (
          <View
            key={tier.name}
            style={[
              styles.divCard,
              {
                backgroundColor: colors.card,
                borderColor: isCurrentRank ? rc : colors.border,
                borderWidth: isCurrentRank ? 2.5 : 1,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.divHeader, { backgroundColor: rc + "18" }]}>
              <Text style={styles.divEmoji}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.divTitleRow}>
                  <Text style={[styles.divName, { color: rc }]}>{tier.name}</Text>
                  {isCurrentRank && (
                    <View style={[styles.currentBadge, { backgroundColor: rc }]}>
                      <Feather name="map-pin" size={10} color="#fff" />
                      <Text style={styles.currentBadgeText}>YOU ARE HERE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.divLpRange, { color: colors.mutedForeground }]}>
                  {isMaxed ? `${tier.min}+ LP` : `${tier.min} – ${tier.max} LP`}
                </Text>
              </View>
              <View style={styles.divMeta}>
                <Feather name="users" size={11} color={colors.mutedForeground} />
                <Text style={[styles.divPlayerCount, { color: colors.mutedForeground }]}>
                  {playerCount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.divDesc, { color: colors.foreground }]}>{tier.desc}</Text>

            {/* LP Bar (current rank) */}
            {isCurrentRank && !isMaxed && (
              <View style={styles.lpBarSection}>
                <View style={[styles.lpBarTrack, { backgroundColor: colors.secondary }]}>
                  <View
                    style={[
                      styles.lpBarFill,
                      {
                        backgroundColor: rc,
                        width: `${Math.min(100, ((user.points - tier.min) / (tier.max - tier.min)) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.lpBarLabel, { color: colors.mutedForeground }]}>
                  {user.points - tier.min} / {tier.max - tier.min} LP to next rank
                </Text>
              </View>
            )}
            {isCurrentRank && isMaxed && (
              <View style={[styles.maxedBanner, { backgroundColor: rc + "18" }]}>
                <Text style={{ fontSize: 16 }}>👑</Text>
                <Text style={[styles.maxedText, { color: rc }]}>Maximum rank achieved!</Text>
              </View>
            )}

            {/* Perks */}
            <View style={styles.perksSection}>
              <Text style={[styles.perksTitle, { color: colors.mutedForeground }]}>DIVISION PERKS</Text>
              <View style={styles.perksList}>
                {perks.map((perk, pi) => (
                  <View key={pi} style={styles.perkRow}>
                    <View style={[styles.perkDot, { backgroundColor: rc }]} />
                    <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tier position line */}
            {idx < rankThresholds.length - 1 && (
              <View style={[styles.tierArrow, { borderColor: rc + "33" }]}>
                <Feather name="chevron-down" size={16} color={rc + "88"} />
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="leaderboard" />
      <BasketballBorder />

      {/* Header */}
      <View style={[styles.pageHeader, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Ranks</Text>
      </View>

      {/* Page tabs */}
      <View style={[styles.pageTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.pageTab, pageTab === "leaderboard" && { backgroundColor: colors.primary, borderRadius: 10 }]}
          onPress={() => setPageTab("leaderboard")}
          activeOpacity={0.8}
        >
          <Feather name="award" size={13} color={pageTab === "leaderboard" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.pageTabText, { color: pageTab === "leaderboard" ? "#fff" : colors.mutedForeground }]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pageTab, pageTab === "divisions" && { backgroundColor: colors.primary, borderRadius: 10 }]}
          onPress={() => setPageTab("divisions")}
          activeOpacity={0.8}
        >
          <Feather name="layers" size={13} color={pageTab === "divisions" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.pageTabText, { color: pageTab === "divisions" ? "#fff" : colors.mutedForeground }]}>
            Divisions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard tab */}
      {pageTab === "leaderboard" && (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: botPad }]}
          ListHeaderComponent={() => (
            <>
              {/* Filter row */}
              <View style={styles.filterRow}>
                {FILTERS.map((f) => (
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
                    <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.mutedForeground }]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Podium */}
              {fullList.length >= 3 && (
                <View style={styles.podium}>
                  <View style={[styles.podiumItem, { marginTop: 24 }]}>
                    <View style={[styles.podiumAvatar, { borderColor: colors.silver, backgroundColor: colors.silver + "22" }]}>
                      <Text style={[styles.podiumAvatarText, { color: colors.silver }]}>{fullList[1].avatar}</Text>
                    </View>
                    <View style={[styles.podiumBase, { backgroundColor: colors.silver + "33", height: 60 }]}>
                      <Feather name="award" size={16} color={colors.silver} />
                      <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>{fullList[1].name.split(" ")[0]}</Text>
                    </View>
                  </View>
                  <View style={styles.podiumItem}>
                    <View style={[styles.podiumAvatar, { borderColor: colors.gold, backgroundColor: colors.gold + "22" }]}>
                      <Text style={[styles.podiumAvatarText, { color: colors.gold }]}>{fullList[0].avatar}</Text>
                    </View>
                    <View style={[styles.podiumBase, { backgroundColor: colors.gold + "33", height: 80 }]}>
                      <Feather name="award" size={18} color={colors.gold} />
                      <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>{fullList[0].name.split(" ")[0]}</Text>
                    </View>
                  </View>
                  <View style={[styles.podiumItem, { marginTop: 40 }]}>
                    <View style={[styles.podiumAvatar, { borderColor: colors.bronze, backgroundColor: colors.bronze + "22" }]}>
                      <Text style={[styles.podiumAvatarText, { color: colors.bronze }]}>{fullList[2].avatar}</Text>
                    </View>
                    <View style={[styles.podiumBase, { backgroundColor: colors.bronze + "33", height: 44 }]}>
                      <Feather name="award" size={14} color={colors.bronze} />
                      <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>{fullList[2].name.split(" ")[0]}</Text>
                    </View>
                  </View>
                </View>
              )}
              <Text style={[styles.listHeader, { color: colors.mutedForeground }]}>All Players</Text>
            </>
          )}
          data={fullList}
          keyExtractor={(item) => item.id}
          renderItem={renderLeaderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Divisions tab */}
      {pageTab === "divisions" && renderDivisions()}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pageHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: "800" as const },
  pageTabs: {
    flexDirection: "row", marginHorizontal: 20, marginBottom: 10,
    borderRadius: 14, borderWidth: 1, padding: 4,
  },
  pageTab: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, paddingVertical: 9,
  },
  pageTabText: { fontSize: 12, fontWeight: "600" as const },
  content: { paddingHorizontal: 20 },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterText: { fontSize: 13, fontWeight: "600" as const },
  podium: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "flex-end", gap: 8, marginBottom: 24,
  },
  podiumItem: { alignItems: "center", width: 90 },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2.5,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  podiumAvatarText: { fontSize: 16, fontWeight: "700" as const },
  podiumBase: {
    width: "100%", borderRadius: 12, alignItems: "center",
    justifyContent: "flex-end", paddingBottom: 10, gap: 4,
  },
  podiumName: { fontSize: 11, fontWeight: "700" as const },
  listHeader: {
    fontSize: 12, fontWeight: "600" as const,
    textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1, gap: 12 },
  positionContainer: { width: 32, alignItems: "center" },
  position: { fontSize: 14, fontWeight: "700" as const },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700" as const },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 14, fontWeight: "700" as const },
  youBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  youText: { fontSize: 9, fontWeight: "800" as const, color: "#fff" },
  titleLabel: { fontSize: 11, fontWeight: "600" as const },
  username: { fontSize: 11 },
  right: { alignItems: "center", gap: 2 },
  points: { fontSize: 16, fontWeight: "800" as const },
  pointsLabel: { fontSize: 10 },
  // Divisions
  divContent: { paddingHorizontal: 16, gap: 4, paddingTop: 4 },
  yourRankBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1.5, marginBottom: 8,
  },
  yourRankLabel: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 1 },
  yourRankName: { fontSize: 20, fontWeight: "800" as const },
  yourRankPts: { fontSize: 12 },
  divCard: { borderRadius: 18, overflow: "hidden" as const, marginBottom: 12 },
  divHeader: {
    flexDirection: "row", alignItems: "center",
    gap: 12, padding: 14,
  },
  divEmoji: { fontSize: 30 },
  divTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  divName: { fontSize: 18, fontWeight: "800" as const },
  currentBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  currentBadgeText: { fontSize: 8, fontWeight: "800" as const, color: "#fff", letterSpacing: 0.5 },
  divLpRange: { fontSize: 12, fontWeight: "600" as const, marginTop: 2 },
  divMeta: { alignItems: "center", gap: 2 },
  divPlayerCount: { fontSize: 11 },
  divDesc: { fontSize: 13, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 12 },
  lpBarSection: { paddingHorizontal: 14, paddingBottom: 12, gap: 6 },
  lpBarTrack: { height: 8, borderRadius: 4, overflow: "hidden" as const },
  lpBarFill: { height: "100%", borderRadius: 4 },
  lpBarLabel: { fontSize: 11 },
  maxedBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 10, marginHorizontal: 14, marginBottom: 12, borderRadius: 10,
  },
  maxedText: { fontSize: 13, fontWeight: "700" as const },
  perksSection: { paddingHorizontal: 14, paddingBottom: 16 },
  perksTitle: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 1.2, marginBottom: 8 },
  perksList: { gap: 6 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  perkDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  perkText: { fontSize: 12, flex: 1 },
  tierArrow: { alignItems: "center", paddingBottom: 0, marginBottom: -16, marginTop: -8 },
});
