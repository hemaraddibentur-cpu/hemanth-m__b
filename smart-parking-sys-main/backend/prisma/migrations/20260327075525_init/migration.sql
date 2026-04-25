-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'SECURITY', 'FACULTY', 'STAFF', 'STUDENT', 'VISITOR') NOT NULL DEFAULT 'STUDENT',
    `rfid_tag` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `employee_id` VARCHAR(191) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `verification_token` VARCHAR(191) NULL,
    `reset_token` VARCHAR(191) NULL,
    `reset_token_expiry` DATETIME(3) NULL,
    `refresh_token` VARCHAR(191) NULL,
    `avatar_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_rfid_tag_key`(`rfid_tag`),
    UNIQUE INDEX `users_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `license_plate` VARCHAR(191) NOT NULL,
    `vehicle_type` ENUM('CAR', 'BIKE', 'TRUCK', 'SUV', 'VAN') NOT NULL,
    `make` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `rfid_sticker` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_license_plate_key`(`license_plate`),
    UNIQUE INDEX `vehicles_rfid_sticker_key`(`rfid_sticker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parking_zones` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `total_slots` INTEGER NOT NULL,
    `hourly_rate` DOUBLE NOT NULL,
    `daily_rate` DOUBLE NULL,
    `monthly_rate` DOUBLE NULL,
    `rules` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#3B82F6',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `parking_zones_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parking_slots` (
    `id` VARCHAR(191) NOT NULL,
    `zone_id` VARCHAR(191) NOT NULL,
    `slot_number` VARCHAR(191) NOT NULL,
    `slot_type` ENUM('REGULAR', 'HANDICAPPED', 'EV_CHARGING', 'RESERVED_FACULTY', 'COMPACT', 'LARGE') NOT NULL DEFAULT 'REGULAR',
    `floor` INTEGER NOT NULL DEFAULT 1,
    `is_occupied` BOOLEAN NOT NULL DEFAULT false,
    `is_reserved` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `pos_x` DOUBLE NULL,
    `pos_y` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `parking_slots_zone_id_slot_number_key`(`zone_id`, `slot_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `slot_id` VARCHAR(191) NOT NULL,
    `vehicle_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'WAITLISTED') NOT NULL DEFAULT 'PENDING',
    `qr_code` VARCHAR(191) NULL,
    `total_amount` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entry_logs` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `vehicle_id` VARCHAR(191) NOT NULL,
    `entry_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `entry_gate` VARCHAR(191) NULL,
    `entry_photo` VARCHAR(191) NULL,
    `license_plate_captured` VARCHAR(191) NULL,
    `verification_method` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `entry_log_id` VARCHAR(191) NOT NULL,
    `exit_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `exit_gate` VARCHAR(191) NULL,
    `duration` INTEGER NOT NULL,
    `amount_paid` DOUBLE NOT NULL,
    `payment_status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `exit_logs_entry_log_id_key`(`entry_log_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `violations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `vehicle_id` VARCHAR(191) NOT NULL,
    `type` ENUM('OVERSTAY', 'WRONG_ZONE', 'UNAUTHORIZED', 'NO_BOOKING', 'EXPIRED_PASS', 'DOUBLE_PARKING') NOT NULL,
    `description` VARCHAR(191) NULL,
    `fine_amount` DOUBLE NOT NULL,
    `status` ENUM('OPEN', 'FINE_ISSUED', 'PAID', 'DISPUTED', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `evidence` VARCHAR(191) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `method` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'NET_BANKING', 'CASH') NOT NULL DEFAULT 'UPI',
    `transaction_id` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `description` VARCHAR(191) NULL,
    `receipt_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_transaction_id_key`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passes` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `pass_type` ENUM('MONTHLY', 'QUARTERLY', 'SEMESTER', 'ANNUAL') NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `price` DOUBLE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `zone_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'info',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parking_slots` ADD CONSTRAINT `parking_slots_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `parking_zones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `parking_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_logs` ADD CONSTRAINT `entry_logs_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `entry_logs` ADD CONSTRAINT `entry_logs_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exit_logs` ADD CONSTRAINT `exit_logs_entry_log_id_fkey` FOREIGN KEY (`entry_log_id`) REFERENCES `entry_logs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `violations` ADD CONSTRAINT `violations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `violations` ADD CONSTRAINT `violations_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passes` ADD CONSTRAINT `passes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
