import { configureStore } from '@reduxjs/toolkit'
import interactionReducer from './interactionSlice'
import chatReducer from './chatSlice'
import toastReducer from './toastSlice'

export const store = configureStore({
  reducer: {
    interaction: interactionReducer,
    chat: chatReducer,
    toast: toastReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
