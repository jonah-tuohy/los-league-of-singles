import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { rankColors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { BasketballBorder } from "@/components/BasketballBorder";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GameEvent {
  id: string;
  ts: string;      // "MM:SS"
  elapsed: number; // seconds since recording started
  type: "score" | "ref" | "start" | "end";
  team?: 1 | 2;
  points?: number;
  label: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const AI_REF_CALLS = [
  "Clean block! Excellent positioning.",
  "That's a foul — illegal contact on the drive.",
  "Out of bounds — possession changes.",
  "Bucket good! Strong finish through contact.",
  "Travel called — illegal pivot foot.",
  "Charge! Offensive player ran into set defender.",
  "And one! Shot plus the foul.",
  "Double dribble — turnover.",
  "Shot clock violation — possession change.",
  "Flagrant foul! Technical assessed.",
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GameScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { games, updateGame, recordWin, recordLoss } = useApp();

  const game = games.find((g) => g.id === id);
  const [team1Score, setTeam1Score] = useState(game?.team1Score ?? 0);
  const [team2Score, setTeam2Score] = useState(game?.team2Score ?? 0);
  const [aiCalls, setAiCalls] = useState<{ id: string; text: string; time: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [activeView, setActiveView] = useState<"game" | "tape">("game");

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const recStartRef = useRef<number>(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scoreAnim = useRef(new Animated.Value(1)).current;

  // AI Ref interval
  useEffect(() => {
    if (!game?.aiRefEnabled) return;
    const callInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const call = AI_REF_CALLS[Math.floor(Math.random() * AI_REF_CALLS.length)];
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
        setAiCalls((prev) => [{ id: Date.now().toString(), text: call, time }, ...prev.slice(0, 9)]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Log to tape if recording
        if (isRecording) {
          const elapsed = Math.floor((Date.now() - recStartRef.current) / 1000);
          addEvent({ type: "ref", label: `📋 ${call}`, elapsed });
        }
      }
    }, 8000);
    return () => clearInterval(callInterval);
  }, [game?.aiRefEnabled, isRecording]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recStartRef.current = Date.now() - recordingElapsed * 1000;
      recTimerRef.current = setInterval(() => {
        setRecordingElapsed(Math.floor((Date.now() - recStartRef.current) / 1000));
      }, 1000);
    } else {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
    return () => { if (recTimerRef.current) clearInterval(recTimerRef.current); };
  }, [isRecording]);

  const addEvent = (partial: Pick<GameEvent, "type" | "label" | "elapsed"> & { team?: 1 | 2; points?: number }) => {
    const elapsed = partial.elapsed ?? Math.floor((Date.now() - recStartRef.current) / 1000);
    setGameEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        ts: formatElapsed(elapsed),
        elapsed,
        ...partial,
      },
    ]);
  };

  const toggleRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!isRecording) {
      setIsRecording(true);
      setGameEvents([{
        id: "start",
        ts: "00:00",
        elapsed: 0,
        type: "start",
        label: "🎬 Recording started",
      }]);
    } else {
      setIsRecording(false);
      addEvent({ type: "end", label: "⏹ Recording paused", elapsed: recordingElapsed });
    }
  };

  const animateScore = () => {
    Animated.sequence([
      Animated.timing(scoreAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scoreAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const addPoint = (team: 1 | 2, points: 1 | 2 | 3) => {
    if (gameOver) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateScore();
    const teamName = team === 1 ? "Your Team" : "Opponents";
    const newScore = team === 1 ? team1Score + points : team2Score + points;

    if (team === 1) {
      setTeam1Score(newScore);
      updateGame(id, { team1Score: newScore, status: "active" });
    } else {
      setTeam2Score(newScore);
      updateGame(id, { team2Score: newScore, status: "active" });
    }

    if (isRecording) {
      const elapsed = Math.floor((Date.now() - recStartRef.current) / 1000);
      addEvent({
        type: "score",
        team,
        points,
        label: `${points === 1 ? "🏀" : points === 2 ? "🏀🏀" : "🎯"} +${points} — ${teamName} (${team === 1 ? newScore : team1Score}–${team === 2 ? newScore : team2Score})`,
        elapsed,
      });
    }
  };

  const endGame = (winnerTeam: 1 | 2) => {
    setGameOver(true);
    if (isRecording) {
      setIsRecording(false);
      const elapsed = Math.floor((Date.now() - recStartRef.current) / 1000);
      addEvent({
        type: "end",
        label: `🏆 Game over — ${winnerTeam === 1 ? "Your Team" : "Opponents"} win!`,
        elapsed,
      });
    }
    const userWon = winnerTeam === 1;
    updateGame(id, {
      status: "finished",
      team1Score,
      team2Score,
      winnerId: winnerTeam === 1 ? game?.team1[0].id : game?.team2[0].id,
    });
    if (userWon && game) {
      recordWin(game);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      recordLoss();
    }
    Alert.alert(
      userWon ? "Game Over — You Win! 🏆" : "Game Over — You Lose",
      userWon
        ? `Great game! You earned ${Math.floor((game?.totalPot ?? 0) * 0.8)} coins + rank points.`
        : "Better luck next time. Keep grinding!",
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!game) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Game not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPlayers = game.mode === "1v1" ? 2 : game.mode === "2v2" ? 4 : game.mode === "3v3" ? 6 : game.mode === "4v4" ? 8 : 10;
  const totalPot = game.betPerPlayer * totalPlayers;
  const winnerPot = Math.floor(totalPot * 0.8);

  // ─── Game Tab ────────────────────────────────────────────────────────────────

  const GameTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 8, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Scoreboard */}
      <View style={[styles.scoreboard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.teamColumn}>
          <Text style={[styles.teamLabel, { color: colors.mutedForeground }]}>YOUR TEAM</Text>
          <View style={styles.teamPlayers}>
            {game.team1.slice(0, 3).map((p) => (
              <View key={p.id} style={[styles.playerPill, { backgroundColor: (rankColors[p.rank] || colors.primary) + "22" }]}>
                <Text style={[styles.playerPillText, { color: rankColors[p.rank] || colors.primary }]}>{p.avatar}</Text>
              </View>
            ))}
          </View>
          <Animated.Text style={[styles.bigScore, { color: colors.foreground, transform: [{ scale: scoreAnim }] }]}>
            {team1Score}
          </Animated.Text>
        </View>
        <View style={styles.vsColumn}>
          <Text style={[styles.vs, { color: colors.mutedForeground }]}>VS</Text>
          {totalPot > 0 && (
            <View style={[styles.potDisplay, { backgroundColor: colors.gold + "22" }]}>
              <Feather name="dollar-sign" size={12} color={colors.gold} />
              <Text style={[styles.potDisplayText, { color: colors.gold }]}>{winnerPot}</Text>
            </View>
          )}
          {isRecording && (
            <View style={[styles.recBadge, { backgroundColor: "#FF3B3B" }]}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>{formatElapsed(recordingElapsed)}</Text>
            </View>
          )}
          <Text style={[styles.toWin, { color: colors.mutedForeground }]}>first to 21</Text>
        </View>
        <View style={[styles.teamColumn, { alignItems: "flex-end" }]}>
          <Text style={[styles.teamLabel, { color: colors.mutedForeground }]}>OPPONENTS</Text>
          <View style={styles.teamPlayers}>
            {game.team2.slice(0, 3).map((p) => (
              <View key={p.id} style={[styles.playerPill, { backgroundColor: (rankColors[p.rank] || colors.destructive) + "22" }]}>
                <Text style={[styles.playerPillText, { color: rankColors[p.rank] || colors.destructive }]}>{p.avatar}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.bigScore, { color: colors.foreground }]}>{team2Score}</Text>
        </View>
      </View>

      {/* Score Controls - Your Team */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SCORE YOUR POINTS</Text>
      <View style={styles.scoreControls}>
        {([1, 2, 3] as const).map((pts) => (
          <TouchableOpacity
            key={pts}
            style={[styles.scoreBtn, { backgroundColor: colors.primary }]}
            onPress={() => addPoint(1, pts)}
            activeOpacity={0.8}
            disabled={gameOver}
          >
            <Text style={[styles.scoreBtnText, { color: "#fff" }]}>+{pts}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Score Controls - Opponents */}
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>OPPONENT POINTS</Text>
      <View style={styles.scoreControls}>
        {([1, 2, 3] as const).map((pts) => (
          <TouchableOpacity
            key={pts}
            style={[styles.scoreBtn, { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }]}
            onPress={() => addPoint(2, pts)}
            activeOpacity={0.8}
            disabled={gameOver}
          >
            <Text style={[styles.scoreBtnText, { color: colors.foreground }]}>+{pts}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* End Game */}
      {!gameOver && (
        <View style={styles.endGameRow}>
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: colors.success + "18", borderColor: colors.success, borderWidth: 1.5 }]}
            onPress={() => Alert.alert("Declare Win", "Confirm your team won?", [
              { text: "Cancel", style: "cancel" },
              { text: "Win", onPress: () => endGame(1) },
            ])}
            activeOpacity={0.85}
          >
            <Feather name="award" size={16} color={colors.success} />
            <Text style={[styles.endBtnText, { color: colors.success }]}>We Won</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.endBtn, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive, borderWidth: 1.5 }]}
            onPress={() => Alert.alert("Declare Loss", "Confirm your team lost?", [
              { text: "Cancel", style: "cancel" },
              { text: "Loss", onPress: () => endGame(2) },
            ])}
            activeOpacity={0.85}
          >
            <Feather name="x-circle" size={16} color={colors.destructive} />
            <Text style={[styles.endBtnText, { color: colors.destructive }]}>We Lost</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* AI Ref Feed */}
      {game.aiRefEnabled && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AI REFEREE CALLS</Text>
          {aiCalls.length === 0 ? (
            <View style={[styles.aiEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="cpu" size={20} color={colors.mutedForeground} />
              <Text style={[styles.aiEmptyText, { color: colors.mutedForeground }]}>
                AI Ref is watching... calls will appear here
              </Text>
            </View>
          ) : (
            aiCalls.map((call) => (
              <View key={call.id} style={[styles.aiCallCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "33" }]}>
                <Feather name="cpu" size={14} color={colors.primary} />
                <Text style={[styles.aiCallText, { color: colors.foreground }]}>{call.text}</Text>
                <Text style={[styles.aiCallTime, { color: colors.mutedForeground }]}>{call.time}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );

  // ─── Game Tape Tab ────────────────────────────────────────────────────────────

  const TapeTab = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 8, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {gameEvents.length === 0 ? (
        <View style={[styles.tapeEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="video" size={32} color={colors.mutedForeground} />
          <Text style={[styles.tapeEmptyTitle, { color: colors.foreground }]}>No Recording Yet</Text>
          <Text style={[styles.tapeEmptyText, { color: colors.mutedForeground }]}>
            Press the REC button during the game to start logging events in real time.
          </Text>
        </View>
      ) : (
        <>
          {/* Stats summary */}
          <View style={[styles.tapeSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.tapeStat}>
              <Text style={[styles.tapeStatVal, { color: colors.primary }]}>{team1Score}</Text>
              <Text style={[styles.tapeStatLabel, { color: colors.mutedForeground }]}>Your Score</Text>
            </View>
            <View style={styles.tapeStat}>
              <Text style={[styles.tapeStatVal, { color: colors.foreground }]}>{formatElapsed(recordingElapsed)}</Text>
              <Text style={[styles.tapeStatLabel, { color: colors.mutedForeground }]}>Game Time</Text>
            </View>
            <View style={styles.tapeStat}>
              <Text style={[styles.tapeStatVal, { color: colors.mutedForeground }]}>{team2Score}</Text>
              <Text style={[styles.tapeStatLabel, { color: colors.mutedForeground }]}>Opp Score</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EVENT LOG</Text>
          {[...gameEvents].reverse().map((event) => {
            const isScore = event.type === "score";
            const isRef = event.type === "ref";
            const isStart = event.type === "start";
            const isEnd = event.type === "end";
            const bg = isScore
              ? (event.team === 1 ? colors.primary : colors.secondary)
              : isRef
              ? colors.accent + "15"
              : isStart
              ? colors.success + "15"
              : colors.card;
            const border = isScore
              ? (event.team === 1 ? colors.primary + "44" : colors.border)
              : isRef
              ? colors.accent + "33"
              : isStart
              ? colors.success + "33"
              : colors.border;

            return (
              <View
                key={event.id}
                style={[styles.tapeEvent, { backgroundColor: bg, borderColor: border }]}
              >
                <Text style={[styles.tapeTs, { color: isScore && event.team === 1 ? colors.primaryForeground + "AA" : colors.mutedForeground }]}>
                  {event.ts}
                </Text>
                <Text style={[
                  styles.tapeEventText,
                  { color: isScore && event.team === 1 ? colors.primaryForeground : colors.foreground },
                ]}>
                  {event.label}
                </Text>
              </View>
            );
          })}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BasketballBorder />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.gameInfo}>
          <Text style={[styles.gameMode, { color: colors.primary }]}>{game.mode}</Text>
          <Text style={[styles.courtName, { color: colors.mutedForeground }]}>{game.courtName}</Text>
        </View>
        {/* REC button */}
        {!gameOver && (
          <TouchableOpacity
            style={[
              styles.recBtn,
              {
                backgroundColor: isRecording ? "#FF3B3B" : colors.card,
                borderColor: isRecording ? "#FF3B3B" : colors.border,
              },
            ]}
            onPress={toggleRecording}
            activeOpacity={0.85}
          >
            <View style={[styles.recDotBtn, { backgroundColor: isRecording ? "#fff" : "#FF3B3B" }]} />
            <Text style={[styles.recBtnText, { color: isRecording ? "#fff" : colors.mutedForeground }]}>
              {isRecording ? "LIVE" : "REC"}
            </Text>
          </TouchableOpacity>
        )}
        {game.aiRefEnabled && (
          <View style={[styles.aiRefBadge, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="cpu" size={14} color={colors.primary} />
          </View>
        )}
      </View>

      {/* Sub-tabs */}
      <View style={[styles.subTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.subTab, activeView === "game" && { backgroundColor: colors.primary, borderRadius: 10 }]}
          onPress={() => setActiveView("game")}
          activeOpacity={0.8}
        >
          <Feather name="activity" size={13} color={activeView === "game" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.subTabText, { color: activeView === "game" ? "#fff" : colors.mutedForeground }]}>
            Live Game
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeView === "tape" && { backgroundColor: colors.primary, borderRadius: 10 }]}
          onPress={() => setActiveView("tape")}
          activeOpacity={0.8}
        >
          <Feather name="video" size={13} color={activeView === "tape" ? "#fff" : colors.mutedForeground} />
          <Text style={[styles.subTabText, { color: activeView === "tape" ? "#fff" : colors.mutedForeground }]}>
            Game Tape {gameEvents.length > 0 ? `(${gameEvents.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {activeView === "game" ? <GameTab /> : <TapeTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontWeight: "600" as const },
  backLink: { fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  gameInfo: { flex: 1 },
  gameMode: { fontSize: 20, fontWeight: "800" as const },
  courtName: { fontSize: 12 },
  recBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  recDotBtn: { width: 7, height: 7, borderRadius: 3.5 },
  recBtnText: { fontSize: 11, fontWeight: "800" as const, letterSpacing: 0.5 },
  aiRefBadge: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  subTabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 8,
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
    paddingVertical: 8,
  },
  subTabText: { fontSize: 12, fontWeight: "600" as const },
  content: { paddingHorizontal: 20 },
  scoreboard: {
    flexDirection: "row",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  teamColumn: { flex: 1, alignItems: "flex-start", gap: 8 },
  teamLabel: { fontSize: 10, fontWeight: "700" as const, letterSpacing: 1 },
  teamPlayers: { flexDirection: "row", gap: 4 },
  playerPill: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  playerPillText: { fontSize: 9, fontWeight: "700" as const },
  bigScore: { fontSize: 56, fontWeight: "800" as const, lineHeight: 64 },
  vsColumn: { alignItems: "center", gap: 6 },
  vs: { fontSize: 13, fontWeight: "700" as const },
  potDisplay: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  potDisplayText: { fontSize: 13, fontWeight: "700" as const },
  recBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  recText: { fontSize: 11, fontWeight: "800" as const, color: "#fff", letterSpacing: 0.5 },
  toWin: { fontSize: 10, textAlign: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 1.2, marginBottom: 10, marginTop: 16 },
  scoreControls: { flexDirection: "row", gap: 12 },
  scoreBtn: { flex: 1, paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  scoreBtnText: { fontSize: 22, fontWeight: "800" as const },
  endGameRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  endBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  endBtnText: { fontSize: 15, fontWeight: "700" as const },
  aiEmpty: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1 },
  aiEmptyText: { fontSize: 13, flex: 1 },
  aiCallCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  aiCallText: { flex: 1, fontSize: 13, fontWeight: "500" as const },
  aiCallTime: { fontSize: 11 },
  // Tape
  tapeEmpty: {
    borderRadius: 16, borderWidth: 1, padding: 32,
    alignItems: "center", gap: 10, marginTop: 8,
  },
  tapeEmptyTitle: { fontSize: 16, fontWeight: "700" as const },
  tapeEmptyText: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  tapeSummary: {
    flexDirection: "row", borderRadius: 16, borderWidth: 1, padding: 16,
    marginBottom: 16, justifyContent: "space-around",
  },
  tapeStat: { alignItems: "center", gap: 2 },
  tapeStatVal: { fontSize: 22, fontWeight: "800" as const },
  tapeStatLabel: { fontSize: 11 },
  tapeEvent: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 6,
  },
  tapeTs: { fontSize: 11, fontWeight: "700" as const, width: 36, flexShrink: 0, paddingTop: 1 },
  tapeEventText: { flex: 1, fontSize: 13, fontWeight: "500" as const, lineHeight: 19 },
});
