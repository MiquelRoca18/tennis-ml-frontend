import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { COLORS } from '../../src/utils/constants';

interface AuthInputProps extends TextInputProps {
  error?: boolean;
}

export default function AuthInput({ error, style, ...props }: AuthInputProps) {
  return (
    <TextInput
      style={[styles.input, error && styles.inputError, style]}
      placeholderTextColor={COLORS.textMuted}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
});
