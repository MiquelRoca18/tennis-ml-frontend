/**
 * RegisterBetModal - Formulario para registrar apuesta con casa, cuota y cantidad
 * Se abre al pulsar "Registrar apuesta" en el tab Predicción.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { addBet, type BetInput } from '../../src/services/betsService';
import { fetchMatchOddsDetailed, type DetailedOddsResponse } from '../../src/services/api/matchDetailService';
import { COLORS } from '../../src/utils/constants';

/** Índice de la casa con mayor cuota para el jugador recomendado */
function indexOfBestOddsForPlayer(
  bookmakers: { bookmaker: string; player1_odds: number | null; player2_odds: number | null }[],
  recommendedPlayerSide: 1 | 2
): number {
  let bestIndex = 0;
  let bestOdds = 0;
  bookmakers.forEach((bm, index) => {
    const o = recommendedPlayerSide === 1 ? bm.player1_odds : bm.player2_odds;
    const num = o != null && o >= 1 ? o : 0;
    if (num > bestOdds) {
      bestOdds = num;
      bestIndex = index;
    }
  });
  return bestIndex;
}

export interface RegisterBetModalProps {
  visible: boolean;
  onClose: () => void;
  /** Tras registrar con éxito (refrescar bankroll, etc.) */
  onSuccess?: () => void;
  matchId: number;
  player1Name: string;
  player2Name: string;
  /** Jugador recomendado por la predicción (1 o 2) */
  recommendedPlayerSide: 1 | 2;
  suggestedStakeEur: number;
  bankrollEur: number;
  tournament: string;
}

export default function RegisterBetModal({
  visible,
  onClose,
  onSuccess,
  matchId,
  player1Name,
  player2Name,
  recommendedPlayerSide,
  suggestedStakeEur,
  bankrollEur,
  tournament,
}: RegisterBetModalProps) {
  const { user } = useAuth();
  const [oddsData, setOddsData] = useState<DetailedOddsResponse | null>(null);
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [oddsError, setOddsError] = useState<string | null>(null);

  const [selectedBookmakerIndex, setSelectedBookmakerIndex] = useState(0);
  const [oddsInput, setOddsInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const dropdownTriggerRef = useRef<View>(null);

  const recommendedName = recommendedPlayerSide === 1 ? player1Name : player2Name;
  const bookmakers = oddsData?.bookmakers ?? [];

  const selectedBookmaker = bookmakers[selectedBookmakerIndex];
  const defaultOddsForSelected =
    selectedBookmaker &&
    (recommendedPlayerSide === 1 ? selectedBookmaker.player1_odds : selectedBookmaker.player2_odds);

  // Cargar cuotas al abrir el modal; por defecto la casa con mayor cuota para el jugador recomendado
  useEffect(() => {
    if (!visible || !matchId) return;
    setOddsError(null);
    setLoadingOdds(true);
    fetchMatchOddsDetailed(matchId)
      .then((data) => {
        setOddsData(data);
        if (data.bookmakers?.length) {
          const bestIndex = indexOfBestOddsForPlayer(data.bookmakers, recommendedPlayerSide);
          setSelectedBookmakerIndex(bestIndex);
          const best = data.bookmakers[bestIndex];
          const odds = recommendedPlayerSide === 1 ? best.player1_odds : best.player2_odds;
          setOddsInput(odds != null && odds >= 1 ? odds.toFixed(2) : '');
        }
        setAmountInput(suggestedStakeEur > 0 ? suggestedStakeEur.toFixed(2) : '');
      })
      .catch(() => setOddsError('No se pudieron cargar las cuotas'))
      .finally(() => setLoadingOdds(false));
  }, [visible, matchId, recommendedPlayerSide, suggestedStakeEur]);

  // Cuando cambia la casa seleccionada, actualizar cuota por defecto si el input está vacío o coincide con la anterior por defecto
  useEffect(() => {
    if (defaultOddsForSelected != null && defaultOddsForSelected >= 1) {
      const str = defaultOddsForSelected.toFixed(2);
      setOddsInput((prev) => (prev === '' || prev === defaultOddsForSelected.toFixed(2) ? str : prev));
    }
  }, [selectedBookmakerIndex, defaultOddsForSelected]);

  const handleSelectBookmaker = useCallback((index: number) => {
    setSelectedBookmakerIndex(index);
    setDropdownOpen(false);
    setDropdownPosition(null);
    const bm = bookmakers[index];
    if (bm) {
      const odds = recommendedPlayerSide === 1 ? bm.player1_odds : bm.player2_odds;
      if (odds != null && odds >= 1) setOddsInput(odds.toFixed(2));
    }
  }, [bookmakers, recommendedPlayerSide]);

  const openDropdown = useCallback(() => {
    setDropdownOpen(true);
    requestAnimationFrame(() => {
      dropdownTriggerRef.current?.measureInWindow((x, y, width, height) => {
        setDropdownPosition({ top: y + height, left: x, width });
      });
    });
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
    setDropdownPosition(null);
  }, []);

  const amount = parseFloat(amountInput) || 0;
  const odds = parseFloat(oddsInput) || 0;
  const potentialWin = amount * odds;

  const handleSubmit = useCallback(async () => {
    if (amount <= 0) {
      Alert.alert('Error', 'Introduce una cantidad válida.');
      return;
    }
    if (amount > bankrollEur) {
      Alert.alert('Error', `Bankroll insuficiente (tienes ${bankrollEur.toFixed(0)}€).`);
      return;
    }
    if (odds < 1) {
      Alert.alert('Error', 'La cuota debe ser al menos 1.00.');
      return;
    }
    if (!selectedBookmaker?.bookmaker) {
      Alert.alert('Error', 'Selecciona una casa de apuestas.');
      return;
    }

    Alert.alert(
      'Registrar apuesta',
      `¿Registrar apuesta de ${amount.toFixed(2)}€ a ${recommendedName} @ ${odds.toFixed(2)} en ${selectedBookmaker.bookmaker}?\nSe restará del bankroll (${bankrollEur.toFixed(0)}€ → ${(bankrollEur - amount).toFixed(0)}€).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apostar',
          onPress: async () => {
            setSubmitting(true);
            try {
              const input: BetInput = {
                matchId,
                stakeEur: amount,
                player1Name,
                player2Name,
                tournament,
                bookmaker: selectedBookmaker.bookmaker,
                odds,
                pickedPlayer: recommendedName,
                potentialWin,
                status: 'activa',
              };
              const result = await addBet(input, user?.id);
              if (!result.success) {
                Alert.alert('Error', result.error ?? 'No se pudo registrar la apuesta');
                return;
              }
              onSuccess?.();
              onClose();
              Alert.alert(
                'Apuesta registrada',
                result.bankrollAfter != null
                  ? `Bankroll actualizado: ${result.bankrollAfter.toFixed(0)}€`
                  : 'Apuesta guardada.'
              );
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo registrar la apuesta');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  }, [
    amount,
    bankrollEur,
    odds,
    selectedBookmaker,
    recommendedName,
    matchId,
    player1Name,
    player2Name,
    tournament,
    potentialWin,
    user?.id,
    onSuccess,
    onClose,
  ]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar apuesta</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loadingOdds ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Cargando cuotas...</Text>
            </View>
          ) : oddsError || bookmakers.length === 0 ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{oddsError || 'No hay cuotas para este partido'}</Text>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Casa de apuestas</Text>
              <View ref={dropdownTriggerRef} collapsable={false}>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={openDropdown}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText} numberOfLines={1}>
                    {selectedBookmaker?.bookmaker ?? 'Seleccionar'}
                  </Text>
                  <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Cuota (editable)</Text>
              <TextInput
                style={styles.input}
                value={oddsInput}
                onChangeText={setOddsInput}
                placeholder="Ej. 2.50"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Cantidad (€)</Text>
              <TextInput
                style={styles.input}
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder={`Sugerido: ${suggestedStakeEur.toFixed(2)}€`}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
              />

              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>Apostando a</Text>
                <Text style={styles.summaryPlayer}>{recommendedName}</Text>
                <Text style={styles.summaryPotential}>
                  Ganancia potencial: <Text style={styles.summaryPotentialValue}>{potentialWin.toFixed(2)}€</Text>
                </Text>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Apostar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {dropdownOpen && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeDropdown}
          />
        )}
        {dropdownOpen && dropdownPosition && (
          <View
            style={[
              styles.dropdownListOverlay,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            <ScrollView
              style={styles.dropdownListScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {bookmakers.map((bm, index) => (
                <TouchableOpacity
                  key={bm.bookmaker}
                  style={[styles.dropdownItem, index === selectedBookmakerIndex && styles.dropdownItemSelected]}
                  onPress={() => handleSelectBookmaker(index)}
                >
                  <Text style={styles.dropdownItemText} numberOfLines={1}>
                    {bm.bookmaker}
                  </Text>
                  <Text style={styles.dropdownItemOdds}>
                    {recommendedPlayerSide === 1
                      ? (bm.player1_odds?.toFixed(2) ?? '-')
                      : (bm.player2_odds?.toFixed(2) ?? '-')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorBlock: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  dropdownListOverlay: {
    position: 'absolute',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    maxHeight: 240,
    zIndex: 1000,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownListScroll: {
    maxHeight: 240,
  },
  dropdownList: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    flex: 1,
  },
  dropdownItemOdds: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  summary: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryPlayer: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  summaryPotential: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryPotentialValue: {
    fontWeight: '800',
    color: COLORS.success,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
