import { create } from "zustand";

const getStorage = (key, defaultValue = []) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || defaultValue;
    } catch {
        return defaultValue;
    }
};

const updateStorage = (key, value) => {
    if (value !== undefined && value !== null) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

const useTrackQueue = create(set => ({
    trackQueue: getStorage("trackQueue"),
    prevTrackQueue: getStorage("prevTrackQueue"),
    currentTrack: getStorage("trackQueue")[0] || null,

    setCurrentTrack: trackId => {
        set(state =>
            state.currentTrack !== trackId ? { currentTrack: trackId } : state
        );
    },

    addToQueue: trackId => {
        if (!trackId) return;
        set(state => {
            const updatedPrevQueue = state.currentTrack
                ? [...state.prevTrackQueue, state.currentTrack]
                : state.prevTrackQueue;

            const updatedQueue = [trackId, ...state.trackQueue];

            updateStorage("trackQueue", updatedQueue);
            updateStorage("prevTrackQueue", updatedPrevQueue);

            return {
                trackQueue: updatedQueue,
                prevTrackQueue: updatedPrevQueue,
                currentTrack: updatedQueue[0] || state.currentTrack
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
            if (!state.trackQueue.length) return state;

            const updatedPrevQueue = [
                ...state.prevTrackQueue,
                state.trackQueue[0]
            ];
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
            if (!state.prevTrackQueue.length) return state;

            const prevTrack =
                state.prevTrackQueue[state.prevTrackQueue.length - 1];
            const updatedPrevQueue = state.prevTrackQueue.slice(0, -1);
            const updatedQueue = [prevTrack, ...state.trackQueue];

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
