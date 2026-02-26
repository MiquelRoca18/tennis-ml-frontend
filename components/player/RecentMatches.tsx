import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerMatch } from '../../src/types/api';
import { COLORS } from '../../src/utils/constants';
import { formatMatchStatus } from '../../src/utils/formatters';
import { parseLocalDate } from '../../src/utils/dateUtils';

interface RecentMatchesProps {
    matches: PlayerMatch[];
    playerName: string;
    playerLogo?: string | null;
}

interface MatchRowProps {
    match: PlayerMatch;
    playerName: string;
    isAlternate?: boolean;
    isLastInGroup?: boolean;
}

/** Un set parseado */
interface ParsedSet {
    my: number;
    opp: number;
    tbMy?: number;
    tbOpp?: number;
}

/** Formato corto tipo "Alcaraz C." (apellido + inicial) */
function shortName(fullName: string): string {
    const s = (fullName || '').trim();
    if (!s) return '—';
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        const initial = parts[0].charAt(0).toUpperCase();
        return `${last} ${initial}.`;
    }
    return s;
}

/** Fecha corta "21.02." */
function formatMatchDate(fecha: string): string {
    try {
        const d = parseLocalDate(fecha.slice(0, 10));
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}.`;
    } catch {
        return '';
    }
}

function getOpponentName(match: PlayerMatch, playerName: string): string {
    if (match.opponent_name != null && match.opponent_name !== '') return match.opponent_name;
    const j1 = (match.jugador1_nombre || '').trim();
    const j2 = (match.jugador2_nombre || '').trim();
    const p = (playerName || '').trim();
    if (!p) return j2 || j1;
    if (samePlayer(p, j1)) return j2;
    if (samePlayer(p, j2)) return j1;
    return j1 === p ? j2 : j1;
}

function samePlayer(a: string, b: string): boolean {
    if (a === b) return true;
    const al = a.toLowerCase();
    const bl = b.toLowerCase();
    const aLast = al.split(/\s+/).pop() || '';
    const bLast = bl.split(/\s+/).pop() || '';
    return al === bl || aLast === bLast || al.includes(bl) || bl.includes(al);
}

function parseSetPart(part: string, profileIsFirst: boolean): ParsedSet | null {
    const trimmed = part.trim();
    const withTb = /^(\d+)-(\d+)\((\d+)-(\d+)\)$/.exec(trimmed);
    const main = /^(\d+)-(\d+)$/.exec(trimmed);
    if (withTb) {
        const p1 = parseInt(withTb[1], 10);
        const p2 = parseInt(withTb[2], 10);
        const tb1 = parseInt(withTb[3], 10);
        const tb2 = parseInt(withTb[4], 10);
        if (profileIsFirst) return { my: p1, opp: p2, tbMy: tb1, tbOpp: tb2 };
        return { my: p2, opp: p1, tbMy: tb2, tbOpp: tb1 };
    }
    if (main) {
        const p1 = parseInt(main[1], 10);
        const p2 = parseInt(main[2], 10);
        if (profileIsFirst) return { my: p1, opp: p2 };
        return { my: p2, opp: p1 };
    }
    return null;
}

function parseScore(score: string, profileIsFirst: boolean): ParsedSet[] {
    if (!score || !score.trim()) return [];
    const parts = score.split(',').map(p => p.trim()).filter(Boolean);
    const sets: ParsedSet[] = [];
    for (const part of parts) {
        const s = parseSetPart(part, profileIsFirst);
        if (s) sets.push(s);
    }
    return sets;
}

/**
 * Si el marcador es solo "X-Y" con X,Y <= 3 (ej. "3-0", "2-1"), es resultado en SETS sin detalle de juegos.
 * No interpretarlo como un set con X-Y juegos.
 */
function parseSetsOnly(score: string, profileIsFirst: boolean): { my: number; opp: number } | null {
    const raw = (score || '').trim();
    if (!raw || raw.includes(',')) return null;
    const m = /^(\d+)-(\d+)$/.exec(raw);
    if (!m) return null;
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (a > 3 || b > 3) return null;
    if (profileIsFirst) return { my: a, opp: b };
    return { my: b, opp: a };
}

const SUPERSCRIPT = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
function superscriptDigit(n: number): string {
    if (n < 0) return String(n);
    return String(n).split('').map(c => {
        const d = parseInt(c, 10);
        return Number.isNaN(d) ? c : SUPERSCRIPT[d];
    }).join('');
}

function MatchRow({ match, playerName, isAlternate, isLastInGroup }: MatchRowProps) {
    const opponent = getOpponentName(match, playerName);
    const profileIsFirst = match.profile_is_jugador1 ?? (opponent === (match.jugador2_nombre || '').trim());
    const hasScore = Boolean(match.resultado_marcador?.trim());
    const rawMarcador = (match.resultado_marcador || '').trim();
    const setsOnly = hasScore ? parseSetsOnly(rawMarcador, profileIsFirst) : null;
    const parsedSets = hasScore ? parseScore(match.resultado_marcador!, profileIsFirst) : [];
    const sets = setsOnly && parsedSets.length === 1 && parsedSets[0].my <= 3 && parsedSets[0].opp <= 3
        ? []
        : parsedSets;
    const scoreUnknown = sets.length === 0;
    const matchStatus = formatMatchStatus(match.estado);

    const profileSetsWon = setsOnly && sets.length === 0
        ? setsOnly.my
        : sets.filter(s => s.my > s.opp).length;
    const oppSetsWon = setsOnly && sets.length === 0
        ? setsOnly.opp
        : sets.filter(s => s.opp > s.my).length;
    const isWin = (sets.length > 0 || setsOnly)
        ? profileSetsWon > oppSetsWon
        : (match.is_win ?? samePlayer(match.resultado_ganador || '', playerName));

    const playerShort = shortName(playerName);
    const opponentShort = shortName(opponent);

    return (
        <View style={[styles.matchRow, isAlternate && styles.matchRowAlt, isLastInGroup && styles.matchRowLast]}>
            <View style={styles.dateCol}>
                <Text style={styles.dateText}>{formatMatchDate(match.fecha_partido)}</Text>
            </View>
            <View style={styles.playersCol}>
                <View style={styles.playerLine}>
                    <Text style={styles.playerNameBold} numberOfLines={1}>{playerShort}</Text>
                    <View style={styles.setsTotalWrap}>
                        <Text style={[styles.setsWon, !isWin && styles.setsWonLoss]}>
                            {scoreUnknown && !setsOnly ? '–' : profileSetsWon}
                        </Text>
                    </View>
                    <View style={styles.setScoresRow}>
                        {scoreUnknown ? (
                            <Text style={styles.scoreUnknown}>–</Text>
                        ) : (
                            sets.map((set, i) => (
                                <View key={i} style={styles.setCell}>
                                    {set.tbMy != null && set.tbOpp != null ? (
                                        <Text style={[styles.setNum, set.my > set.opp && styles.setNumWin]}>
                                            {set.my}{superscriptDigit(set.my > set.opp ? set.tbMy : set.tbOpp)}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.setNum, set.my > set.opp && styles.setNumWin]}>{set.my}</Text>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                </View>
                <View style={styles.playerLine}>
                    <Text style={styles.playerNameNormal} numberOfLines={1}>{opponentShort}</Text>
                    <View style={styles.setsTotalWrap}>
                        <Text style={[styles.setsWon, isWin && styles.setsWonLoss]}>
                            {scoreUnknown && !setsOnly ? '–' : oppSetsWon}
                        </Text>
                    </View>
                    <View style={styles.setScoresRow}>
                        {scoreUnknown ? (
                            <Text style={styles.scoreUnknown}>–</Text>
                        ) : (
                            sets.map((set, i) => (
                                <View key={i} style={styles.setCell}>
                                    {set.tbMy != null && set.tbOpp != null ? (
                                        <Text style={[styles.setNum, set.opp > set.my && styles.setNumWin]}>
                                            {set.opp}{superscriptDigit(set.opp > set.my ? set.tbOpp : set.tbMy)}
                                        </Text>
                                    ) : (
                                        <Text style={[styles.setNum, set.opp > set.my && styles.setNumWin]}>{set.opp}</Text>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </View>
            <View style={styles.resultCol}>
                {match.estado === 'completado' ? (
                    <View style={[styles.ganadoBadge, isWin ? styles.ganadoWin : styles.ganadoLoss]}>
                        <Text style={styles.ganadoText}>{isWin ? 'G' : 'P'}</Text>
                    </View>
                ) : (
                    <Text style={styles.statusText}>{matchStatus.text}</Text>
                )}
            </View>
        </View>
    );
}

export default function RecentMatches({ matches, playerName }: RecentMatchesProps) {
    if (!matches || matches.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Últimos partidos</Text>
                <Text style={styles.subtitle}>Individuales</Text>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay partidos recientes</Text>
                </View>
            </View>
        );
    }

    const byTournament = matches.reduce<Record<string, PlayerMatch[]>>((acc, m) => {
        const key = `${m.torneo}|${m.superficie || ''}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
    }, {});

    const surfaceLabel = (s: string) => {
        const lower = (s || '').toLowerCase();
        if (lower.includes('hard') || lower.includes('dura')) return 'dura';
        if (lower.includes('clay') || lower.includes('arcilla')) return 'arcilla';
        if (lower.includes('grass') || lower.includes('césped')) return 'césped';
        return s || '—';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Últimos partidos</Text>
            <Text style={styles.subtitle}>Individuales</Text>

            {Object.entries(byTournament).map(([key, groupMatches]) => {
                const first = groupMatches[0];
                const torneo = first?.torneo || '—';
                const superficie = surfaceLabel(first?.superficie || '');
                return (
                    <View key={key} style={styles.tournamentBlock}>
                        <View style={styles.tournamentHeader}>
                            <Text style={styles.tournamentTitle}>
                                ATP - INDIVIDUALES: {torneo}{superficie ? `, ${superficie}` : ''}
                            </Text>
                        </View>
                        {groupMatches.map((match, i) => (
                            <MatchRow
                                key={match.id}
                                match={match}
                                playerName={playerName}
                                isAlternate={i % 2 === 1}
                                isLastInGroup={i === groupMatches.length - 1}
                            />
                        ))}
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    tournamentBlock: {
        marginBottom: 12,
    },
    tournamentHeader: {
        backgroundColor: COLORS.background,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: COLORS.border,
    },
    tournamentTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: COLORS.background,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.border,
    },
    matchRowAlt: {
        backgroundColor: COLORS.surface,
    },
    matchRowLast: {
        borderBottomWidth: 1,
    },
    dateCol: {
        width: 44,
        marginRight: 6,
    },
    dateText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    playersCol: {
        flex: 1,
        minWidth: 0,
    },
    playerLine: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 2,
    },
    playerNameBold: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        flex: 1,
        minWidth: 0,
    },
    playerNameNormal: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textSecondary,
        flex: 1,
        minWidth: 0,
    },
    setsWon: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
        width: 14,
        textAlign: 'center',
    },
    setsWonLoss: {
        color: COLORS.textMuted,
        fontWeight: '600',
    },
    setsTotalWrap: {
        paddingRight: 8,
        marginRight: 4,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        justifyContent: 'center',
    },
    setScoresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    setCell: {
        minWidth: 20,
        alignItems: 'center',
    },
    scoreUnknown: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    setNum: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    setNumWin: {
        color: COLORS.primary,
    },
    resultCol: {
        marginLeft: 6,
    },
    ganadoBadge: {
        width: 22,
        height: 22,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ganadoWin: {
        backgroundColor: '#15803D',
    },
    ganadoLoss: {
        backgroundColor: COLORS.danger,
    },
    ganadoText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
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
