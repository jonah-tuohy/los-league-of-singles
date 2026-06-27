import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const { width: W, height: H } = Dimensions.get("window");

type Variant = "home" | "play" | "courts" | "leaderboard" | "train" | "profile" | "friends";

// ─── Floating Orbs (Home) ────────────────────────────────────────────────────

function FloatingOrbs({ color }: { color: string }) {
  const orbs = useRef(
    Array.from({ length: 7 }, (_, i) => ({
      x: (W / 7) * i + Math.random() * 40 - 20,
      size: 60 + Math.random() * 120,
      anim: new Animated.Value(Math.random()),
      delay: i * 600,
    }))
  ).current;

  useEffect(() => {
    orbs.forEach((orb) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(orb.delay),
          Animated.timing(orb.anim, {
            toValue: 1,
            duration: 5000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(orb.anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {orbs.map((orb, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: orb.x,
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
            backgroundColor: color,
            opacity: orb.anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.07, 0.05, 0] }),
            transform: [
              {
                translateY: orb.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [H * 0.9, -100],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─── Pulsing Rings (Play) ────────────────────────────────────────────────────

function PulsingRings({ color }: { color: string }) {
  const rings = useRef(
    Array.from({ length: 4 }, (_, i) => ({
      anim: new Animated.Value(0),
      delay: i * 900,
    }))
  ).current;

  useEffect(() => {
    rings.forEach((r) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(r.delay),
          Animated.timing(r.anim, {
            toValue: 1,
            duration: 3600,
            useNativeDriver: true,
          }),
          Animated.timing(r.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]} pointerEvents="none">
      {rings.map((r, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 1.5,
            borderColor: color,
            opacity: r.anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.5, 0.15, 0] }),
            transform: [{ scale: r.anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 6] }) }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Radar Sweep (Courts) ────────────────────────────────────────────────────

function RadarSweep({ color }: { color: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(
    Array.from({ length: 5 }, (_, i) => ({
      x: 60 + Math.random() * (W - 120),
      y: 80 + Math.random() * (H * 0.5),
      anim: new Animated.Value(0),
      delay: i * 300,
    }))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();
    dotAnims.forEach((d) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay + 1200),
          Animated.timing(d.anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(d.anim, { toValue: 0, duration: 1600, useNativeDriver: true }),
          Animated.delay(4000 - 2200 - d.delay),
        ])
      ).start();
    });
  }, []);

  const cx = W / 2;
  const cy = H * 0.35;
  const maxR = Math.max(W, H) * 0.55;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Grid rings */}
      {[0.22, 0.42, 0.62, 0.82].map((frac, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: cx - maxR * frac,
            top: cy - maxR * frac,
            width: maxR * frac * 2,
            height: maxR * frac * 2,
            borderRadius: maxR * frac,
            borderWidth: 1,
            borderColor: color,
            opacity: 0.06,
          }}
        />
      ))}
      {/* Sweep arm */}
      <Animated.View
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: maxR,
          height: 1.5,
          backgroundColor: color,
          opacity: 0.18,
          transformOrigin: "0% 50%",
          transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
        }}
      />
      {/* Blip dots */}
      {dotAnims.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: d.x - 4,
            top: d.y - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            opacity: d.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.7, 0] }),
            transform: [{ scale: d.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.4, 0.5] }) }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Rising Stars (Leaderboard) ──────────────────────────────────────────────

function RisingStars({ color }: { color: string }) {
  const stars = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * W,
      size: 2 + Math.random() * 4,
      anim: new Animated.Value(Math.random()),
      dur: 3000 + Math.random() * 3000,
      delay: i * 250,
    }))
  ).current;

  useEffect(() => {
    stars.forEach((s) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(s.delay),
          Animated.timing(s.anim, { toValue: 1, duration: s.dur, useNativeDriver: true }),
          Animated.timing(s.anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: color,
            opacity: s.anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.6, 0.4, 0] }),
            transform: [
              {
                translateY: s.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [H + 20, -30],
                }),
              },
              {
                translateX: s.anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, (Math.random() - 0.5) * 60, 0],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

// ─── Energy Stripes (Train) ──────────────────────────────────────────────────

function EnergyStripes({ color }: { color: string }) {
  const anims = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      anim: new Animated.Value(0),
      delay: i * 200,
      y: (H / 8) * i,
      width: 40 + Math.random() * 120,
    }))
  ).current;

  useEffect(() => {
    anims.forEach((a) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(a.delay),
          Animated.timing(a.anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
          Animated.timing(a.anim, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.delay(1200),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            top: a.y,
            height: 1.5,
            backgroundColor: color,
            opacity: a.anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.12, 0] }),
            transform: [
              {
                translateX: a.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-a.width, W + a.width],
                }),
              },
            ],
            width: a.width,
          }}
        />
      ))}
    </View>
  );
}

// ─── Orbit Rings (Profile) ───────────────────────────────────────────────────

function OrbitRings({ color }: { color: string }) {
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot1, { toValue: 1, duration: 12000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot2, { toValue: 1, duration: 18000, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(rot3, { toValue: -1, duration: 24000, useNativeDriver: true })).start();
  }, []);

  const cx = W / 2;
  const cy = H * 0.28;

  const rings = [
    { rot: rot1, r: 90, dotSize: 8 },
    { rot: rot2, r: 150, dotSize: 6 },
    { rot: rot3, r: 210, dotSize: 5 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {rings.map((ring, i) => (
        <React.Fragment key={i}>
          <View
            style={{
              position: "absolute",
              left: cx - ring.r,
              top: cy - ring.r,
              width: ring.r * 2,
              height: ring.r * 2,
              borderRadius: ring.r,
              borderWidth: 1,
              borderColor: color,
              opacity: 0.07,
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              left: cx - ring.dotSize / 2,
              top: cy - ring.r - ring.dotSize / 2,
              width: ring.dotSize,
              height: ring.dotSize,
              borderRadius: ring.dotSize / 2,
              backgroundColor: color,
              opacity: 0.25,
              transformOrigin: `${ring.dotSize / 2}px ${ring.r + ring.dotSize / 2}px`,
              transform: [
                { rotate: ring.rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) },
              ],
            }}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Network Nodes (Friends) ─────────────────────────────────────────────────

function NetworkNodes({ color }: { color: string }) {
  const nodes = useRef(
    Array.from({ length: 9 }, (_, i) => ({
      x: 30 + Math.random() * (W - 60),
      y: 80 + Math.random() * (H * 0.75),
      anim: new Animated.Value(Math.random()),
      delay: i * 350,
      dur: 2000 + Math.random() * 2000,
    }))
  ).current;

  useEffect(() => {
    nodes.forEach((n) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(n.delay),
          Animated.timing(n.anim, { toValue: 1, duration: n.dur, useNativeDriver: true }),
          Animated.timing(n.anim, { toValue: 0.2, duration: n.dur, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {nodes.map((n, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: n.x - 5,
            top: n.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            borderWidth: 1.5,
            borderColor: color,
            opacity: n.anim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.18] }),
            transform: [{ scale: n.anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] }) }],
          }}
        />
      ))}
    </View>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function AnimatedBackground({ variant }: { variant: Variant }) {
  const colors = useColors();
  const color = colors.primary;
  const accentColor = colors.accent;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]} pointerEvents="none">
      {variant === "home" && <FloatingOrbs color={color} />}
      {variant === "play" && <PulsingRings color={color} />}
      {variant === "courts" && <RadarSweep color={color} />}
      {variant === "leaderboard" && <RisingStars color={accentColor} />}
      {variant === "train" && <EnergyStripes color={color} />}
      {variant === "profile" && <OrbitRings color={color} />}
      {variant === "friends" && <NetworkNodes color={color} />}
    </View>
  );
}
