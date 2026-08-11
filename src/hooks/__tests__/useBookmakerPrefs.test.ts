import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useBookmakerPrefs } from '../useBookmakerPrefs';

// El mock oficial de AsyncStorage solo se distribuye en CommonJS, así que aquí toca require.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

it('precarga las casas del país en el primer arranque', async () => {
  const { result } = renderHook(() => useBookmakerPrefs());
  await waitFor(() => expect(result.current.loaded).toBe(true));

  expect(result.current.bookmakers.has('bet365')).toBe(true);
  expect(result.current.bookmakers.has('Pncl')).toBe(false);
});

it('respeta una lista vaciada a propósito y no vuelve a precargar', async () => {
  const first = renderHook(() => useBookmakerPrefs());
  await waitFor(() => expect(first.result.current.loaded).toBe(true));
  await act(async () => first.result.current.clear());
  await waitFor(() => expect(first.result.current.bookmakers.size).toBe(0));

  const second = renderHook(() => useBookmakerPrefs());
  await waitFor(() => expect(second.result.current.loaded).toBe(true));

  expect(second.result.current.bookmakers.size).toBe(0);
});

it('conserva la selección del usuario entre arranques', async () => {
  const first = renderHook(() => useBookmakerPrefs());
  await waitFor(() => expect(first.result.current.loaded).toBe(true));
  await act(async () => first.result.current.clear());
  await act(async () => first.result.current.toggle('Pncl'));
  await waitFor(() => expect(first.result.current.bookmakers.has('Pncl')).toBe(true));

  const second = renderHook(() => useBookmakerPrefs());
  await waitFor(() => expect(second.result.current.loaded).toBe(true));

  expect([...second.result.current.bookmakers]).toEqual(['Pncl']);
});
