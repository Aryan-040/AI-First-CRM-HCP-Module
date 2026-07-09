interface SuggestedFollowupsProps {
  followups: string[]
}

export default function SuggestedFollowups({ followups }: SuggestedFollowupsProps) {
  if (followups.length === 0) return null

  return (
    <div className="px-6 pb-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
          AI Suggested Follow-ups:
        </h4>
        <ul className="space-y-1.5">
          {followups.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-blue-900">
              <span className="text-blue-400 mt-0.5">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
