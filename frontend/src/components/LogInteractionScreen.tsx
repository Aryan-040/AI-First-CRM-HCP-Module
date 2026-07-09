import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import InteractionForm from './InteractionForm'
import ChatPanel from './ChatPanel'
import SuggestedFollowups from './SuggestedFollowups'
import InteractionHistory from './InteractionHistory'

export default function LogInteractionScreen() {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log')
  const { current } = useSelector((state: RootState) => state.interaction)

  const isHistoryTab = activeTab === 'history'

  // Generate suggested follow-ups based on current state
  const getSuggestedFollowups = (): string[] => {
    if (!current.hcp_name) return []
    const suggestions: string[] = []
    if (current.sentiment === 'positive') {
      suggestions.push(`Schedule follow-up meeting in 2 weeks`)
    } else if (current.sentiment === 'negative') {
      suggestions.push(`Address concerns and schedule call within 3 days`)
    }
    if (current.materials_shared) {
      suggestions.push(`Send ${current.materials_shared} Phase III PDF`)
    }
    if (current.hcp_name) {
      suggestions.push(`Add ${current.hcp_name} to advisory board invite list`)
    }
    return suggestions
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Log HCP Interaction</h1>
            <p className="text-xs text-gray-500">AI-First CRM · HCP Module</p>
          </div>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors border ${
              isHistoryTab
                ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Log Interaction
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors border ${
              isHistoryTab
                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            History
          </button>
        </nav>
      </header>

      {/* Main Content */}
      {isHistoryTab ? (
        <div className="flex-1 overflow-hidden bg-white">
          <InteractionHistory onClose={() => setActiveTab('log')} embedded />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Interaction Form */}
          <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white">
            <InteractionForm />
            <SuggestedFollowups followups={getSuggestedFollowups()} />
          </div>

          {/* Right Panel - AI Chat */}
          <div className="w-[400px] flex flex-col bg-white">
            <ChatPanel />
          </div>
        </div>
      )}
    </div>
  )
}