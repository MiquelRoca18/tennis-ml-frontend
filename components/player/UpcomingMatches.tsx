import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlayerUpcomingMatch } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';

interface UpcomingMatchesProps {
    upcoming: PlayerUpcomingMatch[];
    playerName?: string;
}

/** Una sola línea: evita repetir torneo si round ya lo incluye (ej. "ATP Acapulco - Quarter-finals") */
function formatTournamentAndRound(tournament: string | undefined, round: string | undefined): string {
    const t = (tournament || '').trim();
    const r = (round || '').trim();
    if (!t && !r) return '—';
    if (!r) return t;
    if (!t) return r;
    if (r.toLowerCase().startsWith(t.toLowerCase()) || r.includes(t)) return r;
    return `${t} · ${r}`;
}

function UpcomingRow({ match }: { match: PlayerUpcomingMatch }) {
    const router = useRouter();
    const dateLabel = match.date
        ? new Date(match.date).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
          })
        : '—';
    const timeLabel = match.time || '';
    const canNavigate = match.match_id != null && Number.isFinite(match.match_id);

    const onPress = () => {
        if (canNavigate) {
            router.push({
                pathname: '/match/[id]' as any,
                params: { id: String(match.match_id) },
            });
        }
    };

    const content = (
        <>
            <View style={styles.dateTimeBadge}>
                <Text style={styles.date}>{dateLabel}</Text>
                {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
            </View>
            <View style={styles.info}>
                <Text style={styles.opponent} numberOfLines={1}>
                    vs {match.opponent_name || 'Rival por confirmar'}
                </Text>
                <Text style={styles.tournamentLine} numberOfLines={2}>
                    {formatTournamentAndRound(match.tournament_name, match.round)}
                </Text>
            </View>
            {canNavigate ? (
                <View style={styles.chevron}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
            ) : null}
        </>
    );

    if (canNavigate) {
        return (
            <TouchableOpacity
                style={styles.row}
                onPress={onPress}
                activeOpacity={0.7}
                accessibilityLabel="Ver detalle del partido"
                accessibilityRole="button"
            >
                {content}
            </TouchableOpacity>
        );
    }

    return <View style={styles.row}>{content}</View>;
}

export default function UpcomingMatches({ upcoming, playerName }: UpcomingMatchesProps) {
    if (!upcoming || upcoming.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Próximos partidos</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay próximos partidos</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Próximos partidos</Text>
            <View style={styles.list}>
                {upcoming.map((match, index) => (
                    <UpcomingRow key={match.event_key ?? index} match={match} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 14,
    },
    list: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        backgroundColor: COLORS.background,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateTimeBadge: {
        minWidth: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary + '18',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginRight: 14,
    },
    date: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.primary,
    },
    time: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    info: {
        flex: 1,
        gap: 2,
        minWidth: 0,
    },
    opponent: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    tournamentLine: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textSecondary,
    },
    chevron: {
        marginLeft: 8,
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
