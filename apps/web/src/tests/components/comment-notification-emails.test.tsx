import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'

const post = {
  title: 'Operating a reliable service',
  url: 'https://yuricunha.com/en/blog/operating-a-reliable-service'
}

describe('comment notification emails', () => {
  it('renders a direct link to a new comment', async () => {
    const { Comment } = await import('@isyuricunha/emails')
    const view = await render(
      Comment({
        comment: 'Great article.',
        commenter: { name: '<script>alert(1)</script>', image: 'https://yuricunha.com/avatar.png' },
        date: 'September 8, 2026',
        id: 'comment=comment-1',
        post,
        locale: 'en'
      })
    )

    expect(view).toContain('New Comment on Your Blog Post')
    expect(view).toContain(
      'https://yuricunha.com/en/blog/operating-a-reliable-service?comment=comment-1'
    )
    expect(view).not.toContain('<script>alert(1)</script>')
  })

  it('renders a direct link to a reply in Portuguese', async () => {
    const { Reply } = await import('@isyuricunha/emails')
    const view = await render(
      Reply({
        reply: 'Obrigado pela leitura.',
        replier: { name: 'Yuri', image: 'https://yuricunha.com/avatar.png' },
        comment: 'Ótimo artigo.',
        date: '8 de setembro de 2026',
        id: 'comment=comment-1&reply=reply-1',
        post,
        locale: 'pt'
      })
    )

    expect(view).toContain('Resposta ao seu comentário')
    expect(view).toContain(
      'https://yuricunha.com/en/blog/operating-a-reliable-service?comment=comment-1&amp;reply=reply-1'
    )
  })
})
