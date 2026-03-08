import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../lib/auth';
import { colors, spacing, radii } from '../../lib/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión', style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logout();
        }
      }
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <View style={styles.authHero}>
          <Text style={styles.authLogo}>FIESTAPP</Text>
          <Text style={styles.authTitle}>Tu vida social, en un mapa 🗺️</Text>
          <Text style={styles.authSub}>
            Descubre fiestas, conecta con amigos y nunca te pierdas un evento.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Ionicons name="log-in-outline" size={20} color={colors.bg} />
          <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/auth/register')}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.text} />
          <Text style={styles.secondaryBtnText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.scrollContent}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=1a1a1a&color=c8ff00&size=200` }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user._count?.attendances || 0}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.friendCount || 0}</Text>
            <Text style={styles.statLabel}>Amigos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user._count?.organizedEvents || 0}</Text>
            <Text style={styles.statLabel}>Organizados</Text>
          </View>
        </View>

        <View style={styles.privacyRow}>
          <Ionicons
            name={user.isPublic ? 'globe-outline' : 'lock-closed-outline'}
            size={14}
            color={colors.text3}
          />
          <Text style={styles.privacyText}>
            Perfil {user.isPublic ? 'público' : 'privado'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem icon="create-outline" label="Editar perfil" onPress={() => router.push('/auth/edit-profile')} />
        <MenuItem icon="ticket-outline" label="Mis eventos" onPress={() => {}} />
        <MenuItem icon="people-outline" label="Solicitudes de amistad" onPress={() => router.push('/friends/requests')} />
        <MenuItem icon="settings-outline" label="Configuración" onPress={() => {}} />
        <MenuItem icon="shield-checkmark-outline" label="Privacidad" onPress={() => {}} />
        <MenuItem icon="information-circle-outline" label="Acerca de" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>FIESTAPP v2.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={colors.text2} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.text3} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  scrollContent: { paddingBottom: 100 },

  // Auth hero
  authHero: { alignItems: 'center', marginBottom: 40 },
  authLogo: { fontSize: 32, fontWeight: '900', color: colors.accent, letterSpacing: 4, marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
  authSub: { fontSize: 15, color: colors.text2, textAlign: 'center', lineHeight: 22 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.accent, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: radii.full, width: '100%', justifyContent: 'center', marginBottom: 12,
  },
  primaryBtnText: { color: colors.bg, fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: radii.full, width: '100%', justifyContent: 'center',
    borderWidth: 0.5, borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontWeight: '600', fontSize: 16 },

  // Profile
  profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
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
  statLabel: { fontSize: 11, color: colors.text3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  privacyText: { fontSize: 12, color: colors.text3 },

  // Menu
  menu: {
    marginHorizontal: 20, backgroundColor: colors.surface,
    borderRadius: radii.lg, overflow: 'hidden', marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  menuLabel: { flex: 1, marginLeft: 14, fontSize: 15, color: colors.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 20, padding: 16,
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 0.5, borderColor: 'rgba(255,68,68,0.2)',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.danger },
  version: { textAlign: 'center', fontSize: 11, color: colors.text3, marginTop: 20 },
});
