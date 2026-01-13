import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ConfidenceBadge from '../../components/match/ConfidenceBadge';
import { COLORS, KELLY_FRACTION_DEFAULT } from '../../src/utils/constants';
import {
    formatCurrency,
    formatOdds,
    formatPercentage,
    formatProbability,
    formatTime,
} from '../../src/utils/formatters';

export default function MatchDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Parse match data from params
    const match = params.match ? JSON.parse(params.match as string) : null;

    // Kelly calculator state
    const [bankroll, setBankroll] = useState('1000');
    const [kellyFraction, setKellyFraction] = useState(KELLY_FRACTION_DEFAULT);

    if (!match || !match.prediccion) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No hay datos de predicción disponibles</Text>
            </View>
        );
    }

    const { jugador1, jugador2, prediccion, torneo, ronda, superficie, hora_inicio } = match;

    // Determine best bet
    const bestPlayer = prediccion.jugador1_ev > prediccion.jugador2_ev ? 1 : 2;
    const bestEV = Math.max(prediccion.jugador1_ev, prediccion.jugador2_ev);
    const bestProb = bestPlayer === 1 ? prediccion.jugador1_probabilidad : prediccion.jugador2_probabilidad;
    const bestOdds = bestPlayer === 1 ? jugador1.cuota : jugador2.cuota;
    const bestPlayerName = bestPlayer === 1 ? jugador1.nombre : jugador2.nombre;

    // Kelly calculation
    const calculateKelly = () => {
        const b = bankroll ? parseFloat(bankroll) : 0;
        if (b <= 0) return { stake: 0, profit: 0, loss: 0, expectedReturn: 0 };

        // Kelly formula: (p * odds - 1) / (odds - 1)
        const kellyPercent = (bestProb * bestOdds - 1) / (bestOdds - 1);
        const adjustedKelly = Math.max(0, kellyPercent * kellyFraction);
        const stake = b * adjustedKelly;

        const profit = stake * (bestOdds - 1);
        const loss = stake;
        const expectedReturn = stake * bestEV;

        return { stake, profit, loss, expectedReturn };
    };

    const kelly = calculateKelly();

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.tournament}>🎾 {torneo || 'Torneo'}</Text>
                <Text style={styles.subtitle}>
                    {ronda || 'Ronda'} • {superficie} • {formatTime(hora_inicio)}
                </Text>
            </View>

            {/* Hero Section - Players */}
            <View style={styles.heroSection}>
                <View style={styles.playerContainer}>
                    <Text style={styles.playerName}>{jugador1.nombre}</Text>
                    {jugador1.ranking && <Text style={styles.ranking}>[{jugador1.ranking}]</Text>}
                    <Text style={styles.probability}>{formatProbability(prediccion.jugador1_probabilidad)}</Text>
                    <Text style={styles.odds}>@{formatOdds(jugador1.cuota)}</Text>
                </View>

                <Text style={styles.vs}>VS</Text>

                <View style={styles.playerContainer}>
                    <Text style={styles.playerName}>{jugador2.nombre}</Text>
                    {jugador2.ranking && <Text style={styles.ranking}>[{jugador2.ranking}]</Text>}
                    <Text style={styles.probability}>{formatProbability(prediccion.jugador2_probabilidad)}</Text>
                    <Text style={styles.odds}>@{formatOdds(jugador2.cuota)}</Text>
                </View>
            </View>

            {/* Recommendation Card */}
            <View style={[styles.card, { backgroundColor: bestEV > 0.03 ? COLORS.success + '20' : COLORS.danger + '20' }]}>
                <Text style={styles.cardTitle}>📊 RECOMENDACIÓN</Text>
                <Text style={[styles.recommendation, { color: bestEV > 0.03 ? COLORS.success : COLORS.danger }]}>
                    {prediccion.recomendacion}
                </Text>
                {prediccion.mejor_opcion && (
                    <Text style={styles.bestOption}>
                        Mejor opción: {prediccion.mejor_opcion}
                    </Text>
                )}
            </View>

            {/* Prediction Details */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🎯 DETALLES DE LA PREDICCIÓN</Text>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Confianza del modelo:</Text>
                    <ConfidenceBadge confidence={prediccion.confianza} />
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expected Value ({jugador1.nombre}):</Text>
                    <Text style={[styles.detailValue, { color: prediccion.jugador1_ev > 0 ? COLORS.success : COLORS.danger }]}>
                        {formatPercentage(prediccion.jugador1_ev)}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expected Value ({jugador2.nombre}):</Text>
                    <Text style={[styles.detailValue, { color: prediccion.jugador2_ev > 0 ? COLORS.success : COLORS.danger }]}>
                        {formatPercentage(prediccion.jugador2_ev)}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Edge ({jugador1.nombre}):</Text>
                    <Text style={styles.detailValue}>{formatPercentage(prediccion.jugador1_edge)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Edge ({jugador2.nombre}):</Text>
                    <Text style={styles.detailValue}>{formatPercentage(prediccion.jugador2_edge)}</Text>
                </View>
            </View>

            {/* Kelly Calculator */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🎲 CALCULADORA DE KELLY</Text>

                <Text style={styles.inputLabel}>Tu bankroll actual:</Text>
                <TextInput
                    style={styles.input}
                    value={bankroll}
                    onChangeText={setBankroll}
                    keyboardType="numeric"
                    placeholder="1000"
                />

                <Text style={styles.inputLabel}>Fracción de Kelly:</Text>
                <View style={styles.kellyOptions}>
                    <TouchableOpacity
                        style={[styles.kellyButton, kellyFraction === 1 && styles.kellyButtonActive]}
                        onPress={() => setKellyFraction(1)}
                    >
                        <Text style={styles.kellyButtonText}>Full (100%)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.kellyButton, kellyFraction === 0.5 && styles.kellyButtonActive]}
                        onPress={() => setKellyFraction(0.5)}
                    >
                        <Text style={styles.kellyButtonText}>Half (50%)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.kellyButton, kellyFraction === 0.25 && styles.kellyButtonActive]}
                        onPress={() => setKellyFraction(0.25)}
                    >
                        <Text style={styles.kellyButtonText}>Quarter (25%)</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.kellyResults}>
                    <Text style={styles.kellyResultTitle}>📊 RECOMENDACIÓN:</Text>
                    <Text style={styles.kellyStake}>
                        Apostar: {formatCurrency(kelly.stake)} ({((kelly.stake / parseFloat(bankroll || '1')) * 100).toFixed(1)}% del bankroll)
                    </Text>
                    <Text style={styles.kellyDetail}>Si ganas: +{formatCurrency(kelly.profit)}</Text>
                    <Text style={styles.kellyDetail}>Si pierdes: -{formatCurrency(kelly.loss)}</Text>
                    <Text style={[styles.kellyDetail, { fontWeight: 'bold', marginTop: 8 }]}>
                        Retorno esperado: {formatCurrency(kelly.expectedReturn)}
                    </Text>
                </View>

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠️ El Kelly Criterion es una guía matemática. Siempre apuesta responsablemente.
                    </Text>
                </View>
            </View>

            {/* Educational Section */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>📚 ¿QUÉ SIGNIFICA ESTO?</Text>

                <Text style={styles.educationTitle}>Expected Value (EV)</Text>
                <Text style={styles.educationText}>
                    El EV es el retorno promedio que esperarías si hicieras esta apuesta 100 veces.
                    Un EV positivo significa que, a largo plazo, esta apuesta es rentable.
                </Text>

                <Text style={styles.educationTitle}>Kelly Criterion</Text>
                <Text style={styles.educationText}>
                    Fórmula matemática que calcula el tamaño óptimo de apuesta basado en tu ventaja
                    y bankroll. Usar una fracción (25%) es más conservador y reduce la varianza.
                </Text>

                <Text style={styles.educationTitle}>Confianza del Modelo</Text>
                <Text style={styles.educationText}>
                    Indica qué tan seguro está el modelo de su predicción. Mayor confianza =
                    mayor diferencia de probabilidad entre jugadores.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.surface,
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginBottom: 8,
    },
    backText: {
        color: COLORS.primary,
        fontSize: 16,
    },
    tournament: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    heroSection: {
        backgroundColor: COLORS.surface,
        padding: 20,
        marginBottom: 16,
    },
    playerContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    playerName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    ranking: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    probability: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 8,
    },
    odds: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    vs: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        paddingVertical: 8,
    },
    card: {
        backgroundColor: COLORS.surface,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    recommendation: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8,
    },
    bestOption: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    inputLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    kellyOptions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    kellyButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    kellyButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    kellyButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    kellyResults: {
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    kellyResultTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    kellyStake: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    kellyDetail: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    warningBox: {
        backgroundColor: COLORS.warning + '20',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    warningText: {
        fontSize: 12,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    educationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 12,
        marginBottom: 4,
    },
    educationText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    errorText: {
        fontSize: 16,
        color: COLORS.danger,
        textAlign: 'center',
        marginTop: 100,
    },
});
