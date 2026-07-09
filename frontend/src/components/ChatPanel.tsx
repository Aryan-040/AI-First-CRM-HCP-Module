import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { addUserMessage, sendMessage, clearMessages, clearHistory } from '../store/chatSlice'
import { setInteraction } from '../store/interactionSlice'
import { showToast } from '../store/toastSlice'

export default function ChatPanel() {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, loading } = useSelector((state: RootState) => state.chat)
  const { current } = useSelector((state: RootState) => state.interaction)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    dispatch(addUserMessage(userMessage))

    const result = await dispatch(
      sendMessage({
        message: userMessage,
        interactionId: current.id,
      })
    )

    // If the AI response includes interaction data, update the form
    if (result.payload?.interaction) {
      dispatch(setInteraction(result.payload.interaction))

      // Show toast based on tool used
      const toolUsed = result.payload.tool_used
      if (toolUsed === 'log_interaction') {
        dispatch(showToast({ message: 'Interaction logged successfully', type: 'success' }))
      } else if (toolUsed === 'edit_interaction') {
        dispatch(showToast({ message: 'Interaction updated', type: 'success' }))
      } else if (toolUsed === 'validate_interaction') {
        dispatch(showToast({ message: 'Validation complete', type: 'info' }))
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    dispatch(clearMessages())
    dispatch(clearHistory())
  }

  const toolLabel = (tool: string) => {
    const labels: Record<string, string> = {
      log_interaction: 'Logged',
      edit_interaction: 'Edited',
      get_interaction_summary: 'Summary',
      suggest_followups: 'Follow-ups',
      validate_interaction: 'Validated',
    }
    return labels[tool] || `🔧 ${tool}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">AI Assistant</h2>
            <p className="text-[10px] text-gray-400">Log interaction via chat</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-600 leading-relaxed border border-gray-100">
              <p className="font-medium text-gray-700 mb-1.5">👋 How can I help?</p>
              <p>Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.</p>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                'Met Dr. Sharma today about Product Y',
                'Summarize this interaction',
                'Validate before submitting',
                'Suggest follow-up actions',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-xs px-3 py-2 rounded-md border border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.tool_used && (
                <span className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  msg.role === 'user' ? 'bg-blue-500 text-blue-100' : 'bg-gray-200 text-gray-600'
                }`}>
                  {toolLabel(msg.tool_used)}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500">
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-gray-50/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe interaction..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>✨</span>
            <span>Log</span>
          </button>
        </div>
      </div>
    </div>
  )
}
