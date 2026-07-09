import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../services/api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  tool_used?: string | null
  timestamp: string
}

interface ChatState {
  messages: ChatMessage[]
  loading: boolean
  error: string | null
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
}

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, interactionId }: { message: string; interactionId?: string }) => {
    const response = await api.post('/chat/', {
      message,
      interaction_id: interactionId || null,
    })
    return response.data
  }
)

export const clearHistory = createAsyncThunk('chat/clearHistory', async () => {
  await api.delete('/chat/history')
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      })
    },
    clearMessages: (state) => {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: action.payload.reply,
          tool_used: action.payload.tool_used,
          timestamp: new Date().toISOString(),
        })
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to send message'
        state.messages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        })
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.messages = []
      })
  },
})

export const { addUserMessage, clearMessages } = chatSlice.actions
export default chatSlice.reducer
