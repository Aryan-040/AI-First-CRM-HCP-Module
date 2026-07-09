import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { api } from '../services/api'
import { setInteraction, Interaction } from '../store/interactionSlice'
import { showToast } from '../store/toastSlice'
import { AppDispatch } from '../store'
import { generatePDFReport } from '../services/report'

interface InteractionHistoryProps {
  onClose: () => void
  embedded?: boolean
}

export default function InteractionHistory({ onClose, embedded = false }: InteractionHistoryProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInteractions()
  }, [])

  const fetchInteractions = async () => {
    try {
      const response = await api.get('/interactions/')
      setInteractions(response.data)
    } catch (err) {
      console.error('Failed to fetch interactions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (interaction: Interaction) => {
    dispatch(setInteraction(interaction))
    onClose()
  }

  const handleGenerateReport = (e: React.MouseEvent, interaction: Interaction) => {
    e.stopPropagation()
    generatePDFReport(interaction)
    dispatch(showToast({ message: `Report generated for ${interaction.hcp_name}`, type: 'success' }))
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const sentimentDot = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-400',
      neutral: 'bg-gray-400',
      negative: 'bg-red-400',
    }
    return colors[sentiment] || 'bg-gray-300'
  }

  return (
    <div className={embedded ? 'h-full flex flex-col border-l border-gray-200' : 'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-6'}>
      <div className={`${embedded ? 'h-full w-full rounded-none shadow-none' : 'bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh]'} flex flex-col border border-gray-200`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Interaction History</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {interactions.length} record{interactions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Table Header */}
        {interactions.length > 0 && (
          <div className="px-5 py-2 border-b border-gray-100 grid grid-cols-12 gap-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            <div className="col-span-4">HCP</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Sentiment</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
          ) : interactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No interactions logged yet.</p>
              <p className="text-gray-300 text-xs mt-1">
                Use the AI assistant or form to log your first interaction.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  onClick={() => handleSelect(interaction)}
                  className="px-5 py-3 grid grid-cols-12 gap-2 items-center cursor-pointer hover:bg-gray-50 transition-colors group"
                >
                  {/* HCP Name */}
                  <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {(interaction.hcp_name || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                      {interaction.hcp_name || 'Unnamed'}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 text-xs text-gray-500">
                    {interaction.interaction_type || '—'}
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-xs text-gray-500">
                    {formatDate(interaction.interaction_date)}
                  </div>

                  {/* Sentiment */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${sentimentDot(interaction.sentiment)}`} />
                    <span className="text-xs text-gray-500 capitalize">
                      {interaction.sentiment || '—'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => handleGenerateReport(e, interaction)}
                      title="Download PDF Report"
                      className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <span className="w-7 h-7 flex items-center justify-center rounded text-gray-300 group-hover:text-gray-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}