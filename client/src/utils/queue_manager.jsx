import { create } from "zustand";

// Helper functions for localStorage handling
const getStorage = (key, defaultValue = []) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || defaultValue;
    } catch {
        return defaultValue;
    }
};

const updateStorage = (key, value) => {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Load initial queue data from localStorage
const storedTrackQueue = getStorage("trackQueue");
const storedPrevTrackQueue = getStorage("prevTrackQueue");

const useTrackQueue = create(set => ({
    trackQueue: storedTrackQueue,
    prevTrackQueue: storedPrevTrackQueue,
    currentTrack: storedTrackQueue.length ? storedTrackQueue[0] : null,

    setCurrentTrack: trackId =>
        set(state =>
            state.currentTrack !== trackId ? { currentTrack: trackId } : state
        ),

    addToQueue: trackId => {
        if (!trackId) return;
        set(state => {
            const { trackQueue, prevTrackQueue, currentTrack } = state;

            const updatedPrevQueue = currentTrack
                ? [...prevTrackQueue, currentTrack]
                : prevTrackQueue;
            const updatedQueue = [trackId, ...trackQueue];

            updateStorage("trackQueue", updatedQueue);
            updateStorage("prevTrackQueue", updatedPrevQueue);

            return {
                trackQueue: updatedQueue,
                prevTrackQueue: updatedPrevQueue,
                currentTrack: updatedQueue[0] || currentTrack
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
            const { trackQueue, prevTrackQueue } = state;
            if (!trackQueue.length) return state;

            const updatedPrevQueue = [...prevTrackQueue, trackQueue[0]];
            const updatedQueue = trackQueue.slice(1);

            updateStorage("prevTrackQueue", updatedPrevQueue);
            updateStorage("trackQueue", updatedQueue);

            return {
                prevTrackQueue: updatedPrevQueue,
                trackQueue: updatedQueue,
                currentTrack: updatedQueue[0] || null
            };
        });
    },

    skipToPrevious: () => {
        set(state => {
            const { prevTrackQueue, trackQueue } = state;
            if (!prevTrackQueue.length) return state;

            const prevTrack = prevTrackQueue.at(-1);
            const updatedPrevQueue = prevTrackQueue.slice(0, -1);
            const updatedQueue = [prevTrack, ...trackQueue];

            updateStorage("prevTrackQueue", updatedPrevQueue);
            updateStorage("trackQueue", updatedQueue);

            return {
                prevTrackQueue: updatedPrevQueue,
                trackQueue: updatedQueue,
                currentTrack: prevTrack
            };
        });
    },

    clearTrackQueue: () => {
        updateStorage("trackQueue", []);
        set(() => ({
            trackQueue: [],
            currentTrack: null
        }));
    }
}));

export default useTrackQueue;
