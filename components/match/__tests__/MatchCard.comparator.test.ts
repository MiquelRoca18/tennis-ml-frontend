/**
 * Tests for the MatchCard React.memo custom comparator.
 *
 * The comparator is replicated here to test pure business logic without
 * importing React Native / Expo modules.
 */

type MatchLike = {
    id: number;
    estado: string;
    is_live: boolean;
    hora_inicio: string | null;
    fecha_partido: string;
    event_status?: string;
    resultado: object | null;
    prediccion: object | null;
};

type Props = {
    match: MatchLike;
    onPress: (match: MatchLike) => void;
    onFavoriteRemoved?: () => void;
};

// Replicated from MatchCard.tsx React.memo second argument
function arePropsEqual(prev: Props, next: Props): boolean {
    if (prev.onPress !== next.onPress) return false;
    if (prev.onFavoriteRemoved !== next.onFavoriteRemoved) return false;
    const a = prev.match;
    const b = next.match;
    return (
        a.id === b.id &&
        a.estado === b.estado &&
        a.is_live === b.is_live &&
        a.hora_inicio === b.hora_inicio &&
        a.fecha_partido === b.fecha_partido &&
        a.event_status === b.event_status &&
        JSON.stringify(a.resultado) === JSON.stringify(b.resultado) &&
        JSON.stringify(a.prediccion) === JSON.stringify(b.prediccion)
    );
}

// Base match factory
function makeMatch(overrides: Partial<MatchLike> = {}): MatchLike {
    return {
        id: 1,
        estado: 'pendiente',
        is_live: false,
        hora_inicio: '15:00',
        fecha_partido: '2026-04-15',
        event_status: undefined,
        resultado: null,
        prediccion: null,
        ...overrides,
    };
}

const noop = () => {};

describe('MatchCard arePropsEqual', () => {
    it('returns true when all fields are identical', () => {
        const match = makeMatch();
        expect(arePropsEqual(
            { match, onPress: noop },
            { match, onPress: noop },
        )).toBe(true);
    });

    it('returns false when estado changes', () => {
        const prev = makeMatch({ estado: 'pendiente' });
        const next = makeMatch({ estado: 'completado' });
        expect(arePropsEqual(
            { match: prev, onPress: noop },
            { match: next, onPress: noop },
        )).toBe(false);
    });

    it('returns false when is_live changes', () => {
        expect(arePropsEqual(
            { match: makeMatch({ is_live: false }), onPress: noop },
            { match: makeMatch({ is_live: true }), onPress: noop },
        )).toBe(false);
    });

    it('returns false when resultado changes', () => {
        const prev = makeMatch({ resultado: { marcador: '6-4' } });
        const next = makeMatch({ resultado: { marcador: '6-4, 7-5' } });
        expect(arePropsEqual(
            { match: prev, onPress: noop },
            { match: next, onPress: noop },
        )).toBe(false);
    });

    it('returns false when prediccion changes', () => {
        const prev = makeMatch({ prediccion: { jugador1_probabilidad: 0.6 } });
        const next = makeMatch({ prediccion: { jugador1_probabilidad: 0.7 } });
        expect(arePropsEqual(
            { match: prev, onPress: noop },
            { match: next, onPress: noop },
        )).toBe(false);
    });

    it('returns false when onPress reference changes', () => {
        const match = makeMatch();
        expect(arePropsEqual(
            { match, onPress: () => {} },
            { match, onPress: () => {} },
        )).toBe(false);
    });

    it('returns false when onFavoriteRemoved reference changes', () => {
        const match = makeMatch();
        expect(arePropsEqual(
            { match, onPress: noop, onFavoriteRemoved: () => {} },
            { match, onPress: noop, onFavoriteRemoved: () => {} },
        )).toBe(false);
    });

    it('returns true when onFavoriteRemoved is the same reference', () => {
        const match = makeMatch();
        const onFav = () => {};
        expect(arePropsEqual(
            { match, onPress: noop, onFavoriteRemoved: onFav },
            { match, onPress: noop, onFavoriteRemoved: onFav },
        )).toBe(true);
    });

    it('returns false when fecha_partido changes', () => {
        expect(arePropsEqual(
            { match: makeMatch({ fecha_partido: '2026-04-15' }), onPress: noop },
            { match: makeMatch({ fecha_partido: '2026-04-16' }), onPress: noop },
        )).toBe(false);
    });

    it('returns false when event_status changes', () => {
        expect(arePropsEqual(
            { match: makeMatch({ event_status: undefined }), onPress: noop },
            { match: makeMatch({ event_status: 'Finished' }), onPress: noop },
        )).toBe(false);
    });

    it('returns true when resultado is the same deep structure', () => {
        const match1 = makeMatch({ resultado: { marcador: '6-4', sets: [{ set: 1 }] } });
        const match2 = makeMatch({ resultado: { marcador: '6-4', sets: [{ set: 1 }] } });
        expect(arePropsEqual(
            { match: match1, onPress: noop },
            { match: match2, onPress: noop },
        )).toBe(true);
    });
});
