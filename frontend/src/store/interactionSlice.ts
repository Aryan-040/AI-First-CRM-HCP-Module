import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { api } from '../services/api'

export interface Interaction {
  id?: string
  hcp_name: string
  interaction_type: string
  interaction_date: string
  interaction_time: string
  attendees: string
  topics_discussed: string
  materials_shared: string
  samples_distributed: string
  sentiment: string
  outcomes: string
  follow_up_actions: string
  created_at?: string
  updated_at?: string
}

interface InteractionState {
  current: Interaction
  saved: Interaction | null
  loading: boolean
  error: string | null
}

const initialInteraction: Interaction = {
  hcp_name: '',
  interaction_type: 'Meeting',
  interaction_date: '',
  interaction_time: '',
  attendees: '',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: 'neutral',
  outcomes: '',
  follow_up_actions: '',
}

const initialState: InteractionState = {
  current: initialInteraction,
  saved: null,
  loading: false,
  error: null,
}

export const saveInteraction = createAsyncThunk(
  'interaction/save',
  async (interaction: Interaction) => {
    // Clean payload: convert empty strings to null so backend doesn't choke
    // on invalid date/time parsing
    const payload: Record<string, any> = {}
    for (const [key, value] of Object.entries(interaction)) {
      if (key === 'id' || key === 'created_at' || key === 'updated_at') continue
      payload[key] = value === '' ? null : value
    }

    if (interaction.id) {
      const response = await api.put(`/interactions/${interaction.id}`, payload)
      return response.data
    } else {
      const response = await api.post('/interactions/', payload)
      return response.data
    }
  }
)

export const fetchInteraction = createAsyncThunk(
  'interaction/fetch',
  async (id: string) => {
    const response = await api.get(`/interactions/${id}`)
    return response.data
  }
)

const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateField: (state, action: PayloadAction<{ field: keyof Interaction; value: string }>) => {
      (state.current as any)[action.payload.field] = action.payload.value
    },
    setInteraction: (state, action: PayloadAction<Interaction>) => {
      // Spread over initialInteraction so any null/missing fields reset to defaults
      // instead of carrying over from the previously loaded interaction
      const cleaned: Interaction = {
        ...initialInteraction,
        ...Object.fromEntries(
          Object.entries(action.payload).filter(([_, v]) => v != null)
        ),
      }
      state.current = cleaned
      state.saved = cleaned
    },
    resetInteraction: (state) => {
      state.current = initialInteraction
      state.saved = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveInteraction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveInteraction.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
        state.saved = action.payload
      })
      .addCase(saveInteraction.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to save'
      })
      .addCase(fetchInteraction.fulfilled, (state, action) => {
        state.current = action.payload
        state.saved = action.payload
      })
  },
})

export const { updateField, setInteraction, resetInteraction } = interactionSlice.actions
export default interactionSlice.reducer