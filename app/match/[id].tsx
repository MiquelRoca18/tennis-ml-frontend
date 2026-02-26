import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchDetailV2 } from '../../components/match/detail/v2';
import { COLORS } from '../../src/utils/constants';

export default function MatchDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [matchId, setMatchId] = useState<number | null>(null);
    const [matchTitle, setMatchTitle] = useState<string>('Partido');

    useEffect(() => {
        // ID puede venir de params.id (ej. desde perfil jugador → próximo partido) o de params.match
        const paramId = params.id as string | undefined;
        if (paramId != null && paramId !== '') {
            const id = parseInt(paramId, 10);
            if (Number.isFinite(id)) {
                setMatchId(id);
                setMatchTitle('Partido');
                return;
            }
        }
        if (params.match) {
            try {
                const matchData = JSON.parse(params.match as string);
                setMatchId(matchData.id);
                setMatchTitle(matchData.torneo || 'Detalle del Partido');
            } catch (e) {
                console.error('Error parsing match data:', e);
            }
        }
    }, [params.id, params.match]);

    return (
        <View style={styles.container}>
            {/* Configure header */}
            <Stack.Screen
                options={{
                    title: matchTitle,
                    headerShown: true,
                    headerBackTitle: 'Volver',
                    headerBackVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ marginLeft: 8, padding: 8 }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: COLORS.surface,
                    },
                    headerTintColor: COLORS.textPrimary,
                }}
            />

            {/* New Match Detail V2 Component */}
            {matchId && <MatchDetailV2 matchId={matchId} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
