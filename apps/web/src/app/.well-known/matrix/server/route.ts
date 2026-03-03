export const runtime = 'nodejs'

export function GET() {
  return Response.json(
    {
      'm.server': 'matrix.yuricunha.com:443'
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
}
