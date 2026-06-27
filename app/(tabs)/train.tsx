import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { BasketballBorder } from "@/components/BasketballBorder";

// ─── AI Coach ────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "coach";
  text: string;
}

const COACH_KB: Record<string, string> = {
  default: "Great question! Focus on your fundamentals — footwork, positioning, and reading the defense will separate you from the competition.",
  shoot: "Shooting mechanics: bend your knees, align your elbow under the ball, follow through with a snap of the wrist. Consistency in routine is the key.",
  dribble: "Keep your dribble low and tight. Use your off-hand as a shield and keep your eyes up — don't stare at the ball.",
  defense: "On defense, stay in a low stance with your weight on the balls of your feet. Watch the player's chest, not the ball — fakes can't fool you that way.",
  pass: "A good pass is accurate AND timely. Lead your teammates into open space. Never force a pass into traffic.",
  layup: "For layups, use the backboard on the near side and go up soft. Reach for the top corner of the square.",
  "1v1": "In 1v1, use your first step explosion to create separation. Master one move to the left and one to the right — perfection beats variety.",
  "5v5": "In 5v5, spacing is non-negotiable. If you're not the ball handler, space the floor. Cut when the defender relaxes. Move the ball to move the defense.",
  rank: "To climb ranks, focus on minimizing mistakes over maximizing highlights. Play smart, protect the ball, and take only high-percentage shots.",
  train: "Training tip: Spend 30 min daily. 10 min ball handling, 10 min shooting form, 10 min conditioning. Consistency beats intensity.",
  bet: "Managing your bankroll is a skill. Never bet more than 20% of your coins on a single game. Build steadily.",
  tired: "Rest is part of training. Your body repairs and strengthens during recovery. Don't overlook sleep and hydration.",
  confidence: "Confidence is built through preparation. The player who has shot 10,000 jumpers is not nervous at the free-throw line.",
  crossover: "A great crossover sells the fake first — sell the drive, then cross. Hip movement before the hand move.",
  post: "In the post, use your body as a weapon. Seal your defender, catch with two hands, read the defense before you move.",
  rebound: "Boxing out is 70% desire, 30% technique. Find your man first, then go get the ball. Most rebounds are won before the ball leaves the shooter's hand.",
  free: "Free throw routine is everything: same breath, same bend, same release every single time. Pressure can't break routine.",
  mental: "Mental toughness is a skill. After a missed shot, say 'next play' out loud. Reset in under 3 seconds — that's elite-level focus.",
};

function getCoachResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(COACH_KB)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  return COACH_KB.default;
}

const QUICK_PROMPTS = [
  "How to improve my shooting?",
  "Best 1v1 moves?",
  "How to climb ranks faster?",
  "Mental toughness tips?",
  "Best free throw routine?",
  "How to box out?",
];

// ─── Training Programs ────────────────────────────────────────────────────────

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
  exercises: Exercise[];
  pro: boolean;
  icon: string;
}

const PROGRAMS: Program[] = [
  {
    id: "p1",
    name: "Rookie Foundation",
    level: "Beginner",
    description: "Build your basketball fundamentals from the ground up.",
    icon: "🏀",
    pro: false,
    exercises: [
      { id: "e1", name: "Stationary Ball Handling", duration: "10 min", description: "Two-ball dribbling in place, head up.", category: "ball", completed: false },
      { id: "e2", name: "Form Shooting", duration: "15 min", reps: "100 makes", description: "Close-range form shots, consistent release.", category: "shooting", completed: false },
      { id: "e3", name: "Defensive Slides", duration: "5 min", description: "Lateral slides end-to-end, stay low.", category: "conditioning", completed: false },
      { id: "e4", name: "Court Vision Drills", duration: "10 min", description: "Dribble while tracking moving targets.", category: "iq", completed: false },
    ],
  },
  {
    id: "p2",
    name: "Court Dominator",
    level: "Intermediate",
    description: "Sharpen your offensive weapons and tighten your D.",
    icon: "⚡",
    pro: false,
    exercises: [
      { id: "e5", name: "Crossover Combos", duration: "15 min", description: "Between-legs, behind-back, hesitation in sequence.", category: "ball", completed: false },
      { id: "e6", name: "Catch-and-Shoot", duration: "20 min", reps: "150 makes", description: "Corner 3s, mid-range pull-ups, off the catch.", category: "shooting", completed: false },
      { id: "e7", name: "Plyometric Series", duration: "15 min", description: "Box jumps, lateral bounds, sprint finishes.", category: "conditioning", completed: false },
      { id: "e8", name: "Film Study Simulation", duration: "10 min", description: "Recall and diagram plays from memory.", category: "iq", completed: false },
      { id: "e9", name: "Finishing Package", duration: "15 min", reps: "50 each hand", description: "Euro-step, reverse layup, floater.", category: "ball", completed: false },
    ],
  },
  {
    id: "p3",
    name: "Elite Playmaker",
    level: "Advanced",
    description: "Pro-level training for players chasing Legend rank.",
    icon: "💎",
    pro: true,
    exercises: [
      { id: "e10", name: "Full-Speed Ball Handling", duration: "20 min", description: "All dribble moves at game speed.", category: "ball", completed: false },
      { id: "e11", name: "Step-Back & Pull-Up Series", duration: "25 min", reps: "200 makes", description: "Mid-range step-back, pull-ups, off-balance shots.", category: "shooting", completed: false },
      { id: "e12", name: "Anaerobic Conditioning", duration: "20 min", description: "17-second sprints, 30s rest × 10.", category: "conditioning", completed: false },
      { id: "e13", name: "Defensive IQ Pressure", duration: "15 min", description: "Force decisions in 3-second windows.", category: "iq", completed: false },
      { id: "e14", name: "Post Moves Mastery", duration: "20 min", description: "Drop step, up-and-under, hook from both blocks.", category: "ball", completed: false },
      { id: "e15", name: "Leadership & Communication", duration: "10 min", description: "Vocal cues, defensive assignments, play-calling.", category: "iq", completed: false },
    ],
  },
];

const CAT_ICONS: Record<string, "activity" | "target" | "zap" | "eye"> = {
  ball: "activity", shooting: "target", conditioning: "zap", iq: "eye",
};
const CAT_COLORS: Record<string, string> = {
  ball: "#1B6EFF", shooting: "#FF6B1A", conditioning: "#22C55E", iq: "#A855F7",
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Tab = "coach" | "programs" | "active";

export default function TrainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const [activeTab, setActiveTab] = useState<Tab>("coach");
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // ── Coach state ──
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "coach", text: `Ready to level up, ${user.name}? I'm your AI Coach. Ask me anything about basketball — technique, strategy, mindset, or how to climb the rank ladder.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");
    const userMsg: Message = { id: Date.now().toString(36), role: "user", text: msg };
    setMessages((p) => [...p, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const coachMsg: Message = { id: Date.now().toString(36) + "c", role: "coach", text: getCoachResponse(msg) };
      setMessages((p) => [...p, coachMsg]);
      setTyping(false);
    }, 800 + Math.random() * 500);
  };

  const openProgram = (p: Program) => {
    if (p.pro && user.membership === "free") return;
    setActiveProgram(p);
    setExercises(p.exercises.map((e) => ({ ...e, completed: false })));
    setActiveTab("active");
  };

  const toggleExercise = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExercises((prev) => prev.map((e) => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const completedCount = exercises.filter((e) => e.completed).length;
  const progress = exercises.length > 0 ? completedCount / exercises.length : 0;

  // ─────────────────────────────────────────────────────────────────────────────

  const renderCoach = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isCoach = item.role === "coach";
          return (
            <View style={[styles.msgRow, isCoach ? undefined : styles.userRow]}>
              {isCoach && (
                <View style={[styles.coachAvatar, { backgroundColor: colors.primary + "22" }]}>
                  <Feather name="cpu" size={13} color={colors.primary} />
                </View>
              )}
              <View style={[
                styles.bubble,
                isCoach
                  ? [styles.coachBubble, { backgroundColor: colors.card, borderColor: colors.border }]
                  : [styles.userBubble, { backgroundColor: colors.primary }],
              ]}>
                <Text style={{ color: isCoach ? colors.foreground : "#fff", fontSize: 14, lineHeight: 21 }}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={typing ? (
          <View style={styles.msgRow}>
            <View style={[styles.coachAvatar, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="cpu" size={13} color={colors.primary} />
            </View>
            <View style={[styles.bubble, styles.coachBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14, letterSpacing: 3 }}>● ● ●</Text>
            </View>
          </View>
        ) : null}
      />
      {/* Quick prompts */}
      {messages.length <= 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptsScroll}>
          <View style={styles.promptsRow}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.promptBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => sendMessage(p)}
                activeOpacity={0.85}
              >
                <Text style={[styles.promptText, { color: colors.primary }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
        <TextInput
          style={[styles.textInput, { color: colors.foreground, backgroundColor: colors.input }]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach anything..."
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.secondary }]}
          onPress={() => sendMessage()}
          disabled={!input.trim()}
          activeOpacity={0.85}
        >
          <Feather name="send" size={17} color={input.trim() ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderPrograms = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.programsContent, { paddingBottom: botPad }]}
    >
      {PROGRAMS.map((program) => {
        const locked = program.pro && user.membership === "free";
        return (
          <TouchableOpacity
            key={program.id}
            style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: locked ? 0.7 : 1 }]}
            onPress={() => openProgram(program)}
            activeOpacity={0.85}
          >
            <View style={styles.programRow}>
              <Text style={styles.programIcon}>{program.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.programTitleRow}>
                  <Text style={[styles.programName, { color: colors.foreground }]}>{program.name}</Text>
                  {program.pro && (
                    <View style={[styles.proBadge, { backgroundColor: colors.gold }]}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                  {locked && <Feather name="lock" size={13} color={colors.mutedForeground} />}
                </View>
                <Text style={[styles.programLevel, { color: colors.primary }]}>{program.level}</Text>
                <Text style={[styles.programDesc, { color: colors.mutedForeground }]}>{program.description}</Text>
              </View>
            </View>
            <View style={styles.exerciseChips}>
              {program.exercises.slice(0, 4).map((e) => (
                <View key={e.id} style={[styles.chip, { backgroundColor: CAT_COLORS[e.category] + "22" }]}>
                  <Feather name={CAT_ICONS[e.category]} size={10} color={CAT_COLORS[e.category]} />
                  <Text style={[styles.chipText, { color: CAT_COLORS[e.category] }]}>
                    {e.name.split(" ")[0]}
                  </Text>
                </View>
              ))}
              {program.exercises.length > 4 && (
                <Text style={[styles.moreText, { color: colors.mutedForeground }]}>+{program.exercises.length - 4}</Text>
              )}
            </View>
            <View style={styles.programFooter}>
              <Text style={[styles.startText, { color: locked ? colors.mutedForeground : colors.primary }]}>
                {locked ? "Unlock with Pro" : "Start Session →"}
              </Text>
              <Text style={[styles.exerciseCount, { color: colors.mutedForeground }]}>
                {program.exercises.length} exercises
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderActiveProgram = () => {
    if (!activeProgram) return null;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.programsContent, { paddingBottom: botPad }]}
      >
        {/* Progress bar */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground }]}>
              {activeProgram.icon} {activeProgram.name}
            </Text>
            <Text style={[styles.progressFrac, { color: colors.primary }]}>
              {completedCount}/{exercises.length}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.secondary }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
          </View>
          {progress === 1 && (
            <Text style={[styles.completeLabel, { color: colors.success }]}>
              ✓ Session complete! Rest, hydrate, come back stronger.
            </Text>
          )}
        </View>

        {exercises.map((exercise) => {
          const cc = CAT_COLORS[exercise.category];
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                {
                  backgroundColor: exercise.completed ? cc + "15" : colors.card,
                  borderColor: exercise.completed ? cc : colors.border,
                },
              ]}
              onPress={() => toggleExercise(exercise.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: cc + "22" }]}>
                <Feather name={CAT_ICONS[exercise.category]} size={17} color={cc} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[
                  styles.exerciseName,
                  { color: colors.foreground, textDecorationLine: exercise.completed ? "line-through" : "none", opacity: exercise.completed ? 0.6 : 1 },
                ]}>
                  {exercise.name}
                </Text>
                <Text style={[styles.exerciseMeta, { color: colors.mutedForeground }]}>
                  {exercise.duration}{exercise.reps ? ` • ${exercise.reps}` : ""}
                </Text>
                <Text style={[styles.exerciseDesc, { color: colors.mutedForeground }]}>{exercise.description}</Text>
              </View>
              <View style={[
                styles.checkCircle,
                { backgroundColor: exercise.completed ? cc : "transparent", borderColor: exercise.completed ? cc : colors.border },
              ]}>
                {exercise.completed && <Feather name="check" size={13} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AnimatedBackground variant="train" />
      <BasketballBorder />
      {/* Page header */}
      <View style={[styles.pageHeader, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Train</Text>
        {user.membership === "free" && (
          <TouchableOpacity
            style={[styles.proHint, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44" }]}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.85}
          >
            <Feather name="zap" size={12} color={colors.gold} />
            <Text style={[styles.proHintText, { color: colors.gold }]}>Go Pro</Text>
          </TouchableOpacity>
        )}
        {user.membership === "pro" && (
          <View style={[styles.proBadgeLg, { backgroundColor: colors.gold }]}>
            <Feather name="zap" size={12} color="#000" />
            <Text style={styles.proBadgeLgText}>PRO</Text>
          </View>
        )}
      </View>

      {/* Sub-tabs */}
      <View style={[styles.subTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["coach", "programs", ...(activeProgram ? ["active"] : [])] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.subTab,
              activeTab === t && { backgroundColor: colors.primary, borderRadius: 10 },
            ]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.8}
          >
            <Feather
              name={t === "coach" ? "cpu" : t === "programs" ? "activity" : "play-circle"}
              size={14}
              color={activeTab === t ? "#fff" : colors.mutedForeground}
            />
            <Text style={[styles.subTabText, { color: activeTab === t ? "#fff" : colors.mutedForeground }]}>
              {t === "coach" ? "AI Coach" : t === "programs" ? "Programs" : activeProgram?.name.split(" ")[0] ?? "Session"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "coach" && renderCoach()}
        {activeTab === "programs" && renderPrograms()}
        {activeTab === "active" && renderActiveProgram()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  pageHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  pageTitle: { flex: 1, fontSize: 26, fontWeight: "800" as const },
  proHint: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  proHintText: { fontSize: 12, fontWeight: "700" as const },
  proBadgeLg: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  proBadgeLgText: { fontSize: 11, fontWeight: "800" as const, color: "#000" },
  subTabs: { flexDirection: "row", marginHorizontal: 20, marginBottom: 12, borderRadius: 14, borderWidth: 1, padding: 4 },
  subTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9 },
  subTabText: { fontSize: 12, fontWeight: "600" as const },
  // Coach
  chatList: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  userRow: { flexDirection: "row-reverse" as const },
  coachAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { padding: 13, borderRadius: 18, borderWidth: 1, maxWidth: "80%" },
  coachBubble: { borderBottomLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4, borderWidth: 0 },
  promptsScroll: { maxHeight: 50 },
  promptsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  promptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  promptText: { fontSize: 12, fontWeight: "600" as const },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  // Programs
  programsContent: { paddingHorizontal: 20, paddingTop: 4, gap: 14 },
  programCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  programRow: { flexDirection: "row", gap: 12 },
  programIcon: { fontSize: 28, marginTop: 2 },
  programTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  programName: { fontSize: 16, fontWeight: "700" as const },
  proBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proBadgeText: { fontSize: 9, fontWeight: "800" as const, color: "#000" },
  programLevel: { fontSize: 12, fontWeight: "600" as const, marginBottom: 4 },
  programDesc: { fontSize: 12, lineHeight: 18 },
  exerciseChips: { flexDirection: "row", flexWrap: "wrap" as const, gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  chipText: { fontSize: 10, fontWeight: "600" as const },
  moreText: { fontSize: 11, alignSelf: "center" },
  programFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  startText: { fontSize: 13, fontWeight: "700" as const },
  exerciseCount: { fontSize: 12 },
  // Active session
  progressCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 15, fontWeight: "700" as const },
  progressFrac: { fontSize: 18, fontWeight: "800" as const },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" as const },
  progressFill: { height: "100%", borderRadius: 4 },
  completeLabel: { fontSize: 13, fontWeight: "600" as const },
  exerciseCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  exerciseIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  exerciseName: { fontSize: 14, fontWeight: "700" as const },
  exerciseMeta: { fontSize: 12, fontWeight: "500" as const },
  exerciseDesc: { fontSize: 12, lineHeight: 18 },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
