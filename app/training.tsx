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

interface Exercise {
  id: string;
  name: string;
  duration: string;
  reps?: string;
  description: string;
  category: "ball" | "shooting" | "conditioning" | "iq";
  completed: boolean;
}

interface Program {
  id: string;
  name: string;
  level: string;
  description: string;
  days: number;
  exercises: Exercise[];
  pro: boolean;
}

const PROGRAMS: Program[] = [
  {
    id: "p1",
    name: "Rookie Foundation",
    level: "Beginner",
    description: "Build your basketball fundamentals from the ground up.",
    days: 5,
    pro: false,
    exercises: [
      { id: "e1", name: "Stationary Ball Handling", duration: "10 min", description: "Two-ball dribbling in place, keep your head up.", category: "ball", completed: false },
      { id: "e2", name: "Form Shooting", duration: "15 min", reps: "100 makes", description: "Close-range form shots, focus on consistent release.", category: "shooting", completed: false },
      { id: "e3", name: "Defensive Slides", duration: "5 min", description: "Lateral slides end-to-end, stay low.", category: "conditioning", completed: false },
      { id: "e4", name: "Court Vision Drills", duration: "10 min", description: "Dribble while tracking moving targets to improve court awareness.", category: "iq", completed: false },
    ],
  },
  {
    id: "p2",
    name: "Court Dominator",
    level: "Intermediate",
    description: "Sharpen your offensive weapons and tighten your D.",
    days: 6,
    pro: false,
    exercises: [
      { id: "e5", name: "Crossover Combos", duration: "15 min", description: "Between-legs, behind-back, hesitation moves in sequence.", category: "ball", completed: false },
      { id: "e6", name: "Catch-and-Shoot Drills", duration: "20 min", reps: "150 makes", description: "Corner 3s, mid-range pull-ups, off the catch.", category: "shooting", completed: false },
      { id: "e7", name: "Plyometric Series", duration: "15 min", description: "Box jumps, lateral bounds, sprint finishes.", category: "conditioning", completed: false },
      { id: "e8", name: "Film Study Simulation", duration: "10 min", description: "Recall and diagram plays from memory to sharpen IQ.", category: "iq", completed: false },
      { id: "e9", name: "Finishing Package", duration: "15 min", reps: "50 each hand", description: "Euro-step, reverse layup, floater — alternate hands.", category: "ball", completed: false },
    ],
  },
  {
    id: "p3",
    name: "Elite Playmaker",
    level: "Advanced",
    description: "Pro-level training for players chasing Legend rank.",
    days: 7,
    pro: true,
    exercises: [
      { id: "e10", name: "Full-Speed Ball Handling", duration: "20 min", description: "All dribble moves at game speed with resistance bands.", category: "ball", completed: false },
      { id: "e11", name: "Step-Back & Pull-Up Series", duration: "25 min", reps: "200 makes", description: "Mid-range step-back, pull-ups off the dribble, off-balance shots.", category: "shooting", completed: false },
      { id: "e12", name: "Anaerobic Conditioning", duration: "20 min", description: "17-second sprints, 30s rest × 10. Game-speed conditioning.", category: "conditioning", completed: false },
      { id: "e13", name: "Defensive IQ Pressure", duration: "15 min", description: "Force decisions in 3-second windows. Pattern recognition.", category: "iq", completed: false },
      { id: "e14", name: "Post Moves Mastery", duration: "20 min", description: "Drop step, up-and-under, hook shot from both blocks.", category: "ball", completed: false },
      { id: "e15", name: "Leadership & Communication", duration: "10 min", description: "Vocal cues, defensive assignments, offensive play-calling drills.", category: "iq", completed: false },
    ],
  },
];

const CATEGORY_ICONS: Record<string, "activity" | "target" | "zap" | "eye"> = {
  ball: "activity",
  shooting: "target",
  conditioning: "zap",
  iq: "eye",
};

const CATEGORY_COLORS: Record<string, string> = {
  ball: "#1B6EFF",
  shooting: "#FF6B1A",
  conditioning: "#22C55E",
  iq: "#A855F7",
};

export default function TrainingScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggleExercise = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const openProgram = (program: Program) => {
    if (program.pro && user.membership === "free") {
      return;
    }
    setSelectedProgram(program);
    setExercises(program.exercises.map((e) => ({ ...e, completed: false })));
  };

  const completedCount = exercises.filter((e) => e.completed).length;

  if (selectedProgram) {
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedProgram(null)}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.programTitle, { color: colors.foreground }]}>
              {selectedProgram.name}
            </Text>
            <Text style={[styles.programLevel, { color: colors.primary }]}>
              {selectedProgram.level}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.foreground }]}>
              Today's Progress
            </Text>
            <Text style={[styles.progressFraction, { color: colors.primary }]}>
              {completedCount}/{exercises.length}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: exercises.length > 0 ? `${(completedCount / exercises.length) * 100}%` : "0%",
                },
              ]}
            />
          </View>
        </View>

        {exercises.map((exercise) => {
          const catColor = CATEGORY_COLORS[exercise.category];
          const catIcon = CATEGORY_ICONS[exercise.category];
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                {
                  backgroundColor: exercise.completed ? catColor + "15" : colors.card,
                  borderColor: exercise.completed ? catColor : colors.border,
                },
              ]}
              onPress={() => toggleExercise(exercise.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: catColor + "22" }]}>
                <Feather name={catIcon} size={18} color={catColor} />
              </View>
              <View style={styles.exerciseInfo}>
                <Text
                  style={[
                    styles.exerciseName,
                    {
                      color: colors.foreground,
                      textDecorationLine: exercise.completed ? "line-through" as const : "none" as const,
                      opacity: exercise.completed ? 0.6 : 1,
                    },
                  ]}
                >
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>
                  {exercise.duration}{exercise.reps ? ` • ${exercise.reps}` : ""}
                </Text>
                <Text style={[styles.exerciseDesc, { color: colors.mutedForeground }]}>
                  {exercise.description}
                </Text>
              </View>
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: exercise.completed ? catColor : "transparent",
                    borderColor: exercise.completed ? catColor : colors.border,
                  },
                ]}
              >
                {exercise.completed && (
                  <Feather name="check" size={14} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {completedCount === exercises.length && exercises.length > 0 && (
          <View style={[styles.completeCard, { backgroundColor: colors.success + "18", borderColor: colors.success }]}>
            <Feather name="award" size={24} color={colors.success} />
            <Text style={[styles.completeTitle, { color: colors.foreground }]}>
              Session Complete!
            </Text>
            <Text style={[styles.completeText, { color: colors.mutedForeground }]}>
              You crushed today's training. Rest, hydrate, and come back stronger.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Training</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Choose a program designed for your level
      </Text>

      {PROGRAMS.map((program) => {
        const locked = program.pro && user.membership === "free";
        return (
          <TouchableOpacity
            key={program.id}
            style={[
              styles.programCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: locked ? 0.7 : 1,
              },
            ]}
            onPress={() => openProgram(program)}
            activeOpacity={0.85}
          >
            <View style={styles.programHeader}>
              <View>
                <View style={styles.programTitleRow}>
                  <Text style={[styles.programName, { color: colors.foreground }]}>
                    {program.name}
                  </Text>
                  {program.pro && (
                    <View style={[styles.proBadge, { backgroundColor: colors.gold }]}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                  {locked && (
                    <Feather name="lock" size={14} color={colors.mutedForeground} />
                  )}
                </View>
                <Text style={[styles.programLevelText, { color: colors.primary }]}>
                  {program.level}
                </Text>
              </View>
              <View style={[styles.daysTag, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.daysText, { color: colors.primary }]}>
                  {program.days}d/wk
                </Text>
              </View>
            </View>
            <Text style={[styles.programDesc, { color: colors.mutedForeground }]}>
              {program.description}
            </Text>
            <View style={styles.exercisePreview}>
              {program.exercises.slice(0, 3).map((e) => (
                <View key={e.id} style={[styles.exercisePill, { backgroundColor: CATEGORY_COLORS[e.category] + "22" }]}>
                  <Feather name={CATEGORY_ICONS[e.category]} size={10} color={CATEGORY_COLORS[e.category]} />
                  <Text style={[styles.exercisePillText, { color: CATEGORY_COLORS[e.category] }]}>
                    {e.name.split(" ")[0]}
                  </Text>
                </View>
              ))}
              {program.exercises.length > 3 && (
                <Text style={[styles.moreText, { color: colors.mutedForeground }]}>
                  +{program.exercises.length - 3} more
                </Text>
              )}
            </View>
            <View style={[styles.startRow]}>
              <Text style={[styles.startText, { color: locked ? colors.mutedForeground : colors.primary }]}>
                {locked ? "Unlock with Pro" : "Start Program"}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={locked ? colors.mutedForeground : colors.primary}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  pageTitle: { flex: 1, fontSize: 24, fontWeight: "800" as const },
  subtitle: { fontSize: 14, marginBottom: 20 },
  programCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    gap: 12,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  programTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  programName: { fontSize: 18, fontWeight: "700" as const },
  proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proBadgeText: { fontSize: 9, fontWeight: "800" as const, color: "#000" },
  programLevelText: { fontSize: 12, fontWeight: "600" as const },
  daysTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  daysText: { fontSize: 12, fontWeight: "700" as const },
  programDesc: { fontSize: 13, lineHeight: 20 },
  exercisePreview: { flexDirection: "row", flexWrap: "wrap" as const, gap: 6, alignItems: "center" },
  exercisePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  exercisePillText: { fontSize: 11, fontWeight: "600" as const },
  moreText: { fontSize: 11 },
  startRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  startText: { fontSize: 14, fontWeight: "700" as const },
  programTitle: { fontSize: 22, fontWeight: "800" as const },
  programLevel: { fontSize: 13, fontWeight: "600" as const },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressText: { fontSize: 15, fontWeight: "600" as const },
  progressFraction: { fontSize: 18, fontWeight: "800" as const },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" as const },
  progressFill: { height: "100%", borderRadius: 4 },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  exerciseInfo: { flex: 1, gap: 3 },
  exerciseName: { fontSize: 15, fontWeight: "700" as const },
  exerciseMeta: { fontSize: 12, fontWeight: "500" as const },
  exerciseDesc: { fontSize: 12, lineHeight: 18 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  completeCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  completeTitle: { fontSize: 20, fontWeight: "800" as const },
  completeText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
});
