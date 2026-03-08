import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../lib/auth';
import { getFeed, getFriends, searchUsers, sendFriendRequest } from '../../lib/api';
import { colors, spacing, radii } from '../../lib/theme';

export default function SocialScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('feed'); // feed, friends, search
  const [feed, setFeed] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      loadFeed();
      loadFriends();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => doSearch(), 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadFeed = async () => {
    try {
      const res = await getFeed();
      setFeed(res.data);
    } catch (e) {}
  };

  const loadFriends = async () => {
    try {
      const res = await getFriends();
      setFriends(res.data);
    } catch (e) {}
  };

  const doSearch = async () => {
    try {
      const res = await searchUsers(searchQuery);
      setSearchResults(res.data.filter(u => u.id !== user?.id));
    } catch (e) {}
  };

  const handleAddFriend = async (userId) => {
    try {
      await sendFriendRequest(userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅', 'Solicitud enviada');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Error al enviar solicitud');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(), loadFriends()]);
    setRefreshing(false);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48 }}>🔒</Text>
        <Text style={styles.noAuthTitle}>Inicia sesión</Text>
        <Text style={styles.noAuthSub}>
          Conecta con amigos y ve a qué eventos van
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginBtnText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderFeedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedCard}
      onPress={() => router.push(`/event/${item.event.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.user.avatar || `https://ui-avatars.com/api/?name=${item.user.name}&background=1a1a1a&color=c8ff00` }}
        style={styles.feedAvatar}
      />
      <View style={styles.feedBody}>
        <Text style={styles.feedText}>
          <Text style={styles.feedName}>{item.user.name}</Text>
          {' '}va a
        </Text>
        <Text style={styles.feedEvent} numberOfLines={1}>{item.event.title}</Text>
        <View style={styles.feedMeta}>
          <Text style={styles.feedDate}>
            📅 {new Date(item.event.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </Text>
          {item.event.venue && (
            <Text style={styles.feedVenue}>📍 {item.event.venue}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text3} />
    </TouchableOpacity>
  );

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => router.push(`/user/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=1a1a1a&color=c8ff00` }}
        style={styles.friendAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text3} />
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <View style={styles.friendCard}>
      <Image
        source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${item.name}&background=1a1a1a&color=c8ff00` }}
        style={styles.friendAvatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>@{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAddFriend(item.id)}
      >
        <Ionicons name="person-add" size={16} color={colors.bg} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Social</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['feed', 'friends', 'search'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'feed' ? '📰 Feed' : t === 'friends' ? `👥 Amigos (${friends.length})` : '🔍 Buscar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'search' && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.text3} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar personas..."
            placeholderTextColor={colors.text3}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      {tab === 'feed' && (
        <FlatList
          data={feed}
          keyExtractor={(item) => item.id}
          renderItem={renderFeedItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>👋</Text>
              <Text style={styles.emptyTitle}>Tu feed está vacío</Text>
              <Text style={styles.emptySub}>Agrega amigos para ver a qué eventos van</Text>
            </View>
          }
        />
      )}

      {tab === 'friends' && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>👥</Text>
              <Text style={styles.emptyTitle}>Sin amigos aún</Text>
              <Text style={styles.emptySub}>Busca personas y envíales solicitud</Text>
            </View>
          }
        />
      )}

      {tab === 'search' && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptySub}>No se encontraron resultados</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  header: {
    fontSize: 28, fontWeight: '800', color: colors.text,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
  },
  noAuthTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  noAuthSub: { fontSize: 14, color: colors.text2, textAlign: 'center', marginBottom: 24 },
  loginBtn: {
    backgroundColor: colors.accent, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: radii.full,
  },
  loginBtnText: { color: colors.bg, fontWeight: '700', fontSize: 16 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: colors.surface, borderRadius: radii.lg, padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radii.md,
  },
  tabActive: { backgroundColor: colors.surface2 },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.text3 },
  tabTextActive: { color: colors.text },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, padding: 12,
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 0.5, borderColor: colors.border, marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  // Feed
  feedCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: colors.border,
  },
  feedAvatar: { width: 42, height: 42, borderRadius: 21, marginRight: 12 },
  feedBody: { flex: 1 },
  feedText: { fontSize: 13, color: colors.text2 },
  feedName: { fontWeight: '700', color: colors.text },
  feedEvent: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  feedMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  feedDate: { fontSize: 11, color: colors.text3 },
  feedVenue: { fontSize: 11, color: colors.text3 },

  // Friends
  friendCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.lg,
    padding: 14, marginBottom: 10,
    borderWidth: 0.5, borderColor: colors.border,
  },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  friendName: { fontSize: 15, fontWeight: '600', color: colors.text },
  friendUsername: { fontSize: 12, color: colors.text3, marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center',
  },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 12 },
  emptySub: { fontSize: 13, color: colors.text3, marginTop: 4, textAlign: 'center' },
});
