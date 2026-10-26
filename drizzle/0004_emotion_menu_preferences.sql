CREATE TABLE IF NOT EXISTS `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`emotion_menu` text NOT NULL,
	`updated_at` text NOT NULL
);
