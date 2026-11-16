// Minimal stand-in for next/server in unit tests; the SvelteKit app has no
// Next runtime, so tests that still reference NextRequest get a plain Request.
export class NextRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init)
  }
}

export const NextResponse = {
  json: (body: unknown, init?: ResponseInit) => Response.json(body, init)
}
