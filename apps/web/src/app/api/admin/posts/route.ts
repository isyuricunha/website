import { adminPostsDelete, adminPostsPost, adminPostsPut } from '@/lib/admin/posts'

export const runtime = 'nodejs'

export async function POST(request: Request): Promise<Response> {
  return adminPostsPost(request)
}

export async function PUT(request: Request): Promise<Response> {
  return adminPostsPut(request)
}

export async function DELETE(request: Request): Promise<Response> {
  return adminPostsDelete(request)
}
