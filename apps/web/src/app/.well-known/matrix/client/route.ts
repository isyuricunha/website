export const runtime = 'nodejs'

export function GET() {
  return Response.json(
    {
      'm.homeserver': {
        base_url: 'https://matrix.yuricunha.com'
      }
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}
