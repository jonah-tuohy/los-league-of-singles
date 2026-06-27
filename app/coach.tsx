import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorsHook } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

interface Message {
  id: string;
  role: "user" | "coach";
  text: string;
}

const COACH_RESPONSES: Record<string, string> = {
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
};

function getCoachResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(COACH_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  return COACH_RESPONSES.default;
}

const STARTER_PROMPTS = [
  "How do I improve my shooting?",
  "Tips for 1v1 defense?",
  "How to climb the rank system?",
  "Best training routine?",
];

export default function CoachScreen() {
  const colors = useColorsHook();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "coach",
      text: `Welcome, ${user.name}. I'm your AI Coach. I analyze your gameplay, provide real-time strategies, and help you dominate the court. What do you want to work on today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(36),
      role: "user",
      text: msg,
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    setTimeout(() => {
      const coachMsg: Message = {
        id: Date.now().toString(36) + "c",
        role: "coach",
        text: getCoachResponse(msg),
      };
      setMessages((prev) => [...prev, coachMsg]);
      setTyping(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 900 + Math.random() * 600);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isCoach = item.role === "coach";
    return (
      <View style={[styles.messageRow, isCoach ? styles.coachRow : styles.userRow]}>
        {isCoach && (
          <View style={[styles.coachAvatar, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="cpu" size={14} color={colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isCoach
              ? [styles.coachBubble, { backgroundColor: colors.card, borderColor: colors.border }]
              : [styles.userBubble, { backgroundColor: colors.primary }],
            { maxWidth: "78%" },
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              { color: isCoach ? colors.foreground : colors.primaryForeground },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.coachInfo, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="cpu" size={16} color={colors.primary} />
          <Text style={[styles.coachName, { color: colors.foreground }]}>AI Coach</Text>
          <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Pro banner for free users */}
      {user.membership === "free" && (
        <View style={[styles.proBanner, { backgroundColor: colors.gold + "18", borderColor: colors.gold + "33" }]}>
          <Feather name="zap" size={14} color={colors.gold} />
          <Text style={[styles.proBannerText, { color: colors.gold }]}>
            Upgrade to Pro for unlimited AI coaching sessions
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          typing ? (
            <View style={styles.typingRow}>
              <View style={[styles.coachAvatar, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="cpu" size={14} color={colors.primary} />
              </View>
              <View style={[styles.bubble, styles.coachBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.typingDots, { color: colors.mutedForeground }]}>●  ●  ●</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Starter Prompts */}
      {messages.length <= 1 && (
        <View style={styles.starterRow}>
          {STARTER_PROMPTS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.starterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => sendMessage(p)}
              activeOpacity={0.85}
            >
              <Text style={[styles.starterText, { color: colors.primary }]} numberOfLines={2}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8,
          },
        ]}
      >
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
          style={[
            styles.sendBtn,
            { backgroundColor: input.trim() ? colors.primary : colors.secondary },
          ]}
          onPress={() => sendMessage()}
          activeOpacity={0.85}
          disabled={!input.trim()}
        >
          <Feather name="send" size={18} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  coachInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coachName: { fontSize: 15, fontWeight: "700" as const },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  proBannerText: { fontSize: 12, fontWeight: "600" as const, flex: 1 },
  messageList: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  coachRow: {},
  userRow: { flexDirection: "row-reverse" as const },
  coachAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  coachBubble: { borderBottomLeftRadius: 4 },
  userBubble: { borderBottomRightRadius: 4, borderWidth: 0 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 },
  typingDots: { fontSize: 14, letterSpacing: 3 },
  starterRow: {
    flexDirection: "row",
    flexWrap: "wrap" as const,
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  starterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: "47%",
  },
  starterText: { fontSize: 12, fontWeight: "600" as const },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
