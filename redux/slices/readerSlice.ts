import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Progress {
  scrollY: number;
  zoom: number;
}

interface ReaderState {
  progress: Record<string, Progress>;
  lastReadChapter: string | null;
}

const initialState: ReaderState = {
  progress: {},
  lastReadChapter: null,
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    updateProgress: (
      state,
      action: PayloadAction<{ chapterId: string; scrollY: number; zoom: number }>
    ) => {
      const { chapterId, scrollY, zoom } = action.payload;
      state.progress[chapterId] = { scrollY, zoom };
    },
    setLastReadChapter: (state, action: PayloadAction<string>) => {
      state.lastReadChapter = action.payload;
    },
  },
});

export const { updateProgress, setLastReadChapter } = readerSlice.actions;
export default readerSlice.reducer;
