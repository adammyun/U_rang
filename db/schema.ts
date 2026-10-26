import { check, index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const memories = sqliteTable(
  'memories',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    locationName: text('location_name').notNull(),
    memoryDate: text('memory_date'),
    emotion: text('emotion').notNull(),
    visibility: text('visibility').notNull(),
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull(),
    locationPrecision: text('location_precision').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    publicLatitude: real('public_latitude').notNull(),
    publicLongitude: real('public_longitude').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('memories_user_date_idx').on(table.userId, table.memoryDate),
    index('memories_public_bounds_idx').on(
      table.visibility,
      table.publicLongitude,
      table.publicLatitude,
    ),
  ],
);

export const memoryMedia = sqliteTable(
  'memory_media',
  {
    id: text('id').primaryKey(),
    memoryId: text('memory_id')
      .notNull()
      .references(() => memories.id, { onDelete: 'cascade' }),
    storageKey: text('storage_key').notNull().unique(),
    mediaType: text('media_type').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSize: integer('file_size').notNull(),
    sortOrder: integer('sort_order').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('memory_media_memory_sort_idx').on(table.memoryId, table.sortOrder)],
);

export const memoryReactions = sqliteTable('memory_reactions', {
  memoryId:text('memory_id').notNull().references(()=>memories.id,{onDelete:'cascade'}),
  userId:text('user_id').notNull(),
  kind:text('kind',{enum:['like','bookmark']}).notNull(),
  createdAt:text('created_at').notNull(),
}, table=>[primaryKey({columns:[table.memoryId,table.userId,table.kind]}),index('memory_reactions_user_kind_idx').on(table.userId,table.kind,table.createdAt),check('memory_reactions_kind',sql`${table.kind} in ('like', 'bookmark')`)]);

export const memoryViews = sqliteTable('memory_views', {
  memoryId:text('memory_id').notNull().references(()=>memories.id,{onDelete:'cascade'}),
  viewerKey:text('viewer_key').notNull(),
  createdAt:text('created_at').notNull(),
}, table=>[primaryKey({columns:[table.memoryId,table.viewerKey]})]);

export const memoryComments = sqliteTable('memory_comments', {
  id:text('id').primaryKey().notNull(),
  memoryId:text('memory_id').notNull().references(()=>memories.id,{onDelete:'cascade'}),
  userId:text('user_id').notNull(),
  content:text('content').notNull(),
  createdAt:text('created_at').notNull(),
}, table=>[index('memory_comments_memory_created_idx').on(table.memoryId,table.createdAt,table.id),check('memory_comments_content',sql`length(trim(${table.content})) between 1 and 1000`)]);

// Optional 1:1 extension preserves existing text-only comments unchanged.
export const memoryCommentAnchors = sqliteTable('memory_comment_anchors', {
  commentId:text('comment_id').primaryKey().notNull().references(()=>memoryComments.id,{onDelete:'cascade'}),
  panoId:text('pano_id').notNull(),
  pan:real('pan').notNull(),
  tilt:real('tilt').notNull(),
}, table=>[check('memory_comment_anchor_pan',sql`${table.pan} between -180 and 180`),check('memory_comment_anchor_tilt',sql`${table.tilt} between -90 and 90`),check('memory_comment_anchor_id',sql`length(${table.panoId}) between 1 and 256`)]);

export const userPreferences = sqliteTable('user_preferences', {userId:text('user_id').primaryKey().notNull(),emotionMenu:text('emotion_menu').notNull(),updatedAt:text('updated_at').notNull()});
