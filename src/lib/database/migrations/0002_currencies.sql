CREATE TABLE `currency` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`exchange_rate` real NOT NULL DEFAULT 1.0,
	`is_enabled` integer NOT NULL DEFAULT 0,
	`is_default` integer NOT NULL DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `currency` (`id`, `code`, `name`, `symbol`, `exchange_rate`, `is_enabled`, `is_default`, `created_at`) VALUES
	('00000000-0000-0000-0000-000000000001', 'USD', 'Dólar Estadounidense', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000002', 'EUR', 'Euro', '€', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000003', 'MXN', 'Peso Mexicano', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000004', 'GTQ', 'Quetzal Guatemalteco', 'Q', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000005', 'COP', 'Peso Colombiano', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000006', 'ARS', 'Peso Argentino', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000007', 'BRL', 'Real Brasileño', 'R$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000008', 'CLP', 'Peso Chileno', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000009', 'PEN', 'Sol Peruano', 'S/', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000010', 'BOB', 'Boliviano', 'Bs.', 1.0, 1, 1, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000011', 'PYG', 'Guaraní Paraguayo', '₲', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000012', 'UYU', 'Peso Uruguayo', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000013', 'CRC', 'Colón Costarricense', '₡', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000014', 'HNL', 'Lempira Hondureño', 'L', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000015', 'NIO', 'Córdoba Nicaragüense', 'C$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z');
--> statement-breakpoint
ALTER TABLE `account` ADD COLUMN `currency_id` text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000010';
