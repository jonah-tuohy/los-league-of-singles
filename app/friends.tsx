import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { rankColors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";
import { RankBadge } from "@/components/RankBadge";

interface FriendEntry {
  id: string;
  name: string;
  username: string;
  rank: string;
  avatar: string;
  wins: number;
  online: boolean;
  title?: string;
}

type FriendStatus = "friend" | "pending_sent" | "pending_received" | "none";

const ALL_PLAYERS: FriendEntry[] = [
  { id: "l1", name: "Marcus Webb", username: "mwebb23", rank: "Legend", avatar: "MW", wins: 187, online: true, title: "Born Legend" },
  { id: "l2", name: "Jaylen Cross", username: "jcross", rank: "Elite", avatar: "JC", wins: 143, online: false, title: "Unstoppable" },
  { id: "l3", name: "DeShawn Miles", username: "dmiles", rank: "Elite", avatar: "DM", wins: 128, online: true, title: "Court King" },
  { id: "l4", name: "Kayla Storm", username: "kstorm_bball", rank: "Diamond", avatar: "KS", wins: 96, online: true, title: "Diamond Mentality" },
  { id: "l5", name: "Trevon Hart", username: "thart21", rank: "Diamond", avatar: "TH", wins: 89, online: false },
  { id: "l6", name: "Amir Johnson", username: "amirj", rank: "Platinum", avatar: "AJ", wins: 67, online: true, title: "Gold Standard" },
  { id: "l7", name: "Brianna Cole", username: "bcole_hoops", rank: "Platinum", avatar: "BC", wins: 59, online: false },
  { id: "l8", name: "Zeke Monroe", username: "zmonroe", rank: "Gold", avatar: "ZM", wins: 44, online: true },
  { id: "l9", name: "Priya Nair", username: "pnair_bball", rank: "Gold", avatar: "PN", wins: 36, online: false },
  { id: "l10", name: "Chris Vega", username: "cvega10", rank: "Silver", avatar: "CV", wins: 25, online: true, title: "Hat Trick" },
  { id: "l11", name: "Jordan Blake", username: "jblake_hoop", rank: "Bronze", avatar: "JB", wins: 12, online: false },
  { id: "l12", name: "Destiny Rowe", username: "drowe_bball", rank: "Silver", avatar: "DR", wins: 18, online: true },
  { id: "l13", name: "Malik Osei", username: "mosei_court", rank: "Gold", avatar: "MO", wins: 31, online: false },
  { id: "l14", name: "Sofia Vang", username: "svang_hoops", rank: "Rookie", avatar: "SV", wins: 3, online: true },
  { id: "l15", name: "Isaiah Torres", username: "itorre_bball", rank: "Bronze", avatar: "IT", wins: 8, online: false },
];

const INITIAL_FRIENDS = new Set(["l1", "l3", "l6", "l8"]);
const INITIAL_RECEIVED = new Set(["l4", "l10"]);

export default function FriendsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "discover">("friends");
  const [friends, setFriends] = useState<Set<string>>(INITIAL_FRIENDS);
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
  const [pendingReceived, setPendingReceived] = useState<Set<string>>(INITIAL_RECEIVED);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 20;

  const getStatus = (id: string): FriendStatus => {
    if (friends.has(id)) return "friend";
    if (pendingSent.has(id)) return "pending_sent";
    if (pendingReceived.has(id)) return "pending_received";
    return "none";
  };

  const sendRequest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingSent((prev) => new Set([...prev, id]));
  };

  const cancelRequest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingSent((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const acceptRequest = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFriends((prev) => new Set([...prev, id]));
    setPendingReceived((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const declineRequest = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingReceived((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const removeFriend = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFriends((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const friendList = ALL_PLAYERS.filter((p) => friends.has(p.id));
  const receivedList = ALL_PLAYERS.filter((p) => pendingReceived.has(p.id));
  const sentList = ALL_PLAYERS.filter((p) => pendingSent.has(p.id));
  const discoverList = ALL_PLAYERS.filter((p) => !friends.has(p.id) && !pendingReceived.has(p.id));

  const searchFilter = (p: FriendEntry) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase());

  const filteredFriends = friendList.filter(searchFilter);
  const filteredDiscover = discoverList.filter(searchFilter);

  const onlineCount = friendList.filter((f) => f.online).length;

  const renderPlayer = (player: FriendEntry, status: FriendStatus) => {
    const rankColor = rankColors[player.rank] || colors.primary;
    return (
      <View
        key={player.id}
        style={[
          styles.playerRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.playerLeft}>
          <View style={[styles.avatar, { backgroundColor: rankColor + "22", borderColor: rankColor }]}>
            <Text style={[styles.avatarText, { color: rankColor }]}>{player.avatar}</Text>
          </View>
          {player.online && (
            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
          )}
        </View>
        <View style={styles.playerInfo}>
          <View style={styles.playerNameRow}>
            <Text style={[styles.playerName, { color: colors.foreground }]}>{player.name}</Text>
            {player.title && (
              <Text style={[styles.playerTitle, { color: colors.accent }]}>{player.title}</Text>
            )}
          </View>
          <Text style={[styles.playerUsername, { color: colors.mutedForeground }]}>
            @{player.username}
          </Text>
          <View style={styles.playerMeta}>
            <RankBadge rank={player.rank} size="sm" showLabel={false} />
            <Text style={[styles.playerMetaText, { color: colors.mutedForeground }]}>
              {player.rank} · {player.wins}W
            </Text>
            {player.online ? (
              <Text style={[styles.onlineText, { color: colors.success }]}>● Online</Text>
            ) : (
              <Text style={[styles.offlineText, { color: colors.mutedForeground }]}>● Offline</Text>
            )}
          </View>
        </View>
        <View style={styles.actionCol}>
          {status === "friend" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => removeFriend(player.id)}
              activeOpacity={0.8}
            >
              <Feather name="user-check" size={14} color={colors.success} />
              <Text style={[styles.actionBtnText, { color: colors.success }]}>Friends</Text>
            </TouchableOpacity>
          )}
          {status === "none" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => sendRequest(player.id)}
              activeOpacity={0.8}
            >
              <Feather name="user-plus" size={14} color="#fff" />
              <Text style={[styles.actionBtnText, { color: "#fff" }]}>Add</Text>
            </TouchableOpacity>
          )}
          {status === "pending_sent" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={() => cancelRequest(player.id)}
              activeOpacity={0.8}
            >
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Pending</Text>
            </TouchableOpacity>
          )}
          {status === "pending_received" && (
            <View style={styles.acceptRejectRow}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.primary }]}
                onPress={() => acceptRequest(player.id)}
                activeOpacity={0.8}
              >
                <Feather name="check" size={14} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => declineRequest(player.id)}
                activeOpacity={0.8}
              >
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="friends" />
      <BasketballBorder />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Find Friends</Text>
        <View style={[styles.friendCount, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.friendCountText, { color: colors.primary }]}>
            {friends.size} friends
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or @username..."
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sub tabs */}
      <View style={[styles.subTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["friends", "requests", "discover"] as const).map((t) => {
          const badge =
            t === "friends" ? friendList.length :
            t === "requests" ? receivedList.length + sentList.length :
            undefined;
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.subTab,
                activeTab === t && { backgroundColor: colors.primary, borderRadius: 10 },
              ]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.subTabText,
                { color: activeTab === t ? "#fff" : colors.mutedForeground },
              ]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {badge !== undefined && badge > 0 && (
                <View style={[
                  styles.tabBadge,
                  { backgroundColor: activeTab === t ? "#ffffff44" : colors.primary },
                ]}>
                  <Text style={styles.tabBadgeText}>{badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.listContent, { paddingBottom: botPad + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Friends tab */}
        {activeTab === "friends" && (
          <>
            {onlineCount > 0 && (
              <View style={[styles.onlineBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "33" }]}>
                <View style={[styles.onlineDotLg, { backgroundColor: colors.success }]} />
                <Text style={[styles.onlineBannerText, { color: colors.success }]}>
                  {onlineCount} friend{onlineCount > 1 ? "s" : ""} online now
                </Text>
              </View>
            )}
            {filteredFriends.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="users" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  {search ? "No friends match" : "No friends yet"}
                </Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {search ? "Try a different search" : "Switch to Discover to find players"}
                </Text>
              </View>
            ) : (
              filteredFriends.map((p) => renderPlayer(p, "friend"))
            )}
          </>
        )}

        {/* Requests tab */}
        {activeTab === "requests" && (
          <>
            {receivedList.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  INCOMING REQUESTS
                </Text>
                {receivedList.map((p) => renderPlayer(p, "pending_received"))}
              </>
            )}
            {sentList.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  SENT REQUESTS
                </Text>
                {sentList.map((p) => renderPlayer(p, "pending_sent"))}
              </>
            )}
            {receivedList.length === 0 && sentList.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="inbox" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Requests</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Incoming and sent friend requests will appear here
                </Text>
              </View>
            )}
          </>
        )}

        {/* Discover tab */}
        {activeTab === "discover" && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              PLAYERS TO MEET
            </Text>
            {filteredDiscover.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="search" size={28} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Results</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              filteredDiscover.map((p) => renderPlayer(p, getStatus(p.id)))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  pageTitle: { flex: 1, fontSize: 22, fontWeight: "800" as const },
  friendCount: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  friendCountText: { fontSize: 12, fontWeight: "700" as const },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  subTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
  },
  subTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
  },
  subTabText: { fontSize: 12, fontWeight: "600" as const },
  tabBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadgeText: { fontSize: 10, fontWeight: "800" as const, color: "#fff" },
  listContent: { paddingHorizontal: 20, gap: 10, paddingTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 4,
  },
  onlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  onlineDotLg: { width: 8, height: 8, borderRadius: 4 },
  onlineBannerText: { fontSize: 13, fontWeight: "600" as const },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  playerLeft: { position: "relative" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700" as const },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: "#050D1A",
  },
  playerInfo: { flex: 1, gap: 3 },
  playerNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" as const },
  playerName: { fontSize: 14, fontWeight: "700" as const },
  playerTitle: { fontSize: 10, fontWeight: "600" as const },
  playerUsername: { fontSize: 12 },
  playerMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  playerMetaText: { fontSize: 11 },
  onlineText: { fontSize: 11, fontWeight: "600" as const },
  offlineText: { fontSize: 11 },
  actionCol: { alignItems: "flex-end" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" as const },
  acceptRejectRow: { flexDirection: "row", gap: 8 },
  smallBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
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
