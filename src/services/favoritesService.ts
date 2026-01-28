import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@tennis_favorites';

export interface Favorite {
    matchId: number;
    player1Name: string;
    player2Name: string;
    tournament: string;
    addedAt: string;
}

/**
 * Get all favorite matches
 */
export async function getFavorites(): Promise<Favorite[]> {
    try {
        const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
        console.error('Error getting favorites:', error);
        return [];
    }
}

/**
 * Check if a match is favorited
 */
export async function isFavorite(matchId: number): Promise<boolean> {
    const favorites = await getFavorites();
    return favorites.some(fav => fav.matchId === matchId);
}

/**
 * Add a match to favorites
 */
export async function addFavorite(favorite: Omit<Favorite, 'addedAt'>): Promise<void> {
    try {
        const favorites = await getFavorites();
        const newFavorite: Favorite = {
            ...favorite,
            addedAt: new Date().toISOString(),
        };

        // Check if already exists
        if (!favorites.some(fav => fav.matchId === favorite.matchId)) {
            favorites.push(newFavorite);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
    }
}

/**
 * Remove a match from favorites
 */
export async function removeFavorite(matchId: number): Promise<void> {
    try {
        const favorites = await getFavorites();
        const filtered = favorites.filter(fav => fav.matchId !== matchId);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error removing favorite:', error);
    }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
    matchId: number,
    matchData: Omit<Favorite, 'matchId' | 'addedAt'>
): Promise<boolean> {
    const isCurrentlyFavorite = await isFavorite(matchId);

    if (isCurrentlyFavorite) {
        await removeFavorite(matchId);
        return false;
    } else {
        await addFavorite({ matchId, ...matchData });
        return true;
    }
}
