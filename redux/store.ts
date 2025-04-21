// redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import readerReducer from './slices/readerSlice'

export const store = configureStore({
  reducer: {
    reader: readerReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
