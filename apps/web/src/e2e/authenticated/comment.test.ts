import { createId } from '@paralleldrive/cuid2'
import { expect, test } from '@playwright/test'
import { comments, db } from '@tszhong0411/db'

import { TEST_USER } from '../constants'

test.describe('comment page', () => {
  test('should be able to submit a comment', async ({ page }) => {
    const commentText = `comment-${createId()}`

    await page.goto('/blog/test-submit')

    await page.getByTestId('comment-textarea-post').fill(commentText)
    await page.getByTestId('comment-submit-button').click()

    await expect(page.getByTestId('comments-list').getByText(commentText)).toBeVisible()
    await expect(page.locator('li[data-sonner-toast]')).toContainText('Comment posted')

    // Comment count should be updated in the blog header and comment header
    await expect(page.getByTestId('comment-count')).toHaveAttribute('aria-label', '1')
    await expect(page.getByTestId('blog-comment-count')).toHaveAttribute('aria-label', '1 comment')
  })

  test('should be able to delete a comment', async ({ page }) => {
    const commentId = createId()

    await db.insert(comments).values({
      id: commentId,
      body: 'Test Comment',
      postId: 'test-delete',
      userId: TEST_USER.id
    })

    await page.goto('/blog/test-delete')

    const commentBlock = page.getByTestId(`comment-${commentId}`)
    await commentBlock.getByTestId('comment-menu-button').click()

    await page.getByTestId('comment-delete-button').click()

    const deleteDialog = page.getByTestId('comment-dialog')
    await deleteDialog.getByTestId('comment-dialog-delete-button').click()

    await expect(commentBlock).toBeHidden()
    await expect(page.locator('li[data-sonner-toast]')).toContainText('Deleted a comment')

    // Comment count should be updated in the blog header and comment header
    await expect(page.getByTestId('comment-count')).toHaveAttribute('aria-label', '0')
    await expect(page.getByTestId('blog-comment-count')).toHaveAttribute('aria-label', '0 comments')
  })

  test('should be able to reply to a comment', async ({ page }) => {
    const parentId = createId()
    const replyText = `reply-${createId()}`

    await db.insert(comments).values({
      id: parentId,
      body: 'Parent Comment',
      postId: 'test-reply',
      userId: TEST_USER.id
    })

    await page.goto('/blog/test-reply')

    const parentCommentBlock = page.getByTestId(`comment-${parentId}`)

    await parentCommentBlock.getByTestId('comment-reply-button').click()

    await page.getByTestId('comment-textarea-reply').fill(replyText)
    await page.getByTestId('comment-submit-reply-button').click()

    // Expand the replies section
    const expandButton = parentCommentBlock.getByTestId('comment-replies-expand-button')
    await expect(expandButton.getByTestId('comment-reply-count')).toContainText('1')
    await expandButton.click()

    await expect(page.getByTestId('comments-list').getByText(replyText)).toBeVisible()

    // Reply count should be updated in the comment header
    await expect(page.getByTestId('reply-count')).toHaveAttribute('aria-label', '1 reply')

    await expect(page.locator('li[data-sonner-toast]')).toContainText('Reply posted')
  })

  test('should be able to delete a reply', async ({ page }) => {
    const parentId = createId()
    const replyId = createId()

    await db.insert(comments).values({
      id: parentId,
      body: 'Parent Comment',
      postId: 'test-delete-reply',
      userId: TEST_USER.id
    })

    await db.insert(comments).values({
      id: replyId,
      body: 'Reply comment',
      postId: 'test-delete-reply',
      userId: TEST_USER.id,
      parentId
    })

    await page.goto('/blog/test-delete-reply')

    const parentCommentBlock = page.getByTestId(`comment-${parentId}`)
    const expandButton = parentCommentBlock.getByTestId('comment-replies-expand-button')
    await expandButton.click()
    const replyCommentBlock = page.getByTestId(`comment-${replyId}`)
    await replyCommentBlock.getByTestId('comment-menu-button').click()

    await page.getByTestId('comment-delete-button').click()

    const deleteDialog = page.getByTestId('comment-dialog')
    await deleteDialog.getByTestId('comment-dialog-delete-button').click()

    await expect(replyCommentBlock).toBeHidden()
    await expect(page.locator('li[data-sonner-toast]')).toContainText('Deleted a comment')

    // Reply count should be updated in the comment header
    await expect(page.getByTestId('reply-count')).toHaveAttribute('aria-label', '0 replies')
  })
})
