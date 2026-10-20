-- Database Schema for Rebuild Bionet (bionetv6)
-- Arsitektur: 100% UUID CHAR(36) Primary Key & Foreign Key pada SELURUH Tabel
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Integritas: ON DELETE CASCADE / RESTRICT / SET NULL berbasis UUID

DROP DATABASE IF EXISTS `bionetv6`;
CREATE DATABASE `bionetv6` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bionetv6`;

-- ==============================================
-- 1. MODUL USER & AUTENTIKASI
-- ==============================================

CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `full_name` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('member', 'admin', 'stokis') NOT NULL DEFAULT 'member',
    `phone` VARCHAR(20) NULL,
    `status` ENUM('active', 'suspended', 'pending') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_username` (`username`),
    INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE `user_banks` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `bank_name` VARCHAR(100) NOT NULL,
    `account_number` VARCHAR(50) NOT NULL,
    `account_name` VARCHAR(150) NOT NULL,
    `is_primary` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_banks_user` (`user_id`)
) ENGINE=InnoDB;

CREATE TABLE `user_addresses` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `recipient_name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` TEXT NOT NULL,
    `province` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `district` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(10) NOT NULL,
    `is_primary` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_addresses_user` (`user_id`)
) ENGINE=InnoDB;

CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `refresh_token` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_sessions_user` (`user_id`)
) ENGINE=InnoDB;

-- ==============================================
-- 2. MODUL JARINGAN & GENEALOGI (MLM)
-- ==============================================

-- Relasi langsung sponsor (Direct Referral)
CREATE TABLE `sponsors` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL UNIQUE, -- UUID FK (Mitra)
    `sponsor_id` CHAR(36) NOT NULL, -- UUID FK (Upline Sponsor)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sponsor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_sponsors_sponsor` (`sponsor_id`)
) ENGINE=InnoDB;

-- Posisi dalam matriks binary (Kiri / Kanan)
CREATE TABLE `network_positions` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL UNIQUE, -- UUID FK (Mitra)
    `upline_id` CHAR(36) NOT NULL, -- UUID FK (Upline Binary)
    `position` ENUM('kiri', 'kanan') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`upline_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_upline_position` (`upline_id`, `position`)
) ENGINE=InnoDB;

-- Closure Table untuk hirarki Sponsor
CREATE TABLE `sponsor_paths` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `ancestor_id` CHAR(36) NOT NULL, -- UUID FK
    `descendant_id` CHAR(36) NOT NULL, -- UUID FK
    `level` INT NOT NULL DEFAULT 0,
    UNIQUE KEY `uk_sponsor_ancestor_descendant` (`ancestor_id`, `descendant_id`),
    FOREIGN KEY (`ancestor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`descendant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_sponsor_descendant_level` (`descendant_id`, `level`)
) ENGINE=InnoDB;

-- Closure Table untuk hirarki Upline Binary
CREATE TABLE `upline_paths` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `ancestor_id` CHAR(36) NOT NULL, -- UUID FK
    `descendant_id` CHAR(36) NOT NULL, -- UUID FK
    `level` INT NOT NULL DEFAULT 0,
    `path_position` ENUM('kiri', 'kanan') NULL,
    UNIQUE KEY `uk_upline_ancestor_descendant` (`ancestor_id`, `descendant_id`),
    FOREIGN KEY (`ancestor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`descendant_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_upline_descendant_level` (`descendant_id`, `level`)
) ENGINE=InnoDB;

-- ==============================================
-- 3. MODUL BONUS, POIN & WALLET
-- ==============================================

-- Saldo Poin Pasangan & Reward
CREATE TABLE `point_balances` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL UNIQUE, -- UUID FK
    `point_left` DECIMAL(15,2) DEFAULT 0.00,
    `point_right` DECIMAL(15,2) DEFAULT 0.00,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Saldo Utama E-Wallet
CREATE TABLE `wallets` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL UNIQUE, -- UUID FK
    `balance` DECIMAL(15,2) DEFAULT 0.00,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Ledger Mutasi Transaksi Wallet
CREATE TABLE `wallet_transactions` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `type` ENUM('debit', 'credit') NOT NULL,
    `amount` DECIMAL(15,2) NOT NULL,
    `balance_after` DECIMAL(15,2) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_wallet_tx_user_date` (`user_id`, `transaction_date`)
) ENGINE=InnoDB;

-- Permintaan Penarikan Dana (Withdrawals)
CREATE TABLE `withdrawals` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `bank_id` CHAR(36) NULL, -- UUID FK
    `amount` DECIMAL(15,2) NOT NULL,
    `admin_fee` DECIMAL(15,2) DEFAULT 0.00,
    `net_amount` DECIMAL(15,2) NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    `flip_transaction_id` VARCHAR(100) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`bank_id`) REFERENCES `user_banks`(`id`) ON DELETE SET NULL,
    INDEX `idx_withdrawals_user` (`user_id`)
) ENGINE=InnoDB;

-- Riwayat Klaim Hadiah / Reward
CREATE TABLE `reward_claims` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `reward_name` VARCHAR(150) NOT NULL,
    `points_required` INT NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'distributed') DEFAULT 'pending',
    `claim_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_reward_claims_user` (`user_id`)
) ENGINE=InnoDB;

-- ==============================================
-- 4. MODUL STOKIS & PIN SERIAL
-- ==============================================

CREATE TABLE `pin_packages` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(15,2) NOT NULL,
    `sponsor_bonus` DECIMAL(15,2) DEFAULT 0.00,
    `pairing_bonus` DECIMAL(15,2) DEFAULT 0.00,
    `points` DECIMAL(15,2) DEFAULT 1.00,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `pins` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `serial_code` VARCHAR(50) NOT NULL UNIQUE,
    `package_id` CHAR(36) NOT NULL, -- UUID FK
    `owner_id` CHAR(36) NOT NULL, -- UUID FK
    `used_by_id` CHAR(36) NULL, -- UUID FK
    `status` ENUM('active', 'used', 'transferred') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `used_at` TIMESTAMP NULL,
    FOREIGN KEY (`package_id`) REFERENCES `pin_packages`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`used_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_pins_owner` (`owner_id`, `status`)
) ENGINE=InnoDB;

CREATE TABLE `pin_transfers` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `pin_id` CHAR(36) NOT NULL, -- UUID FK
    `from_user_id` CHAR(36) NOT NULL, -- UUID FK
    `to_user_id` CHAR(36) NOT NULL, -- UUID FK
    `transferred_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`pin_id`) REFERENCES `pins`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_pin_transfers_from` (`from_user_id`),
    INDEX `idx_pin_transfers_to` (`to_user_id`)
) ENGINE=InnoDB;

-- ==============================================
-- 5. MODUL E-COMMERCE & PRODUK REPEAT ORDER (RO)
-- ==============================================

CREATE TABLE `products` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(15,2) NOT NULL,
    `cogs` DECIMAL(15,2) NOT NULL,
    `stock` INT DEFAULT 0,
    `image_url` VARCHAR(255) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `orders` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `user_id` CHAR(36) NOT NULL, -- UUID FK
    `order_number` VARCHAR(50) NOT NULL UNIQUE,
    `total_amount` DECIMAL(15,2) NOT NULL,
    `status` ENUM('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_orders_user` (`user_id`, `status`)
) ENGINE=InnoDB;

CREATE TABLE `order_items` (
    `id` CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY, -- UUID PK
    `order_id` CHAR(36) NOT NULL, -- UUID FK
    `product_id` CHAR(36) NOT NULL, -- UUID FK
    `quantity` INT NOT NULL,
    `price_at_time` DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
    INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB;
