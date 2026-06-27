import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Court {
  id: string;
  name: string;
  address: string;
  surface: string;
  lights: boolean;
  indoor: boolean;
  activeGames: number;
  rating: number;
  distance: string;
}

function generateCourts(): Court[] {
  return [
    { id: "c1", name: "Riverside Basketball Court", address: "Riverside Park", surface: "asphalt", lights: true, indoor: false, activeGames: 3, rating: 4.6, distance: "0.3 mi" },
    { id: "c2", name: "Central Sports Complex", address: "Central Ave", surface: "hardwood", lights: true, indoor: true, activeGames: 5, rating: 4.8, distance: "0.7 mi" },
    { id: "c3", name: "Eastside Courts", address: "East District Park", surface: "concrete", lights: false, indoor: false, activeGames: 1, rating: 4.2, distance: "1.1 mi" },
    { id: "c4", name: "West End Hoops", address: "West End Community Center", surface: "hardwood", lights: true, indoor: true, activeGames: 2, rating: 4.5, distance: "1.4 mi" },
    { id: "c5", name: "North Park Courts", address: "North City Park", surface: "asphalt", lights: true, indoor: false, activeGames: 4, rating: 4.3, distance: "1.8 mi" },
    { id: "c6", name: "Harbor View Courts", address: "Harbor District", surface: "asphalt", lights: false, indoor: false, activeGames: 0, rating: 4.1, distance: "2.2 mi" },
  ];
}

export default function CourtMap() {
  const colors = useColors();
  const [courts] = useState<Court[]>(generateCourts());
  const [selected, setSelected] = useState<Court | null>(null);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 67 + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nearby Courts</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{courts.length} found</Text>
      </View>

      {/* Placeholder map area */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Feather name="map" size={40} color={colors.primary + "66"} />
        <Text style={[styles.mapText, { color: colors.mutedForeground }]}>
          Interactive map available in the mobile app
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.list, { paddingBottom: 34 + 84 }]}
        showsVerticalScrollIndicator={false}
      >
        {courts.map((court) => (
          <TouchableOpacity
            key={court.id}
            style={[
              styles.courtCard,
              {
                backgroundColor: selected?.id === court.id ? colors.primary + "12" : colors.card,
                borderColor: selected?.id === court.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSelected(selected?.id === court.id ? null : court)}
            activeOpacity={0.85}
          >
            <View style={styles.courtHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.courtName, { color: colors.foreground }]}>{court.name}</Text>
                <Text style={[styles.courtAddress, { color: colors.mutedForeground }]}>{court.address}</Text>
              </View>
              <View style={styles.distBadge}>
                <Text style={[styles.distText, { color: colors.primary }]}>{court.distance}</Text>
              </View>
            </View>
            <View style={styles.meta}>
              <View style={[styles.tag, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{court.surface}</Text>
              </View>
              {court.lights && (
                <View style={[styles.tag, { backgroundColor: colors.gold + "22" }]}>
                  <Feather name="sun" size={11} color={colors.gold} />
                  <Text style={[styles.tagText, { color: colors.gold }]}>Lights</Text>
                </View>
              )}
              {court.indoor && (
                <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>Indoor</Text>
                </View>
              )}
              {court.activeGames > 0 && (
                <View style={[styles.tag, { backgroundColor: colors.success + "22" }]}>
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.tagText, { color: colors.success }]}>{court.activeGames} active</Text>
                </View>
              )}
            </View>
            <View style={styles.ratingRow}>
              <Feather name="star" size={13} color={colors.gold} />
              <Text style={[styles.rating, { color: colors.foreground }]}>{court.rating}</Text>
              <Text style={[styles.ratingLabel, { color: colors.mutedForeground }]}>community rating</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700" as const },
  count: { fontSize: 13 },
  mapPlaceholder: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderBottomWidth: 1,
  },
  mapText: { fontSize: 13 },
  list: { padding: 20, gap: 12 },
  courtCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  courtHeader: { flexDirection: "row", alignItems: "flex-start" },
  courtName: { fontSize: 15, fontWeight: "700" as const },
  courtAddress: { fontSize: 12, marginTop: 2 },
  distBadge: {},
  distText: { fontSize: 13, fontWeight: "600" as const },
  meta: { flexDirection: "row", flexWrap: "wrap" as const, gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  tagText: { fontSize: 11, fontWeight: "600" as const },
  dot: { width: 6, height: 6, borderRadius: 3 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  rating: { fontSize: 14, fontWeight: "700" as const },
  ratingLabel: { fontSize: 11 },
});
