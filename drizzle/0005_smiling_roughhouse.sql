CREATE TABLE IF NOT EXISTS `guest_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `guest_sessions_expiry_idx` ON `guest_sessions` (`expires_at`);
