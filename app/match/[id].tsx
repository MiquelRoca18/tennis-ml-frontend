import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View
} from 'react-native';
import MatchHero from '../../components/match/detail/MatchHero';
import MatchTabs from '../../components/match/detail/MatchTabs';
import { fetchMatchAnalysis, fetchMatchDetails } from '../../src/services/api/matchService';
import { COLORS } from '../../src/utils/constants';

export default function MatchDetailScreen() {
    const params = useLocalSearchParams();
    const [match, setMatch] = useState<any>(null);
    const [matchDetails, setMatchDetails] = useState<any>(null);
    const [matchAnalysis, setMatchAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMatchData();
    }, [params.match]);

    const loadMatchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Parse match data from params
            const matchData = params.match ? JSON.parse(params.match as string) : null;

            if (!matchData) {
                setError('No hay datos del partido disponibles');
                setLoading(false);
                return;
            }

            setMatch(matchData);

            // Log complete match data for debugging
            console.log('🔍'.repeat(40));
            console.log('🎾 COMPLETE MATCH DATA - ID:', matchData.id);
            console.log('🔍'.repeat(40));
            console.log('\n📄 FULL JSON STRUCTURE:');
            console.log(JSON.stringify(matchData, null, 2));
            console.log('\n' + '🔍'.repeat(40));

            // Load additional data in parallel (only for completed/live matches)
            if (matchData.estado === 'completado' || matchData.estado === 'en_juego') {
                const [details, analysis] = await Promise.all([
                    fetchMatchDetails(matchData.id).catch(err => {
                        console.warn('Failed to load match details:', err);
                        return null;
                    }),
                    fetchMatchAnalysis(matchData.id).catch(err => {
                        console.warn('Failed to load match analysis:', err);
                        return null;
                    })
                ]);

                setMatchDetails(details);
                setMatchAnalysis(analysis);

                // Log loaded data
                if (details) {
                    console.log('✅ Match Details loaded');
                    console.log(JSON.stringify(details, null, 2));
                }
                if (analysis) {
                    console.log('✅ Match Analysis loaded');
                    console.log(JSON.stringify(analysis, null, 2));
                }
            }

            setLoading(false);
        } catch (err: any) {
            console.error('Error loading match data:', err);
            setError(err.message || 'Error al cargar los datos del partido');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Cargando...',
                        headerShown: true,
                        headerBackTitle: 'Volver',
                    }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Cargando partido...</Text>
                </View>
            </View>
        );
    }

    if (error || !match) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Error',
                        headerShown: true,
                        headerBackTitle: 'Volver',
                    }}
                />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{error || 'No hay datos del partido disponibles'}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Configure header */}
            <Stack.Screen
                options={{
                    title: match.torneo || 'Detalle del Partido',
                    headerShown: true,
                    headerBackTitle: 'Volver',
                }}
            />

            {/* Match Hero - Fixed Header */}
            <MatchHero match={match} matchDetails={matchDetails} />

            {/* Tabs - Sticky */}
            <View style={styles.tabsContainer}>
                <MatchTabs
                    match={match}
                    matchDetails={matchDetails}
                    matchAnalysis={matchAnalysis}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 16,
    },
    errorIcon: {
        fontSize: 64,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.danger,
        textAlign: 'center',
    },
    tabsContainer: {
        flex: 1,
    },
});
