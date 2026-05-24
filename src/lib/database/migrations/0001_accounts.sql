CREATE TABLE `account_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_category_id` text NOT NULL,
	`name` text NOT NULL,
	`initial_balance` real NOT NULL,
	`current_balance` real NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_category_id`) REFERENCES `account_category`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `transaction` ADD `account_id` text NOT NULL REFERENCES `account`(`id`) ON DELETE cascade;
