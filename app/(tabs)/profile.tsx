import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorsHook } from "@/hooks/useColors";
import { rankColors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";
import { RankBadge } from "@/components/RankBadge";
import { StatCard } from "@/components/StatCard";
import { MembershipBanner } from "@/components/MembershipBanner";

const MODE_STATS = [
  { key: "mode1v1W", label: "1v1 Wins" },
  { key: "mode2v2W", label: "2v2 Wins" },
  { key: "mode3v3W", label: "3v3 Wins" },
  { key: "mode4v4W", label: "4v4 Wins" },
  { key: "mode5v5W", label: "5v5 Wins" },
] as const;

export default function ProfileScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser, upgradeMembership } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [activeTab, setActiveTab] = useState<"stats" | "titles" | "membership">("stats");

  const winRate = user.wins + user.losses > 0
    ? Math.round((user.wins / (user.wins + user.losses)) * 100)
    : 0;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const rankColor = rankColors[user.rank] || colors.primary;

  const handleSave = () => {
    updateUser({ name: editName, username: editUsername, avatar: (editName[0] + (editUsername[0] || "")).toUpperCase() });
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleUpgrade = () => {
    if (user.coins < 999) {
      Alert.alert("Not enough coins", "You need 999 coins to upgrade. Win more games to earn coins!");
      return;
    }
    Alert.alert(
      "Upgrade to LOS Pro",
      "999 coins will be deducted from your wallet. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upgrade",
          onPress: () => {
            upgradeMembership();
            updateUser({ coins: user.coins - 999 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const earnedTitles = user.titles.filter((t) => t.earned);
  const lockedTitles = user.titles.filter((t) => !t.earned);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="profile" />
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
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.bigAvatar, { backgroundColor: rankColor + "22", borderColor: rankColor }]}>
          <Text style={[styles.bigAvatarText, { color: rankColor }]}>{user.avatar}</Text>
        </View>
        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={[styles.editInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.input }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Display name"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[styles.editInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.input }]}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="Username"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{user.name}</Text>
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.profileUsername, { color: colors.mutedForeground }]}>
              @{user.username}
            </Text>
            {user.membership === "pro" && (
              <View style={[styles.proBadge, { backgroundColor: colors.gold }]}>
                <Feather name="zap" size={10} color="#000" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.rankContainer}>
          <RankBadge rank={user.rank} size="md" />
        </View>
      </View>

      {/* Coins & Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.coinCard, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "44" }]}>
          <Feather name="dollar-sign" size={18} color={colors.gold} />
          <Text style={[styles.coinAmount, { color: colors.gold }]}>{user.coins}</Text>
          <Text style={[styles.coinLabel, { color: colors.mutedForeground }]}>Coins</Text>
        </View>
        <StatCard label="Wins" value={user.wins} color={colors.success} />
        <StatCard label="Win Rate" value={`${winRate}%`} color={colors.primary} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["stats", "titles", "membership"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: colors.primary, borderRadius: 10 },
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <View style={styles.tabContent}>
          <View style={styles.modeStats}>
            {MODE_STATS.map((s) => (
              <View
                key={s.key}
                style={[styles.modeStat, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.modeStatValue, { color: colors.primary }]}>
                  {user[s.key]}
                </Text>
                <Text style={[styles.modeStatLabel, { color: colors.mutedForeground }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.extraStats}>
            <View style={[styles.extraStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="trending-up" size={16} color={colors.accent} />
              <Text style={[styles.extraStatValue, { color: colors.foreground }]}>
                {user.winStreak}
              </Text>
              <Text style={[styles.extraStatLabel, { color: colors.mutedForeground }]}>
                Current Streak
              </Text>
            </View>
            <View style={[styles.extraStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <Text style={[styles.extraStatValue, { color: colors.foreground }]}>
                {new Date(user.joinedAt).toLocaleDateString("en", { month: "short", year: "numeric" })}
              </Text>
              <Text style={[styles.extraStatLabel, { color: colors.mutedForeground }]}>
                Member Since
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.coachBtn, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}
            onPress={() => router.push("/coach")}
            activeOpacity={0.85}
          >
            <Feather name="cpu" size={18} color={colors.primary} />
            <Text style={[styles.coachBtnText, { color: colors.primary }]}>Open AI Coach</Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.coachBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={() => router.push("/training")}
            activeOpacity={0.85}
          >
            <Feather name="activity" size={18} color={colors.foreground} />
            <Text style={[styles.coachBtnText, { color: colors.foreground }]}>Training Program</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* Titles Tab */}
      {activeTab === "titles" && (
        <View style={styles.tabContent}>
          {earnedTitles.length > 0 && (
            <>
              <Text style={[styles.titlesSection, { color: colors.foreground }]}>Earned</Text>
              {earnedTitles.map((t) => (
                <View
                  key={t.id}
                  style={[styles.titleCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "44" }]}
                >
                  <Feather name="award" size={20} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.titleName, { color: colors.foreground }]}>{t.name}</Text>
                    <Text style={[styles.titleDesc, { color: colors.mutedForeground }]}>{t.description}</Text>
                  </View>
                  <Feather name="check-circle" size={18} color={colors.success} />
                </View>
              ))}
            </>
          )}
          <Text style={[styles.titlesSection, { color: colors.foreground }]}>Locked</Text>
          {lockedTitles.map((t) => (
            <View
              key={t.id}
              style={[styles.titleCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.6 }]}
            >
              <Feather name="lock" size={18} color={colors.mutedForeground} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.titleName, { color: colors.foreground }]}>{t.name}</Text>
                <Text style={[styles.titleDesc, { color: colors.mutedForeground }]}>{t.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Membership Tab */}
      {activeTab === "membership" && (
        <View style={styles.tabContent}>
          {user.membership === "pro" ? (
            <View style={[styles.proActive, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "44" }]}>
              <Feather name="zap" size={32} color={colors.gold} />
              <Text style={[styles.proActiveTitle, { color: colors.foreground }]}>You're a Pro!</Text>
              <Text style={[styles.proActiveSubtitle, { color: colors.mutedForeground }]}>
                All premium features are unlocked
              </Text>
            </View>
          ) : (
            <MembershipBanner onUpgrade={handleUpgrade} />
          )}
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  profileHeader: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  bigAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  bigAvatarText: { fontSize: 20, fontWeight: "700" as const },
  profileInfo: { flex: 1, gap: 4 },
  profileNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  profileName: { fontSize: 18, fontWeight: "700" as const },
  profileUsername: { fontSize: 13 },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  proBadgeText: { fontSize: 10, fontWeight: "800" as const, color: "#000" },
  rankContainer: { alignItems: "center" },
  editForm: { flex: 1, gap: 8 },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  saveBtn: { paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  saveBtnText: { fontSize: 14, fontWeight: "700" as const },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  coinCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 2,
  },
  coinAmount: { fontSize: 22, fontWeight: "800" as const },
  coinLabel: { fontSize: 11, fontWeight: "500" as const },
  tabs: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: "center" },
  tabText: { fontSize: 13, fontWeight: "600" as const },
  tabContent: { gap: 12 },
  modeStats: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  modeStat: {
    width: "47%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  modeStatValue: { fontSize: 24, fontWeight: "800" as const },
  modeStatLabel: { fontSize: 11 },
  extraStats: { flexDirection: "row", gap: 10 },
  extraStat: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  extraStatValue: { fontSize: 16, fontWeight: "700" as const },
  extraStatLabel: { fontSize: 11, textAlign: "center" },
  coachBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  coachBtnText: { flex: 1, fontSize: 15, fontWeight: "600" as const },
  titlesSection: { fontSize: 15, fontWeight: "700" as const, marginTop: 4 },
  titleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  titleName: { fontSize: 14, fontWeight: "700" as const },
  titleDesc: { fontSize: 12, marginTop: 2 },
  proActive: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  proActiveTitle: { fontSize: 24, fontWeight: "800" as const },
  proActiveSubtitle: { fontSize: 14, textAlign: "center" },
});
