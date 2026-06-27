import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const { width: W, height: H } = Dimensions.get("window");

const BORDER = 5;
const CORNER = 22;
const BALL_SIZE = 28;

export function BasketballBorder() {
  const colors = useColors();
  const orange = colors.accent;
  const blue = colors.primary;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* ── Top rail ───────────────────────────────────────────── */}
      <View style={[styles.railTop, { backgroundColor: orange }]} />
      {/* Top inner accent line */}
      <View style={[styles.railTopInner, { backgroundColor: blue + "55" }]} />

      {/* ── Bottom rail ────────────────────────────────────────── */}
      <View style={[styles.railBottom, { backgroundColor: orange }]} />
      <View style={[styles.railBottomInner, { backgroundColor: blue + "55" }]} />

      {/* ── Left rail ──────────────────────────────────────────── */}
      <View style={[styles.railLeft, { backgroundColor: orange }]} />
      <View style={[styles.railLeftInner, { backgroundColor: blue + "55" }]} />

      {/* ── Right rail ─────────────────────────────────────────── */}
      <View style={[styles.railRight, { backgroundColor: orange }]} />
      <View style={[styles.railRightInner, { backgroundColor: blue + "55" }]} />

      {/* ── Corner discs (basketball halves) ─────────────────── */}
      {/* Top-left */}
      <View style={[styles.cornerDisc, styles.cornerTL, { backgroundColor: orange, borderColor: "#fff" }]}>
        <Text style={styles.ball}>🏀</Text>
      </View>
      {/* Top-right */}
      <View style={[styles.cornerDisc, styles.cornerTR, { backgroundColor: orange, borderColor: "#fff" }]}>
        <Text style={styles.ball}>🏀</Text>
      </View>
      {/* Bottom-left */}
      <View style={[styles.cornerDisc, styles.cornerBL, { backgroundColor: orange, borderColor: "#fff" }]}>
        <Text style={styles.ball}>🏀</Text>
      </View>
      {/* Bottom-right */}
      <View style={[styles.cornerDisc, styles.cornerBR, { backgroundColor: orange, borderColor: "#fff" }]}>
        <Text style={styles.ball}>🏀</Text>
      </View>

      {/* ── Top center — free-throw arc ────────────────────────── */}
      <View style={[styles.topArc, { borderColor: blue + "66" }]} />

      {/* ── Bottom center — lane / key ─────────────────────────── */}
      <View style={[styles.bottomKey, { borderColor: blue + "44" }]} />

      {/* ── Mid-court line ─────────────────────────────────────── */}
      <View style={[styles.midLine, { backgroundColor: blue + "33" }]} />
      <View style={[styles.midCircle, { borderColor: blue + "44" }]} />

      {/* ── Tick marks along left/right edges ────────────────── */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <React.Fragment key={frac}>
          <View style={[styles.tick, { top: H * frac, left: BORDER, backgroundColor: blue + "55" }]} />
          <View style={[styles.tick, { top: H * frac, right: BORDER, backgroundColor: blue + "55" }]} />
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  railTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: BORDER,
  },
  railTopInner: {
    position: "absolute",
    top: BORDER, left: CORNER, right: CORNER,
    height: 2,
  },
  railBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: BORDER,
  },
  railBottomInner: {
    position: "absolute",
    bottom: BORDER, left: CORNER, right: CORNER,
    height: 2,
  },
  railLeft: {
    position: "absolute",
    top: 0, left: 0, bottom: 0,
    width: BORDER,
  },
  railLeftInner: {
    position: "absolute",
    top: CORNER, left: BORDER, bottom: CORNER,
    width: 2,
  },
  railRight: {
    position: "absolute",
    top: 0, right: 0, bottom: 0,
    width: BORDER,
  },
  railRightInner: {
    position: "absolute",
    top: CORNER, right: BORDER, bottom: CORNER,
    width: 2,
  },
  cornerDisc: {
    position: "absolute",
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cornerTL: { top: -BALL_SIZE / 2 + BORDER / 2, left: -BALL_SIZE / 2 + BORDER / 2 },
  cornerTR: { top: -BALL_SIZE / 2 + BORDER / 2, right: -BALL_SIZE / 2 + BORDER / 2 },
  cornerBL: { bottom: -BALL_SIZE / 2 + BORDER / 2, left: -BALL_SIZE / 2 + BORDER / 2 },
  cornerBR: { bottom: -BALL_SIZE / 2 + BORDER / 2, right: -BALL_SIZE / 2 + BORDER / 2 },
  ball: { fontSize: 14 },
  topArc: {
    position: "absolute",
    top: -48,
    left: W / 2 - 52,
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
  },
  bottomKey: {
    position: "absolute",
    bottom: -36,
    left: W / 2 - 38,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
  },
  midLine: {
    position: "absolute",
    top: H / 2 - 1,
    left: BORDER + 12,
    right: BORDER + 12,
    height: 1.5,
  },
  midCircle: {
    position: "absolute",
    top: H / 2 - 26,
    left: W / 2 - 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
  },
  tick: {
    position: "absolute",
    width: 10,
    height: 2,
    borderRadius: 1,
  },
});
