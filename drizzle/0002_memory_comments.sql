CREATE TABLE IF NOT EXISTS `memory_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`memory_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`memory_id`) REFERENCES `memories`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "memory_comments_content" CHECK(length(trim("memory_comments"."content")) between 1 and 1000)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `memory_comments_memory_created_idx` ON `memory_comments` (`memory_id`,`created_at`,`id`);