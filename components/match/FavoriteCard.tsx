import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Favorite } from '../../src/services/favoritesService';
import { COLORS } from '../../src/utils/constants';

interface FavoriteCardProps {
  favorite: Favorite;
}

export default function FavoriteCard({ favorite }: FavoriteCardProps) {
  const router = useRouter();
  const { matchId, player1Name, player2Name, tournament } = favorite;

  const handlePress = () => {
    router.push({
      pathname: '/match/[id]' as any,
      params: {
        id: matchId.toString(),
        match: JSON.stringify({
          id: matchId,
          torneo: tournament || 'Partido',
          jugador1: { nombre: player1Name },
          jugador2: { nombre: player2Name },
        }),
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.players} numberOfLines={2}>
          {player1Name} vs {player2Name}
        </Text>
        {tournament ? (
          <Text style={styles.tournament} numberOfLines={1}>
            {tournament}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  players: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tournament: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginLeft: 8,
  },
});
