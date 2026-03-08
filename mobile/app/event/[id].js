import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Dimensions, Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getEvent, attendEvent, unattendEvent } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, radii } from '../../lib/theme';

const { width } = Dimensions.get('window');

const genreEmojis = {
  'Techno': '🎛️', 'House': '🏠', 'Reggaeton': '🔥', 'EDM': '⚡',
  'Salsa': '💃', 'Rock': '🎸', 'Hip Hop': '🎤', 'Pop': '🎵',
  'Latin': '🌴', 'Jazz': '🎷', 'Metal': '🤘', 'Indie': '🎹',
};

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvent(); }, [id]);

  const loadEvent = async () => {
    try {
      const res = await getEvent(id);
      setEvent(res.data);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (status) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      if (event.myStatus === status) {
        await unattendEvent(id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await attendEvent(id, status);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      loadEvent();
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar asistencia');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!event) return null;

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('es', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };
  const formatTime = (d) => {
    return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.heroImg} />
        ) : (
          <View style={[styles.heroImg, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 60 }}>{genreEmojis[event.genre] || '🎉'}</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Genre + Attendees */}
          <View style={styles.metaRow}>
            <View style={[styles.genrePill, { backgroundColor: (colors.genres[event.genre] || colors.accent) + '22' }]}>
              <Text style={[styles.genrePillText, { color: colors.genres[event.genre] || colors.accent }]}>
                {genreEmojis[event.genre]} {event.genre}
              </Text>
            </View>
            <Text style={styles.attendeeCount}>
              {event.attendeeCount} asistentes
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={18} color={colors.accent} />
              <View>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color={colors.accent} />
              <View>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>
                  {formatTime(event.date)}
                  {event.endDate && ` — ${formatTime(event.endDate)}`}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={18} color={colors.accent} />
              <View>
                <Text style={styles.infoLabel}>Precio</Text>
                <Text style={styles.infoValue}>
                  {event.price === 0 ? '🆓 GRATIS' : `$${event.price.toLocaleString()} ${event.currency}`}
                </Text>
              </View>
            </View>
            {event.minAge && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
                  <View>
                    <Text style={styles.infoLabel}>Edad mínima</Text>
                    <Text style={styles.infoValue}>{event.minAge}+</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Acerca del evento</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Artists */}
          {event.artists?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🎤 Artistas</Text>
              <View style={styles.artistList}>
                {event.artists.map((artist, i) => (
                  <View key={i} style={styles.artistChip}>
                    <Text style={styles.artistText}>{artist}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Friends going */}
          {event.friendsGoing?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>👥 Amigos que van</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {event.friendsGoing.map(friend => (
                  <TouchableOpacity key={friend.id} style={styles.friendItem} onPress={() => router.push(`/user/${friend.id}`)}>
                    <Image
                      source={{ uri: friend.avatar || `https://ui-avatars.com/api/?name=${friend.name}&background=1a1a1a&color=c8ff00` }}
                      style={styles.friendAvatar}
                    />
                    <Text style={styles.friendShortName} numberOfLines={1}>
                      {friend.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Venue map */}
          <Text style={styles.sectionTitle}>📍 Ubicación</Text>
          <Text style={styles.venueText}>{event.venue || event.address}</Text>
          <View style={styles.miniMap}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: event.lat,
                longitude: event.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: event.lat, longitude: event.lng }}>
                <View style={[styles.markerDot, { backgroundColor: colors.genres[event.genre] || colors.accent }]} />
              </Marker>
            </MapView>
          </View>

          {/* Organizer */}
          {event.organizer && (
            <TouchableOpacity style={styles.organizerCard} onPress={() => router.push(`/user/${event.organizer.id}`)}>
              <Image
                source={{ uri: event.organizer.avatar || `https://ui-avatars.com/api/?name=${event.organizer.name}&background=1a1a1a&color=c8ff00` }}
                style={styles.orgAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.orgLabel}>Organizador</Text>
                <Text style={styles.orgName}>{event.organizer.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text3} />
            </TouchableOpacity>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.attendBtn, event.myStatus === 'going' && styles.attendBtnActive]}
          onPress={() => handleAttend('going')}
        >
          <Ionicons name={event.myStatus === 'going' ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={event.myStatus === 'going' ? colors.bg : colors.accent} />
          <Text style={[styles.attendText, event.myStatus === 'going' && styles.attendTextActive]}>
            {event.myStatus === 'going' ? 'Asistiendo ✓' : 'Asistiré'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.interestedBtn, event.myStatus === 'interested' && styles.interestedBtnActive]}
          onPress={() => handleAttend('interested')}
        >
          <Ionicons name={event.myStatus === 'interested' ? 'heart' : 'heart-outline'} size={20} color={event.myStatus === 'interested' ? colors.interested : colors.text2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  backBtn: {
    position: 'absolute', left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface + 'dd', justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: colors.border,
  },
  heroImg: { width, height: 280 },
  heroPlaceholder: {
    backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: 20 },
  metaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  genrePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  genrePillText: { fontSize: 12, fontWeight: '700' },
  attendeeCount: { fontSize: 13, color: colors.text2 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 16, lineHeight: 32 },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: 16,
    borderWidth: 0.5, borderColor: colors.border, marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  infoLabel: { fontSize: 11, color: colors.text3, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500', marginTop: 2 },
  infoDivider: { height: 0.5, backgroundColor: colors.border, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 10, marginTop: 8 },
  description: { fontSize: 14, color: colors.text2, lineHeight: 22, marginBottom: 20 },
  artistList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  artistChip: {
    backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: radii.full, borderWidth: 0.5, borderColor: colors.border,
  },
  artistText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  friendItem: { alignItems: 'center', marginRight: 16, marginBottom: 16 },
  friendAvatar: { width: 50, height: 50, borderRadius: 25, marginBottom: 6 },
  friendShortName: { fontSize: 11, color: colors.text2, maxWidth: 60 },
  venueText: { fontSize: 14, color: colors.text2, marginBottom: 12 },
  miniMap: {
    height: 160, borderRadius: radii.lg, overflow: 'hidden',
    marginBottom: 20, borderWidth: 0.5, borderColor: colors.border,
  },
  markerDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: '#fff' },
  organizerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: 14,
    borderWidth: 0.5, borderColor: colors.border, marginTop: 8,
  },
  orgAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  orgLabel: { fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: 1 },
  orgName: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16, gap: 12,
    backgroundColor: colors.bg + 'f0',
    borderTopWidth: 0.5, borderTopColor: colors.border,
  },
  attendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: radii.lg,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent,
  },
  attendBtnActive: { backgroundColor: colors.accent },
  attendText: { fontSize: 16, fontWeight: '700', color: colors.accent },
  attendTextActive: { color: colors.bg },
  interestedBtn: {
    width: 54, alignItems: 'center', justifyContent: 'center',
    borderRadius: radii.lg, backgroundColor: colors.surface,
    borderWidth: 0.5, borderColor: colors.border,
  },
  interestedBtnActive: { borderColor: colors.interested, backgroundColor: colors.interested + '22' },
});
