import { z } from 'zod';

export const panoramaAnchorSchema = z.object({
  panoId: z.string().min(1).max(256).regex(/^[A-Za-z0-9._~+/=-]+$/),
  pan: z.number().finite().min(-180).max(180),
  tilt: z.number().finite().min(-90).max(90),
}).strict();
export type PanoramaAnchor = z.infer<typeof panoramaAnchorSchema>;
export const commentInputSchema = z.object({ content: z.string().trim().min(1).max(1000), anchor: panoramaAnchorSchema.nullish() }).strict();
const cursorValue = z.object({ createdAt: z.iso.datetime(), id: z.uuid() }).strict();
export const commentCursorSchema = z.string().max(180).transform((value, context) => {
  try { return cursorValue.parse(JSON.parse(decodeURIComponent(value))); }
  catch { context.addIssue({code:'custom',message:'잘못된 댓글 페이지입니다.'}); return z.NEVER; }
});
export type CommentCursor = z.infer<typeof cursorValue>;
export type MemoryComment = { id: string; content: string; createdAt: string; owned: boolean; anchor: PanoramaAnchor | null };
export type CommentPage = { comments: MemoryComment[]; nextCursor: string | null };
export const COMMENT_PAGE_SIZE = 30;
export const encodeCommentCursor = (value: CommentCursor) => encodeURIComponent(JSON.stringify(value));
