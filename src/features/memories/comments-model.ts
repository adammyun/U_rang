import { z } from 'zod';

export const commentInputSchema = z.object({ content: z.string().trim().min(1).max(1000) }).strict();
const cursorValue = z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).strict();
export const commentCursorSchema = z.string().max(180).transform((value, context) => {
  try { return cursorValue.parse(JSON.parse(decodeURIComponent(value))); }
  catch { context.addIssue({code:'custom',message:'잘못된 댓글 페이지입니다.'}); return z.NEVER; }
});
export type CommentCursor = z.infer<typeof cursorValue>;
export type MemoryComment = { id: string; content: string; createdAt: string; owned: boolean };
export type CommentPage = { comments: MemoryComment[]; nextCursor: string | null };
export const COMMENT_PAGE_SIZE = 30;
export const encodeCommentCursor = (value: CommentCursor) => encodeURIComponent(JSON.stringify(value));
