/**
 * FavoriteTournamentSection - Sección desplegable por torneo para favoritos
 * Similar a TournamentSection pero para Favorite[]
 */
import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import type { Favorite } from '../../src/services/favoritesService';
import { COLORS } from '../../src/utils/constants';
import FavoriteMatchCard from './FavoriteMatchCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FavoriteTournamentSectionProps {
  tournamentName: string;
  surface?: string;
  favorites: Favorite[];
  initiallyExpanded?: boolean;
  onFavoriteRemoved?: () => void;
}

export default function FavoriteTournamentSection({
  tournamentName,
  surface,
  favorites,
  initiallyExpanded = true,
  onFavoriteRemoved,
}: FavoriteTournamentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
          <View style={styles.tournamentInfo}>
            <Text style={styles.tournamentName} numberOfLines={1}>
              {tournamentName}
            </Text>
            {surface ? (
              <Text style={styles.surface}>{surface}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{favorites.length}</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.matchesContainer}>
          {favorites.map((fav) => (
            <FavoriteMatchCard
              key={`${fav.matchId}-${fav.addedAt}`}
              favorite={fav}
              onFavoriteRemoved={onFavoriteRemoved}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 8,
    width: 16,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  surface: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  matchesContainer: {
    backgroundColor: 'transparent',
  },
});
