import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { updateField, saveInteraction, resetInteraction } from '../store/interactionSlice'
import { showToast } from '../store/toastSlice'

export default function InteractionForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { current, loading } = useSelector((state: RootState) => state.interaction)

  const handleChange = (field: string, value: string) => {
    dispatch(updateField({ field: field as any, value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(saveInteraction(current))
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(showToast({ message: 'Interaction saved successfully', type: 'success' }))
    }
  }

  const handleReset = () => {
    dispatch(resetInteraction())
    dispatch(showToast({ message: 'Form cleared', type: 'info' }))
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          Interaction Details
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* HCP Name & Interaction Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">HCP Name</label>
          <input
            type="text"
            placeholder="Search or select HCP..."
            value={current.hcp_name}
            onChange={(e) => handleChange('hcp_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Interaction Type</label>
          <select
            value={current.interaction_type}
            onChange={(e) => handleChange('interaction_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none"
          >
            <option value="Meeting">Meeting</option>
            <option value="Call">Call</option>
            <option value="Email">Email</option>
            <option value="Video Call">Video Call</option>
          </select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
          <input
            type="date"
            value={current.interaction_date}
            onChange={(e) => handleChange('interaction_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Time</label>
          <input
            type="time"
            value={current.interaction_time}
            onChange={(e) => handleChange('interaction_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Attendees */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Attendees</label>
        <input
          type="text"
          placeholder="Enter names or search..."
          value={current.attendees}
          onChange={(e) => handleChange('attendees', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
        />
      </div>

      {/* Topics Discussed */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Topics Discussed</label>
        <textarea
          placeholder="Enter key discussion points..."
          value={current.topics_discussed}
          onChange={(e) => handleChange('topics_discussed', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
        />
        {/* Summarize from Voice Note button - matches mockup */}
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md transition-colors"
        >
          Summarize from Voice Note (Requires Consent)
        </button>
      </div>

      {/* Materials Shared / Samples */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Materials Shared / Samples Distributed
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Materials Shared</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No materials added"
                value={current.materials_shared}
                onChange={(e) => handleChange('materials_shared', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                className="px-2.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 whitespace-nowrap"
              >
                Search/Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1">Samples Distributed</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No samples added"
                value={current.samples_distributed}
                onChange={(e) => handleChange('samples_distributed', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
              <button
                type="button"
                className="px-2.5 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 whitespace-nowrap"
              >
                Add Sample
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Observed/Inferred HCP Sentiment */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2.5">
          Observed/Inferred HCP Sentiment
        </label>
        <div className="flex gap-4">
          {([
            { value: 'positive',label: 'Positive', color: 'peer-checked:border-green-500 peer-checked:bg-green-50' },
            { value: 'neutral', label: 'Neutral', color: 'peer-checked:border-gray-500 peer-checked:bg-gray-50' },
            { value: 'negative', label: 'Negative', color: 'peer-checked:border-red-500 peer-checked:bg-red-50' },
          ] as const).map((s) => (
            <label key={s.value} className="relative flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sentiment"
                value={s.value}
                checked={current.sentiment === s.value}
                onChange={(e) => handleChange('sentiment', e.target.value)}
                className="peer w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm flex items-center gap-1">
                <span className="capitalize text-gray-700">{s.label}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Outcomes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Outcomes</label>
        <textarea
          placeholder="Key outcomes or agreements..."
          value={current.outcomes}
          onChange={(e) => handleChange('outcomes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
        />
      </div>

      {/* Follow-up Actions */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Follow-up Actions</label>
        <textarea
          placeholder="Enter next steps or tasks..."
          value={current.follow_up_actions}
          onChange={(e) => handleChange('follow_up_actions', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Interaction'
          )}
        </button>
      </div>
    </form>
  )
}
