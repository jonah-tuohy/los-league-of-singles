import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getRankFromPoints } from "@/constants/colors";

export interface Title {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  points: number;
  rank: string;
  coins: number;
  wins: number;
  losses: number;
  winStreak: number;
  membership: "free" | "pro";
  titles: Title[];
  joinedAt: string;
  mode1v1W: number;
  mode2v2W: number;
  mode3v3W: number;
  mode4v4W: number;
  mode5v5W: number;
}

export interface GamePlayer {
  id: string;
  name: string;
  rank: string;
  avatar: string;
}

export interface Game {
  id: string;
  mode: "1v1" | "2v2" | "3v3" | "4v4" | "5v5";
  status: "waiting" | "active" | "finished";
  team1: GamePlayer[];
  team2: GamePlayer[];
  team1Score: number;
  team2Score: number;
  betPerPlayer: number;
  totalPot: number;
  winnerId?: string;
  courtName: string;
  createdAt: string;
  aiRefEnabled: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  username: string;
  rank: string;
  points: number;
  wins: number;
  avatar: string;
  title?: string;
}

const ALL_TITLES: Title[] = [
  { id: "first_win", name: "First Blood", description: "Win your first game", earned: false },
  { id: "win_5", name: "On a Roll", description: "Win 5 games", earned: false },
  { id: "win_10", name: "Court Regular", description: "Win 10 games", earned: false },
  { id: "win_25", name: "Court King", description: "Win 25 games", earned: false },
  { id: "win_50", name: "Legend Status", description: "Win 50 games", earned: false },
  { id: "streak_3", name: "Hat Trick", description: "Win 3 in a row", earned: false },
  { id: "streak_5", name: "Unstoppable", description: "Win 5 in a row", earned: false },
  { id: "five_modes", name: "Triple Threat", description: "Play all 5 game modes", earned: false },
  { id: "gold_rank", name: "Gold Standard", description: "Reach Gold rank", earned: false },
  { id: "diamond_rank", name: "Diamond Mentality", description: "Reach Diamond rank", earned: false },
  { id: "legend_rank", name: "Born Legend", description: "Reach Legend rank", earned: false },
  { id: "big_bet", name: "High Roller", description: "Win a game with 500+ coin pot", earned: false },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: "l1", name: "Marcus Webb", username: "mwebb23", rank: "Legend", points: 3420, wins: 187, avatar: "MW", title: "Born Legend" },
  { id: "l2", name: "Jaylen Cross", username: "jcross", rank: "Elite", points: 2890, wins: 143, avatar: "JC", title: "Unstoppable" },
  { id: "l3", name: "DeShawn Miles", username: "dmiles", rank: "Elite", points: 2650, wins: 128, avatar: "DM", title: "Court King" },
  { id: "l4", name: "Kayla Storm", username: "kstorm_bball", rank: "Diamond", points: 1920, wins: 96, avatar: "KS", title: "Diamond Mentality" },
  { id: "l5", name: "Trevon Hart", username: "thart21", rank: "Diamond", points: 1780, wins: 89, avatar: "TH" },
  { id: "l6", name: "Amir Johnson", username: "amirj", rank: "Platinum", points: 1340, wins: 67, avatar: "AJ", title: "Gold Standard" },
  { id: "l7", name: "Brianna Cole", username: "bcole_hoops", rank: "Platinum", points: 1180, wins: 59, avatar: "BC" },
  { id: "l8", name: "Zeke Monroe", username: "zmonroe", rank: "Gold", points: 870, wins: 44, avatar: "ZM" },
  { id: "l9", name: "Priya Nair", username: "pnair_bball", rank: "Gold", points: 720, wins: 36, avatar: "PN" },
  { id: "l10", name: "Chris Vega", username: "cvega10", rank: "Silver", points: 490, wins: 25, avatar: "CV", title: "Hat Trick" },
];

const DEFAULT_USER: UserProfile = {
  id: "user_" + Date.now().toString(36),
  name: "Baller",
  username: "baller_1",
  avatar: "BA",
  points: 0,
  rank: "Rookie",
  coins: 500,
  wins: 0,
  losses: 0,
  winStreak: 0,
  membership: "free",
  titles: ALL_TITLES.map((t) => ({ ...t })),
  joinedAt: new Date().toISOString(),
  mode1v1W: 0,
  mode2v2W: 0,
  mode3v3W: 0,
  mode4v4W: 0,
  mode5v5W: 0,
};

interface AppContextType {
  user: UserProfile;
  games: Game[];
  leaderboard: LeaderboardEntry[];
  updateUser: (updates: Partial<UserProfile>) => void;
  createGame: (game: Omit<Game, "id" | "createdAt">) => Game;
  updateGame: (id: string, updates: Partial<Game>) => void;
  recordWin: (game: Game) => void;
  recordLoss: () => void;
  upgradeMembership: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@los_user_v1";
const GAMES_KEY = "@los_games_v1";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
        const graw = await AsyncStorage.getItem(GAMES_KEY);
        if (graw) setGames(JSON.parse(graw));
      } catch (_) {}
    })();
  }, []);

  const saveUser = useCallback(async (u: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const saveGames = useCallback(async (g: Game[]) => {
    await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(g));
  }, []);

  const updateUser = useCallback(
    (updates: Partial<UserProfile>) => {
      setUser((prev) => {
        const updated = { ...prev, ...updates };
        updated.rank = getRankFromPoints(updated.points);
        saveUser(updated);
        return updated;
      });
    },
    [saveUser]
  );

  const createGame = useCallback(
    (gameData: Omit<Game, "id" | "createdAt">): Game => {
      const game: Game = {
        ...gameData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        createdAt: new Date().toISOString(),
      };
      setGames((prev) => {
        const updated = [game, ...prev].slice(0, 50);
        saveGames(updated);
        return updated;
      });
      return game;
    },
    [saveGames]
  );

  const updateGame = useCallback(
    (id: string, updates: Partial<Game>) => {
      setGames((prev) => {
        const updated = prev.map((g) => (g.id === id ? { ...g, ...updates } : g));
        saveGames(updated);
        return updated;
      });
    },
    [saveGames]
  );

  const checkAndAwardTitles = useCallback(
    (updatedUser: UserProfile): Title[] => {
      const titles = updatedUser.titles.map((t) => ({ ...t }));
      const markEarned = (id: string) => {
        const t = titles.find((x) => x.id === id);
        if (t && !t.earned) {
          t.earned = true;
          t.earnedAt = new Date().toISOString();
        }
      };
      if (updatedUser.wins >= 1) markEarned("first_win");
      if (updatedUser.wins >= 5) markEarned("win_5");
      if (updatedUser.wins >= 10) markEarned("win_10");
      if (updatedUser.wins >= 25) markEarned("win_25");
      if (updatedUser.wins >= 50) markEarned("win_50");
      if (updatedUser.winStreak >= 3) markEarned("streak_3");
      if (updatedUser.winStreak >= 5) markEarned("streak_5");
      const modesWon = [
        updatedUser.mode1v1W,
        updatedUser.mode2v2W,
        updatedUser.mode3v3W,
        updatedUser.mode4v4W,
        updatedUser.mode5v5W,
      ].filter((v) => v > 0).length;
      if (modesWon >= 5) markEarned("five_modes");
      if (updatedUser.points >= 600) markEarned("gold_rank");
      if (updatedUser.points >= 1500) markEarned("diamond_rank");
      if (updatedUser.points >= 3000) markEarned("legend_rank");
      return titles;
    },
    []
  );

  const recordWin = useCallback(
    (game: Game) => {
      const playersInGame = game.mode === "1v1" ? 2 : game.mode === "2v2" ? 4 : game.mode === "3v3" ? 6 : game.mode === "4v4" ? 8 : 10;
      const totalPot = game.betPerPlayer * playersInGame;
      const winnerPot = Math.floor(totalPot * 0.8);

      setUser((prev) => {
        const modeKey = `mode${game.mode}W` as keyof UserProfile;
        const updated: UserProfile = {
          ...prev,
          wins: prev.wins + 1,
          winStreak: prev.winStreak + 1,
          points: prev.points + 50 + game.betPerPlayer,
          coins: prev.coins + winnerPot,
          [modeKey]: ((prev[modeKey] as number) || 0) + 1,
        };
        updated.rank = getRankFromPoints(updated.points);
        updated.titles = checkAndAwardTitles(updated);
        saveUser(updated);
        return updated;
      });
    },
    [saveUser, checkAndAwardTitles]
  );

  const recordLoss = useCallback(() => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        losses: prev.losses + 1,
        winStreak: 0,
        points: Math.max(0, prev.points - 20),
      };
      updated.rank = getRankFromPoints(updated.points);
      saveUser(updated);
      return updated;
    });
  }, [saveUser]);

  const upgradeMembership = useCallback(() => {
    updateUser({ membership: "pro" });
  }, [updateUser]);

  return (
    <AppContext.Provider
      value={{
        user,
        games,
        leaderboard: MOCK_LEADERBOARD,
        updateUser,
        createGame,
        updateGame,
        recordWin,
        recordLoss,
        upgradeMembership,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
