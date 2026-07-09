import { Interaction } from '../store/interactionSlice'

/**
 * Generate a PDF report for an HCP interaction using the browser's print API.
 * No external dependencies needed.
 */
export function generatePDFReport(interaction: Interaction) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const sentimentLabel = (s: string) => {
    const map: Record<string, string> = {
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
    }
    return map[s] || 'N/A'
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HCP Interaction Report - ${interaction.hcp_name || 'Unknown'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; padding: 48px; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { font-size: 20px; font-weight: 700; color: #111; }
    .header p { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .meta { text-align: right; font-size: 11px; color: #9ca3af; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; }
    .field { }
    .field-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
    .field-value { font-size: 13px; color: #1f2937; font-weight: 500; }
    .field-value.empty { color: #d1d5db; font-style: italic; font-weight: 400; }
    .notes { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #374151; white-space: pre-wrap; min-height: 40px; }
    .sentiment-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .sentiment-positive { background: #d1fae5; color: #065f46; }
    .sentiment-neutral { background: #f3f4f6; color: #374151; }
    .sentiment-negative { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>HCP Interaction Report</h1>
      <p>${interaction.hcp_name || 'Unknown HCP'}</p>
    </div>
    <div class="meta">
      <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div>ID: ${interaction.id ? interaction.id.slice(0, 8) : 'Draft'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Interaction Details</div>
    <div class="field-row">
      <div class="field">
        <div class="field-label">HCP Name</div>
        <div class="field-value ${!interaction.hcp_name ? 'empty' : ''}">${interaction.hcp_name || 'Not specified'}</div>
      </div>
      <div class="field">
        <div class="field-label">Type</div>
        <div class="field-value ${!interaction.interaction_type ? 'empty' : ''}">${interaction.interaction_type || 'Not specified'}</div>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <div class="field-label">Date</div>
        <div class="field-value ${!interaction.interaction_date ? 'empty' : ''}">${formatDate(interaction.interaction_date)}</div>
      </div>
      <div class="field">
        <div class="field-label">Time</div>
        <div class="field-value ${!interaction.interaction_time ? 'empty' : ''}">${interaction.interaction_time || 'N/A'}</div>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <div class="field-label">Attendees</div>
        <div class="field-value ${!interaction.attendees ? 'empty' : ''}">${interaction.attendees || 'None listed'}</div>
      </div>
      <div class="field">
        <div class="field-label">Sentiment</div>
        <div class="field-value">
          <span class="sentiment-badge sentiment-${interaction.sentiment || 'neutral'}">${sentimentLabel(interaction.sentiment)}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Discussion</div>
    <div class="field">
      <div class="field-label">Topics Discussed</div>
      <div class="notes">${interaction.topics_discussed || 'No topics recorded'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Materials & Samples</div>
    <div class="field-row">
      <div class="field">
        <div class="field-label">Materials Shared</div>
        <div class="field-value ${!interaction.materials_shared ? 'empty' : ''}">${interaction.materials_shared || 'None'}</div>
      </div>
      <div class="field">
        <div class="field-label">Samples Distributed</div>
        <div class="field-value ${!interaction.samples_distributed ? 'empty' : ''}">${interaction.samples_distributed || 'None'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Outcomes</div>
    <div class="notes">${interaction.outcomes || 'No outcomes recorded'}</div>
  </div>

  <div class="section">
    <div class="section-title">Follow-up Actions</div>
    <div class="notes">${interaction.follow_up_actions || 'No follow-up actions defined'}</div>
  </div>

  <div class="footer">
    <span>HCP CRM · Confidential</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`

  // Open a new window and trigger print (saves as PDF)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    // Wait for fonts to load, then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}