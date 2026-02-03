import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';
import type { MatchScores } from '../../src/types/api';

interface CompletedMatchScoreProps {
    marcador: string;
    player1Name: string;
    player2Name: string;
    isWinner1: boolean;
    playerIndex?: 1 | 2; // Optional: if provided, only render that player's row
    /** Scores estructurados del API; se usan si marcador está vacío o no se puede parsear */
    scores?: MatchScores | null;
    /** Si true, partido en directo: números con color distinto (en directo) */
    isLive?: boolean;
}

/** Regex: un set tipo "6-4", "7-6(3)" o "7-6(7-5)" (tiebreak con uno o dos números) */
const SET_SCORE_REG = /^\d+-\d+(\(\d+(?:-\d+)?\))?$/;

/** Parsea "7-5" → [7, 5], "3" → [7, 3] (ganador 7, perdedor 3). Devuelve puntos [ganador, perdedor]. */
function parseTiebreakPoints(tb: string): [number, number] {
    const trimmed = tb.trim();
    if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(s => parseInt(s.trim(), 10));
        return [a!, b!];
    }
    const n = parseInt(trimmed, 10);
    return Number.isNaN(n) ? [7, 0] : [7, n]; // convención: "3" = 7-3
}

/**
 * Muestra el resultado de un partido completado (juegos por set o solo sets).
 *
 * Fuente de datos (siempre la misma para todos los partidos):
 * - resultado.marcador: string del backend (ej. "6-4, 6-3, 4-6")
 * - resultado.scores: objeto del backend; el backend lo construye con:
 *   1) Tabla match_sets (juegos por set, todos los sets)
 *   2) Si no hay match_sets, parsea resultado_marcador (y event_final_result)
 * Así partidos normales y con retirada usan la misma variable; la diferencia
 * está en qué guarda el backend en resultado_marcador / match_sets.
 *
 * Acepta: "6-4, 7-5, 6-3" (juegos por set), "3-0" (solo sets), o scores.sets del API.
 */
export default function CompletedMatchScore({
    marcador,
    player1Name,
    player2Name,
    isWinner1,
    playerIndex,
    scores: scoresFromApi,
    isLive = false
}: CompletedMatchScoreProps) {

    /** Un set es "juegos reales" si tiene al menos un número >= 4 o tiebreak; si no, es ruido de resultado en sets (ej. 1-3). */
    const isRealGamesSet = (g1: number, g2: number, hasTb: boolean) => hasTb || Math.max(g1, g2) >= 4;

    const parseScore = (): { sets1: number; sets2: number; setScores: Array<{ g1: string; g2: string; tb1?: string; tb2?: string }>; setCountOnly?: boolean } | null => {
        // 0) En vivo con sets vacíos pero sets_result (ej. "0-0"): mostrar 0-0 en la card
        if (isLive && scoresFromApi && !scoresFromApi.sets?.length && scoresFromApi.sets_result) {
            const sr = String(scoresFromApi.sets_result).trim().replace(/\s+/g, '-');
            const m = sr.match(/^(\d+)-(\d+)$/);
            if (m) {
                const sets1 = parseInt(m[1], 10);
                const sets2 = parseInt(m[2], 10);
                return { sets1, sets2, setScores: [{ g1: String(sets1), g2: String(sets2) }] };
            }
        }
        // 1) Si hay scores del API: en vivo mostrar todos los sets (incl. 1-3); completado solo sets terminados
        // Solo contar sets COMPLETADOS para sets1/sets2 (no el set en curso, ej. 3-1)
        const isSetCompleted = (a: number, b: number) => {
            const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
            return hi >= 6 && (hi - lo >= 2 || lo >= 6);
        };
        if (scoresFromApi?.sets?.length) {
            let sets1 = 0, sets2 = 0;
            const raw = scoresFromApi.sets.map(s => {
                const g1 = s.player1_score, g2 = s.player2_score;
                if (isSetCompleted(g1, g2)) {
                    if (g1 > g2) sets1++; else if (g2 > g1) sets2++;
                }
                const tiebreak = s.tiebreak_score;
                const hasTb = Boolean(tiebreak);
                return { g1: String(g1), g2: String(g2), tb1: tiebreak && g1 > g2 ? tiebreak : undefined, tb2: tiebreak && g2 > g1 ? tiebreak : undefined, isReal: isRealGamesSet(g1, g2, hasTb) };
            });
            const setScores = (isLive ? raw : raw.filter(r => r.isReal)).map(({ g1, g2, tb1, tb2 }) => ({ g1, g2, tb1, tb2 }));
            if (setScores.length === 0) return null;
            // Preferir sets_result del backend (ej. "2 - 2") para el número de sets ganados, así coincide con la API
            const sr = scoresFromApi.sets_result;
            if (sr && typeof sr === 'string') {
                const m = sr.trim().replace(/\s+/g, '-').match(/^(\d+)-(\d+)$/);
                if (m) {
                    sets1 = parseInt(m[1], 10);
                    sets2 = parseInt(m[2], 10);
                    return { sets1, sets2, setScores };
                }
            }
            sets1 = 0;
            sets2 = 0;
            setScores.forEach(s => {
                const a = parseInt(s.g1), b = parseInt(s.g2);
                if (isSetCompleted(a, b)) {
                    if (a > b) sets1++; else if (b > a) sets2++;
                }
            });
            return { sets1, sets2, setScores };
        }

        if (!marcador) return null;

        const rawParts = marcador.split(',').map(p => p.trim());
        const parts = rawParts.map(p => p.replace(/\s+-\s+/g, '-')); // "4 - 6" -> "4-6"
        let sets1 = 0, sets2 = 0;
        let setScores: Array<{ g1: string; g2: string; tb1?: string; tb2?: string }> = [];

        // 2) Formato "6-4, 7-5, 6-3" o "6 - 4, 7 - 5": todas las partes son juegos por set (o ruido "1-3" de sets)
        const allLookLikeSetScores = parts.length >= 1 && parts.every(p => SET_SCORE_REG.test(p));
        if (allLookLikeSetScores) {
            const isSetCompletedLocal = (a: number, b: number) => {
                const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
                return hi >= 6 && (hi - lo >= 2 || lo >= 6);
            };
            for (const setStr of parts) {
                const tiebreakMatch = setStr.match(/(\d+)-(\d+)\(([^)]+)\)/);
                if (tiebreakMatch) {
                    const g1 = parseInt(tiebreakMatch[1]), g2 = parseInt(tiebreakMatch[2]), tb = tiebreakMatch[3];
                    if (g1 > g2) setScores.push({ g1: String(g1), g2: String(g2), tb1: tb });
                    else setScores.push({ g1: String(g1), g2: String(g2), tb2: tb });
                    if (isSetCompletedLocal(g1, g2)) { if (g1 > g2) sets1++; else sets2++; }
                } else {
                    const [g1, g2] = setStr.split('-').map(s => parseInt(s.trim(), 10));
                    setScores.push({ g1: String(g1), g2: String(g2) });
                    if (isSetCompletedLocal(g1, g2)) { if (g1 > g2) sets1++; else if (g2 > g1) sets2++; }
                }
            }
            // Quitar ruido "1-3" / "2-1": si hay sets con juegos reales (algún número >= 4), quedarnos solo esos
            const onlyRealGames = setScores.filter(s => {
                const a = parseInt(s.g1), b = parseInt(s.g2);
                return isRealGamesSet(a, b, Boolean(s.tb1 || s.tb2));
            });
            if (onlyRealGames.length > 0) {
                sets1 = 0; sets2 = 0;
                onlyRealGames.forEach(s => {
                    if (parseInt(s.g1) > parseInt(s.g2)) sets1++; else if (parseInt(s.g2) > parseInt(s.g1)) sets2++;
                });
                return { sets1, sets2, setScores: onlyRealGames };
            }
            // Solo resultado en sets (ej. "3-0" o "0-3"): un solo bloque y ambos <= 3
            if (setScores.length >= 1) {
                const a = parseInt(setScores[0].g1), b = parseInt(setScores[0].g2);
                if (a <= 3 && b <= 3 && !setScores[0].tb1 && !setScores[0].tb2) {
                    return { sets1: a, sets2: b, setScores: [], setCountOnly: true };
                }
            }
            return { sets1, sets2, setScores };
        }

        // 3) Formato "2-1, 6-4 3-6 7-6(3)"
        if (parts[0] && parts[0].includes('-')) {
            const setScoresParts = parts[0].split('-');
            sets1 = parseInt(setScoresParts[0]) || 0;
            sets2 = parseInt(setScoresParts[1]) || 0;
        }
        const gamesStr = parts.length > 1 ? parts[1] : parts[0];
        if (gamesStr) {
            const gameSets = gamesStr.split(' ').filter(s => s.includes('-'));
            setScores = gameSets.map(set => {
                const tiebreakMatch = set.match(/(\d+)-(\d+)\(([^)]+)\)/);
                if (tiebreakMatch) {
                    const g1 = tiebreakMatch[1], g2 = tiebreakMatch[2], tbScore = tiebreakMatch[3];
                    if (parseInt(g1) > parseInt(g2)) return { g1, g2, tb1: tbScore };
                    return { g1, g2, tb2: tbScore };
                }
                const [g1, g2] = set.split('-');
                return { g1: g1.trim(), g2: g2.trim() };
            });
        }

        return setScores.length ? { sets1, sets2, setScores } : null;
    };

    const score = parseScore();

    if (!score) {
        return (
            <View style={styles.rightInfo}>
                <Text style={styles.simpleScore}>{marcador}</Text>
            </View>
        );
    }

    // Mismo formato visual para todos: fila de celdas (como Musetti 6 6 vs Djokovic 4 3).
    // Si solo hay resultado en sets (0-3), usamos una sola celda por jugador con ese número.
    let { sets1, sets2, setScores } = score;
    if (score.setCountOnly && setScores.length === 0) {
        setScores = [{ g1: String(sets1), g2: String(sets2) }];
    }

    if (setScores.length === 0) {
        return (
            <View style={styles.rightInfo}>
                <Text style={styles.simpleScore}>{marcador}</Text>
            </View>
        );
    }

    // Card mode: misma fila de celdas para todos los partidos (juegos por set o solo sets)
    if (playerIndex) {
        const isPlayer1 = playerIndex === 1;

        return (
            <View style={styles.scoreRow}>
                {/* Solo juegos por set (sin columna "sets ganados") para que todas las cards se vean igual */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const g = isPlayer1 ? set.g1 : set.g2;
                        const wonSet = isPlayer1
                            ? parseInt(set.g1) > parseInt(set.g2)
                            : parseInt(set.g2) > parseInt(set.g1);
                        const tbStr = set.tb1 ?? set.tb2; // API envía un solo string por set: jugador1-jugador2
                        const tbSup = tbStr ? (isPlayer1 ? parseTiebreakPoints(tbStr)[0] : parseTiebreakPoints(tbStr)[1]) : null;

                        return (
                            <View key={idx} style={styles.gameCell}>
                                <View style={styles.gameWithSup}>
                                    <Text style={[
                                        styles.gameText,
                                        wonSet && !isLive && styles.wonGameText,
                                        isLive && styles.liveGameText
                                    ]}>
                                        {g}
                                    </Text>
                                    {tbSup != null && (
                                        <Text style={[
                                            styles.tiebreakSuperscript,
                                            wonSet && !isLive && styles.wonGameText,
                                            isLive && styles.liveGameText
                                        ]}>
                                            {tbSup}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }

    // Full match view - show both players
    return (
        <View style={styles.scoreContainer}>
            {/* Player 1 Score Row */}
            <View style={styles.scoreRow}>
                {/* Sets Won */}
                <View style={[styles.setsCell, isWinner1 && styles.winnerSetsCell]}>
                    <Text style={[styles.setsText, isWinner1 && styles.winnerSetsText]}>
                        {sets1}
                    </Text>
                </View>

                {/* Games per Set */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const wonSet = parseInt(set.g1) > parseInt(set.g2);
                        const tbStr = set.tb1 ?? set.tb2; // API: jugador1-jugador2
                        const tbSup = tbStr ? parseTiebreakPoints(tbStr)[0] : null;
                        return (
                            <View key={idx} style={styles.gameCell}>
                                <View style={styles.gameWithSup}>
                                    <Text style={[
                                        styles.gameText,
                                        wonSet && styles.wonGameText
                                    ]}>
                                        {set.g1}
                                    </Text>
                                    {tbSup != null && (
                                        <Text style={[styles.tiebreakSuperscript, wonSet && styles.wonGameText]}>
                                            {tbSup}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Player 2 Score Row */}
            <View style={styles.scoreRow}>
                {/* Sets Won */}
                <View style={[styles.setsCell, !isWinner1 && styles.winnerSetsCell]}>
                    <Text style={[styles.setsText, !isWinner1 && styles.winnerSetsText]}>
                        {sets2}
                    </Text>
                </View>

                {/* Games per Set */}
                <View style={styles.gamesContainer}>
                    {setScores.map((set, idx) => {
                        const wonSet = parseInt(set.g2) > parseInt(set.g1);
                        const tbStr = set.tb1 ?? set.tb2; // API: jugador1-jugador2
                        const tbSup = tbStr ? parseTiebreakPoints(tbStr)[1] : null;
                        return (
                            <View key={idx} style={styles.gameCell}>
                                <View style={styles.gameWithSup}>
                                    <Text style={[
                                        styles.gameText,
                                        wonSet && styles.wonGameText
                                    ]}>
                                        {set.g2}
                                    </Text>
                                    {tbSup != null && (
                                        <Text style={[styles.tiebreakSuperscript, wonSet && styles.wonGameText]}>
                                            {tbSup}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreContainer: {
        gap: 4,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    rightInfo: {
        alignItems: 'flex-end',
    },
    simpleScore: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    setsCell: {
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.border,
        borderRadius: 4,
        paddingHorizontal: 6,
    },
    winnerSetsCell: {
        backgroundColor: COLORS.success + '30',
    },
    setsText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'RobotoMono-Bold',
    },
    winnerSetsText: {
        color: COLORS.success,
    },
    gamesContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    gameCell: {
        minWidth: 20,
        alignItems: 'center',
    },
    gameWithSup: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    gameText: {
        fontSize: 12,
        fontWeight: '500',
        color: COLORS.textMuted,
        fontFamily: 'RobotoMono-Regular',
    },
    wonGameText: {
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    liveGameText: {
        color: COLORS.primary,
        fontWeight: '700',
    },
    tiebreakSuperscript: {
        fontSize: 7,
        fontWeight: '600',
        color: COLORS.textMuted,
        marginLeft: 0,
        marginTop: -6,
        lineHeight: 8,
        fontFamily: 'RobotoMono-Regular',
    },
});
