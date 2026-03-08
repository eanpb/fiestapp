import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getEvents, getGenres } from '../../lib/api';
import { colors, spacing, radii } from '../../lib/theme';

const genreEmojis = {
  'Techno': '🎛️', 'House': '🏠', 'Reggaeton': '🔥', 'EDM': '⚡',
  'Salsa': '💃', 'Rock': '🎸', 'Hip Hop': '🎤', 'Pop': '🎵',
  'Latin': '🌴', 'Jazz': '🎷', 'Metal': '🤘', 'Indie': '🎹',
};

export default function ExploreScreen() {
  const [events, setEvents] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadEvents(); }, [selectedGenre, search]);

  const loadData = async () => {
    try {
      const res = await getGenres();
      setGenres(res.data);
      await loadEvents();
    } catch (e) {}
  };

  const loadEvents = async () => {
    try {
      const params = {};
      if (selectedGenre) params.genre = selectedGenre;
      if (search.length >= 2) params.search = search;
      const res = await getEvents(params);
      setEvents(res.data);
    } catch (e) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${item.id}`)}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
          <Text style={{ fontSize: 40 }}>{genreEmojis[item.genre] || '🎉'}</Text>
        </View>
      )}
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ DESTACADO</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={[styles.genrePill, { backgroundColor: (colors.genres[item.genre] || colors.accent) + '22' }]}>
            <Text style={[styles.genrePillText, { color: colors.genres[item.genre] || colors.accent }]}>
              {item.genre}
            </Text>
          </View>
          <Text style={styles.attendees}>{item.attendeeCount || 0} asistentes</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDate}>
          📅 {formatDate(item.date)}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardVenue} numberOfLines={1}>📍 {item.venue || item.address}</Text>
          <Text style={[styles.cardPrice, item.price === 0 && { color: colors.accent }]}>
            {item.price === 0 ? 'GRATIS' : `$${item.price.toLocaleString()}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Explorar</Text>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.text3} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar eventos, artistas, lugares..."
          placeholderTextColor={colors.text3}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      {/* Genre chips */}
      <FlatList
        horizontal
        data={[null, ...genres]}
        keyExtractor={(item) => item || 'all'}
        showsHorizontalScrollIndicator={false}
        style={styles.genreList}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item: g }) => (
          <TouchableOpacity
            style={[styles.genreChip, (g === selectedGenre || (!g && !selectedGenre)) && styles.genreChipActive]}
            onPress={() => { setSelectedGenre(g); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.genreChipText, (g === selectedGenre || (!g && !selectedGenre)) && styles.genreChipTextActive]}>
              {g ? `${genreEmojis[g] || '🎵'} ${g}` : '🎉 Todos'}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />

      {/* Events list */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🎭</Text>
            <Text style={styles.emptyText}>No se encontraron eventos</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    fontSize: 28, fontWeight: '800', color: colors.text,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, padding: 12,
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 0.5, borderColor: colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1, marginLeft: 10, fontSize: 14, color: colors.text,
  },
  genreList: { maxHeight: 44, marginBottom: 12 },
  genreChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radii.full, backgroundColor: colors.surface,
    borderWidth: 0.5, borderColor: colors.border,
  },
  genreChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  genreChipText: { fontSize: 12, fontWeight: '600', color: colors.text2 },
  genreChipTextActive: { color: colors.bg },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    overflow: 'hidden', borderWidth: 0.5, borderColor: colors.border,
  },
  cardImg: { width: '100%', height: 160 },
  cardImgPlaceholder: {
    backgroundColor: colors.surface2, justifyContent: 'center', alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radii.full,
  },
  featuredText: { fontSize: 10, fontWeight: '800', color: colors.bg },
  cardBody: { padding: 16 },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  genrePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  genrePillText: { fontSize: 10, fontWeight: '700' },
  attendees: { fontSize: 11, color: colors.text3 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cardDate: { fontSize: 13, color: colors.accent, fontWeight: '600', marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardVenue: { fontSize: 12, color: colors.text2, flex: 1 },
  cardPrice: { fontSize: 15, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.text3, marginTop: 12, fontSize: 14 },
});
