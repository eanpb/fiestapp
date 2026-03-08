import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUser, sendFriendRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { colors, radii } from '../../lib/theme';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const { user: me } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    try {
      const res = await getUser(id);
      setProfile(res.data);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async () => {
    try {
      await sendFriendRequest(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅', 'Solicitud enviada');
      loadProfile();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Error');
    }
  };

  if (loading) {
    return <View style={[styles.center, { paddingTop: insets.top }]}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  if (!profile) return null;

  const isMe = me?.id === profile.id;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={{ uri: profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=1a1a1a&color=c8ff00&size=200` }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{profile._count?.attendances || 0}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{profile._count?.organizedEvents || 0}</Text>
              <Text style={styles.statLabel}>Organizados</Text>
            </View>
          </View>

          {!isMe && !profile.friendshipStatus && (
            <TouchableOpacity style={styles.addBtn} onPress={handleFriendRequest}>
              <Ionicons name="person-add" size={18} color={colors.bg} />
              <Text style={styles.addBtnText}>Agregar amigo</Text>
            </TouchableOpacity>
          )}
          {profile.friendshipStatus === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>⏳ Solicitud pendiente</Text>
            </View>
          )}
          {profile.friendshipStatus === 'accepted' && (
            <View style={styles.friendBadge}>
              <Text style={styles.friendBadgeText}>✅ Amigos</Text>
            </View>
          )}
        </View>

        {/* Upcoming events */}
        {profile.upcomingEvents?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Próximos eventos</Text>
            {profile.upcomingEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                {event.imageUrl && <Image source={{ uri: event.imageUrl }} style={styles.eventThumb} />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                    {event.venue && ` · ${event.venue}`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.text3} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!profile.isPublic && !profile.friendshipStatus && !isMe && (
          <View style={styles.privateBanner}>
            <Ionicons name="lock-closed" size={24} color={colors.text3} />
            <Text style={styles.privateText}>Este perfil es privado</Text>
            <Text style={styles.privateSub}>Envía solicitud de amistad para ver su actividad</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  backBtn: { padding: 16 },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: colors.accent, marginBottom: 14 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  username: { fontSize: 14, color: colors.text3, marginTop: 2 },
  bio: { fontSize: 14, color: colors.text2, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg,
    paddingVertical: 16, paddingHorizontal: 24,
    marginTop: 20, width: '100%',
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.text3, marginTop: 4 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: radii.full, marginTop: 16,
  },
  addBtnText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
  pendingBadge: {
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radii.full, marginTop: 16, borderWidth: 0.5, borderColor: colors.border,
  },
  pendingText: { color: colors.text2, fontSize: 13 },
  friendBadge: {
    backgroundColor: colors.accent + '22', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: radii.full, marginTop: 16,
  },
  friendBadgeText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  eventItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12,
    marginBottom: 8, borderWidth: 0.5, borderColor: colors.border,
  },
  eventThumb: { width: 48, height: 48, borderRadius: radii.md, marginRight: 12 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  eventDate: { fontSize: 12, color: colors.text3, marginTop: 2 },
  privateBanner: { alignItems: 'center', padding: 40, marginTop: 20 },
  privateText: { fontSize: 16, fontWeight: '600', color: colors.text2, marginTop: 12 },
  privateSub: { fontSize: 13, color: colors.text3, marginTop: 6, textAlign: 'center' },
});
