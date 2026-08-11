import { renderHook } from '@testing-library/react-native';
import { useUserCountry } from '../useUserCountry';

it('devuelve España mientras no haya perfil multi-país', () => {
  const { result } = renderHook(() => useUserCountry());
  expect(result.current).toBe('ES');
});
