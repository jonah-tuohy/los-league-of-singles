import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export interface Court {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  surface: "asphalt" | "hardwood" | "concrete";
  lights: boolean;
  indoor: boolean;
  activeGames: number;
  rating: number;
}

function generateNearbyCourts(lat: number, lng: number): Court[] {
  const offsets = [
    { dlat: 0.008, dlng: 0.012, name: "Riverside Basketball Court", address: "Riverside Park", surface: "asphalt" as const, lights: true, indoor: false, activeGames: 3, rating: 4.6 },
    { dlat: -0.005, dlng: 0.018, name: "Central Sports Complex", address: "Central Ave", surface: "hardwood" as const, lights: true, indoor: true, activeGames: 5, rating: 4.8 },
    { dlat: 0.014, dlng: -0.009, name: "Eastside Courts", address: "East District Park", surface: "concrete" as const, lights: false, indoor: false, activeGames: 1, rating: 4.2 },
    { dlat: -0.012, dlng: -0.015, name: "West End Hoops", address: "West End Community Center", surface: "hardwood" as const, lights: true, indoor: true, activeGames: 2, rating: 4.5 },
    { dlat: 0.021, dlng: 0.007, name: "North Park Courts", address: "North City Park", surface: "asphalt" as const, lights: true, indoor: false, activeGames: 4, rating: 4.3 },
    { dlat: -0.018, dlng: 0.023, name: "Harbor View Courts", address: "Harbor District", surface: "asphalt" as const, lights: false, indoor: false, activeGames: 0, rating: 4.1 },
  ];
  return offsets.map((o, i) => ({
    id: `court_${i}`,
    latitude: lat + o.dlat,
    longitude: lng + o.dlng,
    name: o.name,
    address: o.address,
    surface: o.surface,
    lights: o.lights,
    indoor: o.indoor,
    activeGames: o.activeGames,
    rating: o.rating,
  }));
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a111f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6B7FA3" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a111f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#0D1B2E" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1C2E44" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050D1A" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0D1B2E" }] },
];

export default function CourtMap() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          const fallback = { latitude: 40.7128, longitude: -74.006 };
          setLocation(fallback);
          setCourts(generateNearbyCourts(fallback.latitude, fallback.longitude));
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocation(coords);
        setCourts(generateNearbyCourts(coords.latitude, coords.longitude));
        setLoading(false);
      } catch {
        const fallback = { latitude: 40.7128, longitude: -74.006 };
        setLocation(fallback);
        setCourts(generateNearbyCourts(fallback.latitude, fallback.longitude));
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Finding courts near you...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: location!.latitude,
          longitude: location!.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={DARK_MAP_STYLE}
      >
        {courts.map((court) => (
          <Marker
            key={court.id}
            coordinate={{ latitude: court.latitude, longitude: court.longitude }}
            onPress={() => setSelectedCourt(court)}
          >
            <View
              style={[
                styles.markerContainer,
                {
                  backgroundColor: selectedCourt?.id === court.id ? colors.primary : colors.card,
                  borderColor: selectedCourt?.id === court.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather
                name="map-pin"
                size={14}
                color={selectedCourt?.id === court.id ? colors.primaryForeground : colors.primary}
              />
              {court.activeGames > 0 && (
                <View style={[styles.activeDot, { backgroundColor: colors.success }]}>
                  <Text style={styles.activeDotText}>{court.activeGames}</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.headerCard, { backgroundColor: colors.card + "EE", borderColor: colors.border }]}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Nearby Courts</Text>
          <Text style={[styles.courtCount, { color: colors.mutedForeground }]}>{courts.length} found</Text>
        </View>
      </View>

      {/* Selected Court */}
      {selectedCourt && (
        <View style={[styles.courtCard, { paddingBottom: insets.bottom + 8 }]}>
          <View style={[styles.courtCardInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.courtCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.courtName, { color: colors.foreground }]}>{selectedCourt.name}</Text>
                <Text style={[styles.courtAddress, { color: colors.mutedForeground }]}>{selectedCourt.address}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCourt(null)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <View style={styles.courtMeta}>
              <View style={[styles.courtTag, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="layers" size={12} color={colors.primary} />
                <Text style={[styles.courtTagText, { color: colors.primary }]}>{selectedCourt.surface}</Text>
              </View>
              {selectedCourt.lights && (
                <View style={[styles.courtTag, { backgroundColor: colors.gold + "22" }]}>
                  <Feather name="sun" size={12} color={colors.gold} />
                  <Text style={[styles.courtTagText, { color: colors.gold }]}>Lights</Text>
                </View>
              )}
              {selectedCourt.indoor && (
                <View style={[styles.courtTag, { backgroundColor: colors.secondary }]}>
                  <Feather name="home" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.courtTagText, { color: colors.mutedForeground }]}>Indoor</Text>
                </View>
              )}
              {selectedCourt.activeGames > 0 && (
                <View style={[styles.courtTag, { backgroundColor: colors.success + "22" }]}>
                  <Feather name="activity" size={12} color={colors.success} />
                  <Text style={[styles.courtTagText, { color: colors.success }]}>{selectedCourt.activeGames} active</Text>
                </View>
              )}
            </View>
            <View style={styles.courtRating}>
              <Feather name="star" size={14} color={colors.gold} />
              <Text style={[styles.ratingText, { color: colors.foreground }]}>{selectedCourt.rating}</Text>
              <Text style={[styles.ratingLabel, { color: colors.mutedForeground }]}>community rating</Text>
            </View>
          </View>
        </View>
      )}

      {!selectedCourt && (
        <View style={[styles.listContainer, { paddingBottom: insets.bottom + 8 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courtList}>
            {courts.map((court) => (
              <TouchableOpacity
                key={court.id}
                style={[styles.courtChip, { backgroundColor: colors.card + "EE", borderColor: colors.border }]}
                onPress={() => {
                  setSelectedCourt(court);
                  mapRef.current?.animateToRegion({
                    latitude: court.latitude,
                    longitude: court.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  });
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipName, { color: colors.foreground }]} numberOfLines={1}>{court.name}</Text>
                {court.activeGames > 0 && (
                  <View style={[styles.chipBadge, { backgroundColor: colors.success }]}>
                    <Text style={styles.chipBadgeText}>{court.activeGames}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  headerOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 20 },
  headerCard: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 16, borderWidth: 1 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700" as const },
  courtCount: { fontSize: 13 },
  markerContainer: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  activeDot: { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  activeDotText: { fontSize: 9, fontWeight: "700" as const, color: "#fff" },
  courtCard: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 8 },
  courtCardInner: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  courtCardHeader: { flexDirection: "row", alignItems: "flex-start" },
  courtName: { fontSize: 17, fontWeight: "700" as const },
  courtAddress: { fontSize: 13, marginTop: 2 },
  courtMeta: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  courtTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  courtTagText: { fontSize: 12, fontWeight: "600" as const },
  courtRating: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontSize: 15, fontWeight: "700" as const },
  ratingLabel: { fontSize: 12 },
  listContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 8 },
  courtList: { paddingHorizontal: 20, gap: 10 },
  courtChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, maxWidth: 200 },
  chipName: { fontSize: 13, fontWeight: "600" as const, maxWidth: 140 },
  chipBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  chipBadgeText: { fontSize: 10, fontWeight: "700" as const, color: "#fff" },
});
