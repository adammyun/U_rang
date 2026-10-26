CREATE TABLE IF NOT EXISTS `memory_comment_anchors` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`pano_id` text NOT NULL,
	`pan` real NOT NULL,
	`tilt` real NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `memory_comments`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "memory_comment_anchor_pan" CHECK("memory_comment_anchors"."pan" between -180 and 180),
	CONSTRAINT "memory_comment_anchor_tilt" CHECK("memory_comment_anchors"."tilt" between -90 and 90),
	CONSTRAINT "memory_comment_anchor_id" CHECK(length("memory_comment_anchors"."pano_id") between 1 and 256)
);
