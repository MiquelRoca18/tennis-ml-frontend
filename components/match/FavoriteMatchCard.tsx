/**
 * FavoriteMatchCard - Muestra un favorito con el mismo estilo que MatchCard
 * Obtiene los datos completos del partido desde el backend para mostrar scores, estado, etc.
 */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { fetchMatchFull } from '../../src/services/api/matchDetailService';
import type { Favorite } from '../../src/services/favoritesService';
import type { Match } from '../../src/types/api';
import type { MatchFullResponse } from '../../src/types/matchDetail';
import { COLORS } from '../../src/utils/constants';
import MatchCard from './MatchCard';

interface FavoriteMatchCardProps {
  favorite: Favorite;
  onFavoriteRemoved?: () => void;
}

function mapFullResponseToMatch(data: MatchFullResponse): Match {
  const { match, player1, player2, winner, scores } = data;
  const estado = match.status as Match['estado'];
  const ganador = winner === 1 ? player1.name : winner === 2 ? player2.name : null;

  const setsForResult = scores?.sets?.map((s) => ({
    set_number: s.set_number,
    player1_score: s.player1_games,
    player2_score: s.player2_games,
    tiebreak_score: s.tiebreak_score ?? null,
  }));

  const marcador = scores?.sets
    ?.map((s) => {
      const base = `${s.player1_games}-${s.player2_games}`;
      return s.tiebreak_score ? `${base}(${s.tiebreak_score})` : base;
    })
    .join(', ');

  return {
    id: match.id,
    event_key: match.id.toString(),
    estado,
    is_live: match.status === 'en_juego',
    is_qualification: false,
    fecha_partido: match.date,
    hora_inicio: match.time ?? null,
    torneo: match.tournament,
    tournament_key: '',
    tournament_season: '',
    ronda: match.round ?? null,
    superficie: match.surface as Match['superficie'],
    jugador1: {
      nombre: player1.name,
      key: '',
      ranking: player1.ranking ?? null,
      cuota: 0,
      logo: player1.logo_url ?? '',
      ...(player1.country && { pais: player1.country }),
    },
    jugador2: {
      nombre: player2.name,
      key: '',
      ranking: player2.ranking ?? null,
      cuota: 0,
      logo: player2.logo_url ?? '',
      ...(player2.country && { pais: player2.country }),
    },
    cuotas_top3: { top3_player1: [], top3_player2: [] },
    prediccion: null,
    resultado: winner
      ? {
          ganador: ganador ?? undefined,
          marcador: marcador ?? undefined,
          scores: scores
            ? {
                sets_result: scores.sets_won ? `${scores.sets_won[0]}-${scores.sets_won[1]}` : undefined,
                sets: setsForResult ?? [],
              }
            : undefined,
        }
      : null,
    event_status: match.event_status ?? undefined,
  } as Match;
}

export default function FavoriteMatchCard({ favorite, onFavoriteRemoved }: FavoriteMatchCardProps) {
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMatchFull(favorite.matchId);
        if (!cancelled) {
          setMatch(mapFullResponseToMatch(data));
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setMatch(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [favorite.matchId]);

  const handlePress = () => {
    router.push({
      pathname: '/match/[id]' as any,
      params: {
        id: favorite.matchId.toString(),
        match: JSON.stringify(
          match ?? {
            id: favorite.matchId,
            torneo: favorite.tournament || 'Partido',
            jugador1: { nombre: favorite.player1Name },
            jugador2: { nombre: favorite.player2Name },
          }
        ),
      },
    });
  };

  if (loading) {
    return (
      <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !match) {
    const fallbackMatch = {
      id: favorite.matchId,
      event_key: '',
      estado: 'completado',
      is_live: false,
      is_qualification: false,
      fecha_partido: '',
      hora_inicio: null,
      torneo: favorite.tournament,
      tournament_key: '',
      tournament_season: '',
      ronda: null,
      superficie: 'Hard',
      jugador1: { nombre: favorite.player1Name, key: '', ranking: null, cuota: 0, logo: '' },
      jugador2: { nombre: favorite.player2Name, key: '', ranking: null, cuota: 0, logo: '' },
      cuotas_top3: { top3_player1: [], top3_player2: [] },
      prediccion: null,
      resultado: null,
    } as Match;
    return (
      <MatchCard
        match={fallbackMatch}
        onPress={handlePress}
        onFavoriteRemoved={onFavoriteRemoved}
      />
    );
  }

  return (
    <MatchCard
      match={match}
      onPress={handlePress}
      onFavoriteRemoved={onFavoriteRemoved}
    />
  );
}
