CREATE TABLE IF NOT EXISTS `memory_reactions` (
	`memory_id` text NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`memory_id`, `user_id`, `kind`),
	FOREIGN KEY (`memory_id`) REFERENCES `memories`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "memory_reactions_kind" CHECK("memory_reactions"."kind" in ('like', 'bookmark'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `memory_reactions_user_kind_idx` ON `memory_reactions` (`user_id`,`kind`,`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `memory_views` (
	`memory_id` text NOT NULL,
	`viewer_key` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`memory_id`, `viewer_key`),
	FOREIGN KEY (`memory_id`) REFERENCES `memories`(`id`) ON UPDATE no action ON DELETE cascade
);
