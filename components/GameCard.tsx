import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Game } from "@/context/AppContext";
import { rankColors } from "@/constants/colors";

interface GameCardProps {
  game: Game;
  compact?: boolean;
}

const MODE_LABELS: Record<string, string> = {
  "1v1": "1 vs 1",
  "2v2": "2 vs 2",
  "3v3": "3 vs 3",
  "4v4": "4 vs 4",
  "5v5": "5 vs 5",
};

const STATUS_COLORS: Record<string, string> = {
  waiting: "#F59E0B",
  active: "#22C55E",
  finished: "#6B7FA3",
};

export function GameCard({ game, compact = false }: GameCardProps) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[game.status];
  const totalPlayers =
    game.mode === "1v1" ? 2 : game.mode === "2v2" ? 4 : game.mode === "3v3" ? 6 : game.mode === "4v4" ? 8 : 10;
  const totalPot = game.betPerPlayer * totalPlayers;
  const winnerPot = Math.floor(totalPot * 0.8);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: 16,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.modeContainer}>
          <Text style={[styles.mode, { color: colors.primary }]}>
            {game.mode}
          </Text>
          <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>
            {MODE_LABELS[game.mode]}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.scoreRow}>
            <View style={styles.teamBlock}>
              {game.team1.slice(0, 2).map((p) => (
                <View key={p.id} style={styles.playerChip}>
                  <View style={[styles.avatar, { backgroundColor: rankColors[p.rank] + "33", borderColor: rankColors[p.rank] }]}>
                    <Text style={[styles.avatarText, { color: rankColors[p.rank] }]}>{p.avatar}</Text>
                  </View>
                  <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.scoreBlock}>
              <Text style={[styles.score, { color: colors.foreground }]}>
                {game.team1Score}
              </Text>
              <Text style={[styles.scoreDash, { color: colors.mutedForeground }]}>—</Text>
              <Text style={[styles.score, { color: colors.foreground }]}>
                {game.team2Score}
              </Text>
            </View>
            <View style={[styles.teamBlock, styles.teamRight]}>
              {game.team2.slice(0, 2).map((p) => (
                <View key={p.id} style={[styles.playerChip, styles.playerChipRight]}>
                  <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.avatar, { backgroundColor: rankColors[p.rank] + "33", borderColor: rankColors[p.rank] }]}>
                    <Text style={[styles.avatarText, { color: rankColors[p.rank] }]}>{p.avatar}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Feather name="award" size={12} color={colors.gold} />
          <Text style={[styles.footerText, { color: colors.gold }]}>
            {winnerPot} coins
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {game.courtName}
          </Text>
        </View>
        {game.aiRefEnabled && (
          <View style={styles.footerItem}>
            <Feather name="cpu" size={12} color={colors.primary} />
            <Text style={[styles.footerText, { color: colors.primary }]}>AI Ref</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modeContainer: {},
  mode: { fontSize: 22, fontWeight: "800" as const },
  modeLabel: { fontSize: 12, fontWeight: "500" as const },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "600" as const },
  divider: { height: 1, marginVertical: 12 },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  teamBlock: { flex: 1, gap: 6 },
  teamRight: { alignItems: "flex-end" },
  playerChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  playerChipRight: { flexDirection: "row-reverse" as const },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 10, fontWeight: "700" as const },
  playerName: { fontSize: 12, fontWeight: "500" as const, maxWidth: 70 },
  scoreBlock: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 },
  score: { fontSize: 28, fontWeight: "800" as const, minWidth: 30, textAlign: "center" },
  scoreDash: { fontSize: 20 },
  footer: { flexDirection: "row", gap: 16, marginTop: 12, flexWrap: "wrap" as const },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 12, fontWeight: "500" as const },
});
