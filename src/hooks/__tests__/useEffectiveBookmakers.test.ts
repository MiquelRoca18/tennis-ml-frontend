import { renderHook } from '@testing-library/react-native';
import { useEffectiveBookmakers } from '../useEffectiveBookmakers';
import { useBookmakerPrefs } from '../useBookmakerPrefs';

jest.mock('../useBookmakerPrefs', () => ({ useBookmakerPrefs: jest.fn() }));

const mockPrefs = useBookmakerPrefs as jest.MockedFunction<typeof useBookmakerPrefs>;

function withSelection(bookmakers: Set<string>) {
  mockPrefs.mockReturnValue({ bookmakers, loaded: true, toggle: jest.fn(), clear: jest.fn() });
}

it('usa la selección del usuario cuando tiene alguna casa', () => {
  // Aunque Pinnacle no sea accesible desde España: si el usuario dice que apuesta ahí, manda.
  withSelection(new Set(['Pncl']));

  const { result } = renderHook(() => useEffectiveBookmakers());

  expect(result.current.has('Pncl')).toBe(true);
  expect(result.current.has('bet365')).toBe(false);
});

it('cae a las casas del país cuando el usuario no tiene ninguna', () => {
  withSelection(new Set());

  const { result } = renderHook(() => useEffectiveBookmakers());

  expect(result.current.has('bet365')).toBe(true);
  expect(result.current.has('Pncl')).toBe(false);
});
