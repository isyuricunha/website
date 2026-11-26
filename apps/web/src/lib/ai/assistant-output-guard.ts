// Reserved provider control markers are never visitor-visible text.
// Retain only an ambiguous suffix between chunks; ordinary prose streams
// immediately. This is a detection boundary, NOT a tool-call parser.
const markers = [
  '<tool_call',
  '</tool_call',
  '<tool_response',
  '</tool_response',
  '<tool_use',
  '</tool_use',
  '<function_call',
  '</function_call',
  '<function=',
  '</function>',
  '<parameter=',
  '</parameter>',
  '<|tool_call',
  '<|python_tag|>',
  '[tool_calls]'
]

export class AssistantOutputGuard {
  private pending = ''
  private rejected = false

  get blocked() {
    return this.rejected
  }

  push(chunk: string): string {
    if (this.rejected) return ''
    const combined = this.pending + chunk
    const lower = combined.replace(/[A-Z]/g, (letter) => letter.toLowerCase())
    if (markers.some((marker) => lower.includes(marker))) {
      this.rejected = true
      this.pending = ''
      return ''
    }

    let retained = 0
    for (const marker of markers) {
      const max = Math.min(marker.length - 1, lower.length)
      for (let length = max; length > retained; length -= 1) {
        if (lower.endsWith(marker.slice(0, length))) {
          retained = length
        }
      }
    }
    const boundary = combined.length - retained
    this.pending = combined.slice(boundary)
    return combined.slice(0, boundary)
  }

  finish(): string {
    if (this.rejected) return ''
    // A truncated control marker is not a successful model answer.
    // A lone angle bracket or square bracket can be ordinary prose.
    if (this.pending.length > 1) {
      this.rejected = true
      this.pending = ''
      return ''
    }
    const tail = this.pending
    this.pending = ''
    return tail
  }
}

export const containsAssistantControlText = (text: string): boolean => {
  const guard = new AssistantOutputGuard()
  guard.push(text)
  guard.finish()
  return guard.blocked
}
