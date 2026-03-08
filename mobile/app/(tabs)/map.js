import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getEvents, getGenres } from '../../lib/api';
import { colors, spacing, radii } from '../../lib/theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const genreEmojis = {
  'Techno': '🎛️', 'House': '🏠', 'Reggaeton': '🔥', 'EDM': '⚡',
  'Salsa': '💃', 'Rock': '🎸', 'Hip Hop': '🎤', 'Pop': '🎵',
  'Latin': '🌴', 'Jazz': '🎷', 'Metal': '🤘', 'Indie': '🎹',
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#222222' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e0e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
];

export default function MapScreen() {
  const [events, setEvents] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const scrollRef = useRef(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadData();
    requestLocation();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [selectedGenre]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
      }
    } catch (e) {
      // Default to Bogotá
      setLocation({ latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.08, longitudeDelta: 0.08 });
    }
  };

  const loadData = async () => {
    try {
      const [eventsRes, genresRes] = await Promise.all([getEvents(), getGenres()]);
      setEvents(eventsRes.data);
      setGenres(genresRes.data);
    } catch (e) {
      console.log('Error loading data:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const params = selectedGenre ? { genre: selectedGenre } : {};
      const res = await getEvents(params);
      setEvents(res.data);
    } catch (e) {
      console.log('Error:', e.message);
    }
  };

  const onMarkerPress = useCallback((event, index) => {
    setSelectedEvent(event);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current?.animateToRegion({
      latitude: event.lat - 0.008,
      longitude: event.lng,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }, 400);
    scrollRef.current?.scrollTo({ x: index * (CARD_WIDTH + 16), animated: true });
  }, []);

  const formatDate = (d) => {
    const date = new Date(d);
    const day = date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
    const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return `${day} · ${time}`;
  };

  const formatPrice = (price, currency) => {
    if (price === 0) return 'GRATIS';
    return `$${price.toLocaleString()} ${currency}`;
  };

  if (loading || !location) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={location}
        customMapStyle={darkMapStyle}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ bottom: 220 }}
      >
        {events.map((event, i) => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.lat, longitude: event.lng }}
            onPress={() => onMarkerPress(event, i)}
          >
            <View style={[
              styles.marker,
              selectedEvent?.id === event.id && styles.markerActive,
              { backgroundColor: colors.genres[event.genre] || colors.accent }
            ]}>
              <Text style={styles.markerEmoji}>
                {genreEmojis[event.genre] || '🎉'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top bar with logo and locate button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.logo}>FIESTAPP</Text>
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (location) mapRef.current?.animateToRegion(location, 500);
          }}
        >
          <Ionicons name="locate" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Genre filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.genreBar, { top: insets.top + 56 }]}
        contentContainerStyle={styles.genreContent}
      >
        <TouchableOpacity
          style={[styles.genreChip, !selectedGenre && styles.genreChipActive]}
          onPress={() => { setSelectedGenre(null); Haptics.selectionAsync(); }}
        >
          <Text style={[styles.genreText, !selectedGenre && styles.genreTextActive]}>
            🎉 Todos
          </Text>
        </TouchableOpacity>
        {genres.map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.genreChip, selectedGenre === g && styles.genreChipActive]}
            onPress={() => { setSelectedGenre(g === selectedGenre ? null : g); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.genreText, selectedGenre === g && styles.genreTextActive]}>
              {genreEmojis[g] || '🎵'} {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom event cards carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.cardStrip}
        contentContainerStyle={styles.cardStripContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {events.map((event, i) => (
          <TouchableOpacity
            key={event.id}
            style={[styles.eventCard, selectedEvent?.id === event.id && styles.eventCardActive]}
            onPress={() => router.push(`/event/${event.id}`)}
            onLongPress={() => onMarkerPress(event, i)}
            activeOpacity={0.85}
          >
            {event.imageUrl && (
              <Image source={{ uri: event.imageUrl }} style={styles.cardImage} />
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={[styles.genreBadge, { backgroundColor: (colors.genres[event.genre] || colors.accent) + '22' }]}>
                  <Text style={[styles.genreBadgeText, { color: colors.genres[event.genre] || colors.accent }]}>
                    {event.genre}
                  </Text>
                </View>
                <Text style={styles.cardAttendees}>
                  {event.attendeeCount || 0} 🙋
                </Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.cardDate}>{formatDate(event.date)}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.cardVenue} numberOfLines={1}>
                  📍 {event.venue || event.address}
                </Text>
                <Text style={[styles.cardPrice, event.price === 0 && styles.cardPriceFree]}>
                  {formatPrice(event.price, event.currency)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.text2, marginTop: 12, fontSize: 14 },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    color: colors.accent, fontSize: 20, fontWeight: '800',
    letterSpacing: 2,
  },
  locateBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface + 'ee',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: colors.border,
  },

  // Genres
  genreBar: { position: 'absolute', left: 0, right: 0, maxHeight: 44 },
  genreContent: { paddingHorizontal: 16, gap: 8 },
  genreChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radii.full, backgroundColor: colors.surface + 'dd',
    borderWidth: 0.5, borderColor: colors.border,
  },
  genreChipActive: {
    backgroundColor: colors.accent, borderColor: colors.accent,
  },
  genreText: { color: colors.text2, fontSize: 12, fontWeight: '600' },
  genreTextActive: { color: colors.bg },

  // Markers
  marker: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  markerActive: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 3,
  },
  markerEmoji: { fontSize: 16 },

  // Cards
  cardStrip: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: 200,
  },
  cardStripContent: {
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    gap: 16,
  },
  eventCard: {
    width: CARD_WIDTH, borderRadius: radii.lg,
    backgroundColor: colors.surface + 'f5',
    overflow: 'hidden',
    borderWidth: 0.5, borderColor: colors.border,
  },
  eventCardActive: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  cardImage: {
    width: '100%', height: 80,
  },
  cardBody: {
    padding: 12,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  genreBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radii.full,
  },
  genreBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardAttendees: { fontSize: 11, color: colors.text2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardDate: { fontSize: 12, color: colors.accent, fontWeight: '600', marginBottom: 6 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardVenue: { fontSize: 11, color: colors.text2, flex: 1, marginRight: 8 },
  cardPrice: { fontSize: 13, fontWeight: '800', color: colors.text },
  cardPriceFree: { color: colors.accent },
});
