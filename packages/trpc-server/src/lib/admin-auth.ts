import { getSession } from './auth'

export const requireAdmin = async (request: Request): Promise<Response | null> => {
  const session = await getSession(request.headers)

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
