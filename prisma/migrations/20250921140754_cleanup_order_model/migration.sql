-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `duration` VARCHAR(191) NULL,
    ADD COLUMN `experienceLevel` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `requirements` VARCHAR(191) NULL,
    ADD COLUMN `resume` VARCHAR(191) NULL,
    ADD COLUMN `subcategory` VARCHAR(191) NULL,
    ADD COLUMN `urgency` VARCHAR(191) NULL DEFAULT 'standard',
    MODIFY `service` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
