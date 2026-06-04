import React, { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * Diálogos cross-platform (confirmar / avisar) basados en promesas.
 *
 * - En MÓVIL (iOS/Android) usa `Alert.alert` nativo: misma experiencia de siempre.
 * - En WEB usa un modal propio estilizado, porque `Alert.alert` con botones NO funciona
 *   en react-native-web (los botones no disparan su acción → al pulsar no pasa nada).
 *
 * Uso:
 *   const { confirm, notify } = useDialog();
 *   if (await confirm({ title: '¿Cancelar?', destructive: true })) { ... }
 *   await notify('Error', 'Mensaje');
 */

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

type PendingDialog =
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'alert'; title: string; message?: string; okText?: string; resolve: () => void };

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (title: string, message?: string, okText?: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);
const IS_WEB = Platform.OS === 'web';

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    if (!IS_WEB) {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          options.title,
          options.message,
          [
            { text: options.cancelText ?? 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            {
              text: options.confirmText ?? 'Aceptar',
              style: options.destructive ? 'destructive' : 'default',
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true, onDismiss: () => resolve(false) }
        );
      });
    }
    return new Promise<boolean>((resolve) => {
      setPending({ kind: 'confirm', options, resolve });
    });
  }, []);

  const notify = useCallback((title: string, message?: string, okText?: string): Promise<void> => {
    if (!IS_WEB) {
      return new Promise<void>((resolve) => {
        Alert.alert(title, message, [{ text: okText ?? 'OK', onPress: () => resolve() }], {
          cancelable: true,
          onDismiss: () => resolve(),
        });
      });
    }
    return new Promise<void>((resolve) => {
      setPending({ kind: 'alert', title, message, okText, resolve });
    });
  }, []);

  // Resolvemos la promesa pendiente y cerramos. Las funciones leen `pending` del render
  // actual (el modal se re-renderiza cuando cambia), evitando closures obsoletas.
  const onCancel = () => {
    if (pending?.kind === 'confirm') pending.resolve(false);
    else if (pending?.kind === 'alert') pending.resolve();
    setPending(null);
  };
  const onConfirm = () => {
    if (pending?.kind === 'confirm') pending.resolve(true);
    else if (pending?.kind === 'alert') pending.resolve();
    setPending(null);
  };

  const isConfirm = pending?.kind === 'confirm';
  const title = isConfirm ? pending.options.title : pending?.title ?? '';
  const message = isConfirm ? pending?.options.message : pending?.message;
  const confirmText = isConfirm ? pending.options.confirmText ?? 'Aceptar' : pending?.okText ?? 'OK';
  const cancelText = isConfirm ? pending.options.cancelText ?? 'Cancelar' : '';
  const destructive = isConfirm ? !!pending.options.destructive : false;

  return (
    <DialogContext.Provider value={{ confirm, notify }}>
      {children}
      {IS_WEB && (
        <Modal visible={pending != null} transparent animationType="fade" onRequestClose={onCancel}>
          <View style={styles.overlay}>
            <View style={styles.card}>
              <Text style={styles.title}>{title}</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}
              <View style={styles.buttons}>
                {isConfirm && (
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel} activeOpacity={0.8}>
                    <Text style={styles.btnCancelText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.btn, destructive ? styles.btnDanger : styles.btnPrimary]}
                  onPress={onConfirm}
                  activeOpacity={0.8}
                >
                  <Text style={destructive ? styles.btnDangerText : styles.btnPrimaryText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog debe usarse dentro de <DialogProvider>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnCancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDanger: {
    backgroundColor: COLORS.danger,
  },
  btnDangerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
