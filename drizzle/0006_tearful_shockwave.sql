CREATE TABLE IF NOT EXISTS `story_discoveries` (
	`user_id` text NOT NULL,
	`story_id` text NOT NULL,
	`discovered_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `story_id`)
);
