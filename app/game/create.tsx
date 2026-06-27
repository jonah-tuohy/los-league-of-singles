import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorsHook } from "@/hooks/useColors";
import { rankColors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import type { Game, GamePlayer } from "@/context/AppContext";

const MODES = ["1v1", "2v2", "3v3", "4v4", "5v5"] as const;
const BET_OPTIONS = [0, 50, 100, 200, 500] as const;
const COURTS = [
  "Riverside Basketball Court",
  "Central Sports Complex",
  "Eastside Courts",
  "West End Hoops",
  "North Park Courts",
];

function generateAIOpponent(rank: string): GamePlayer {
  const names = ["Marcus W.", "Jaylen C.", "DeShawn M.", "Kayla S.", "Trevon H.", "Amir J.", "Zeke M.", "Chris V."];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    id: Date.now().toString(36),
    name,
    rank,
    avatar: (name[0] + name.split(" ")[1][0]).toUpperCase(),
  };
}

function fillTeam(count: number, userPlayer: GamePlayer, userRank: string): GamePlayer[] {
  const team: GamePlayer[] = [userPlayer];
  for (let i = 1; i < count; i++) {
    team.push(generateAIOpponent(userRank));
  }
  return team;
}

export default function CreateGameScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { user, createGame, updateUser } = useApp();

  const [selectedMode, setSelectedMode] = useState<typeof MODES[number]>(
    (params.mode as typeof MODES[number]) || "1v1"
  );
  const [selectedBet, setSelectedBet] = useState<number>(0);
  const [selectedCourt, setSelectedCourt] = useState(COURTS[0]);
  const [aiRef, setAiRef] = useState(true);

  const teamSize =
    selectedMode === "1v1" ? 1 :
    selectedMode === "2v2" ? 2 :
    selectedMode === "3v3" ? 3 :
    selectedMode === "4v4" ? 4 : 5;

  const totalPlayers = teamSize * 2;
  const totalPot = selectedBet * totalPlayers;
  const winnerPot = Math.floor(totalPot * 0.8);
  const houseCut = totalPot - winnerPot;

  const handleStart = () => {
    if (selectedBet > 0 && user.coins < selectedBet) {
      Alert.alert("Insufficient Coins", `You need ${selectedBet} coins to place this bet. Win more games to earn coins!`);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const userPlayer: GamePlayer = { id: user.id, name: user.name, rank: user.rank, avatar: user.avatar };
    const team1 = fillTeam(teamSize, userPlayer, user.rank);
    const team2 = Array.from({ length: teamSize }, () => generateAIOpponent(user.rank));

    const game: Omit<Game, "id" | "createdAt"> = {
      mode: selectedMode,
      status: "active",
      team1,
      team2,
      team1Score: 0,
      team2Score: 0,
      betPerPlayer: selectedBet,
      totalPot,
      courtName: selectedCourt,
      aiRefEnabled: aiRef,
    };

    if (selectedBet > 0) {
      updateUser({ coins: user.coins - selectedBet });
    }

    const created = createGame(game);
    router.replace({ pathname: "/game/[id]", params: { id: created.id } });
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Create Game</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selection */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>GAME MODE</Text>
      <View style={styles.modeRow}>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeBtn,
              selectedMode === mode
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              setSelectedMode(mode);
              Haptics.selectionAsync();
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeBtnText,
                { color: selectedMode === mode ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bet Selection */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BET PER PLAYER</Text>
      <View style={styles.betRow}>
        {BET_OPTIONS.map((bet) => (
          <TouchableOpacity
            key={bet}
            style={[
              styles.betBtn,
              selectedBet === bet
                ? { backgroundColor: colors.gold, borderColor: colors.gold }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => {
              setSelectedBet(bet);
              Haptics.selectionAsync();
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.betBtnText,
                { color: selectedBet === bet ? "#000" : colors.mutedForeground },
              ]}
            >
              {bet === 0 ? "Free" : `${bet}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pot Summary */}
      {totalPot > 0 && (
        <View style={[styles.potCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.potRow}>
            <Text style={[styles.potLabel, { color: colors.mutedForeground }]}>Total Pot</Text>
            <Text style={[styles.potValue, { color: colors.foreground }]}>{totalPot} coins</Text>
          </View>
          <View style={styles.potRow}>
            <Text style={[styles.potLabel, { color: colors.mutedForeground }]}>Winner earns</Text>
            <Text style={[styles.potValue, { color: colors.success }]}>{winnerPot} coins (80%)</Text>
          </View>
          <View style={styles.potRow}>
            <Text style={[styles.potLabel, { color: colors.mutedForeground }]}>Platform fee</Text>
            <Text style={[styles.potValue, { color: colors.mutedForeground }]}>{houseCut} coins (20%)</Text>
          </View>
          <View style={[styles.potDivider, { backgroundColor: colors.border }]} />
          <View style={styles.potRow}>
            <Text style={[styles.potLabel, { color: colors.mutedForeground }]}>Your balance</Text>
            <Text
              style={[
                styles.potValue,
                { color: user.coins >= selectedBet ? colors.gold : colors.destructive },
              ]}
            >
              {user.coins} coins
            </Text>
          </View>
        </View>
      )}

      {/* Court Selection */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>COURT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courtScroll}>
        <View style={styles.courtRow}>
          {COURTS.map((court) => (
            <TouchableOpacity
              key={court}
              style={[
                styles.courtBtn,
                selectedCourt === court
                  ? { backgroundColor: colors.primary + "22", borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setSelectedCourt(court)}
              activeOpacity={0.8}
            >
              <Feather
                name="map-pin"
                size={12}
                color={selectedCourt === court ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.courtBtnText,
                  { color: selectedCourt === court ? colors.primary : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {court}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* AI Ref Toggle */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AI REFEREE</Text>
      <TouchableOpacity
        style={[
          styles.toggleCard,
          {
            backgroundColor: aiRef ? colors.primary + "18" : colors.card,
            borderColor: aiRef ? colors.primary : colors.border,
          },
        ]}
        onPress={() => {
          setAiRef(!aiRef);
          Haptics.selectionAsync();
        }}
        activeOpacity={0.85}
      >
        <Feather name="cpu" size={20} color={aiRef ? colors.primary : colors.mutedForeground} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.toggleTitle, { color: colors.foreground }]}>AI Real-time Referee</Text>
          <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>
            Instant calls, score tracking & dispute resolution
          </Text>
        </View>
        <View
          style={[
            styles.toggle,
            { backgroundColor: aiRef ? colors.primary : colors.border },
          ]}
        >
          <View
            style={[
              styles.toggleThumb,
              { transform: [{ translateX: aiRef ? 18 : 2 }] },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Start Button */}
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: colors.primary }]}
        onPress={handleStart}
        activeOpacity={0.85}
      >
        <Feather name="play" size={18} color={colors.primaryForeground} />
        <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
          Start {selectedMode} Game
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pageTitle: { fontSize: 20, fontWeight: "700" as const },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 20,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  modeBtnText: { fontSize: 13, fontWeight: "700" as const },
  betRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" as const },
  betBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 60,
    alignItems: "center",
  },
  betBtnText: { fontSize: 14, fontWeight: "700" as const },
  potCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginTop: 12,
  },
  potRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  potLabel: { fontSize: 13 },
  potValue: { fontSize: 14, fontWeight: "600" as const },
  potDivider: { height: 1 },
  courtScroll: { marginBottom: 4 },
  courtRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  courtBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  courtBtnText: { fontSize: 12, fontWeight: "600" as const },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  toggleTitle: { fontSize: 15, fontWeight: "600" as const },
  toggleDesc: { fontSize: 12, marginTop: 2 },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    position: "relative",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    position: "absolute",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 24,
  },
  startBtnText: { fontSize: 17, fontWeight: "700" as const },
});
