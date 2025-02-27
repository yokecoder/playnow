import { create } from "zustand";

const getStorage = key => {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
};

const updateStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};
const useTrackQueue = create(set => ({
    trackQueue: getStorage("trackQueue") || [],
    prevTrackQueue: getStorage("prevTrackQueue") || [],
    currentTrack: (getStorage("trackQueue") || [])[0] || null,

    setCurrentTrack: trackId => {
        set({ currentTrack: trackId });
    },

    addToQueue: trackId => {
        if (!trackId) return;
        set(state => {
            const updatedPrevQueue = state.currentTrack
                ? [...state.prevTrackQueue, state.currentTrack] // Store the current track before updating
                : state.prevTrackQueue;

            const updatedQueue = [trackId, ...state.trackQueue];
            updateStorage("trackQueue", updatedQueue);
            updateStorage("prevTrackQueue", updatedPrevQueue);

            return {
                trackQueue: updatedQueue,
                prevTrackQueue: updatedPrevQueue,
                currentTrack: updatedQueue[0]
            };
        });
    },

    addToLast: trackId => {
        if (!trackId) return;
        set(state => {
            const updatedQueue = [...state.trackQueue, trackId];
            updateStorage("trackQueue", updatedQueue);
            return { trackQueue: updatedQueue };
        });
    },

    skipToNext: () => {
        set(state => {
            if (state.trackQueue.length === 0) return state;

            const updatedPrevQueue = [
                ...state.prevTrackQueue,
                state.trackQueue[0]
            ].filter(Boolean);
            const updatedTrackQueue = state.trackQueue.slice(1);

            updateStorage("prevTrackQueue", updatedPrevQueue);
            updateStorage("trackQueue", updatedTrackQueue);

            return {
                prevTrackQueue: updatedPrevQueue,
                trackQueue: updatedTrackQueue,
                currentTrack: updatedTrackQueue[0] || null
            };
        });
    },
    skipToPrevious: () => {
        set(state => {
            if (state.prevTrackQueue.length === 0) return state;

            const prevTrack =
                state.prevTrackQueue[state.prevTrackQueue.length - 1]; // Get last track
            return {
                ...state,
                trackQueue: [prevTrack, ...state.trackQueue], // Add previous track to the front of trackQueue
                prevTrackQueue: state.prevTrackQueue.slice(0, -1), // Remove last track from prevTrackQueue
                currentTrack: prevTrack // Update current track
            };
        });
    },

    clearTrackQueue: () => {
        set(() => {
            updateStorage("trackQueue", []);
            return {
                trackQueue: [],
                currentTrack: null
            };
        });
    }
}));

export default useTrackQueue;
