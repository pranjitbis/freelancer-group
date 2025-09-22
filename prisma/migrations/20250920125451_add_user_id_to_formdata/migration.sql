/*
  Warnings:

  - You are about to drop the column `phoneno` on the `formdata` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `formData_userId_fkey` ON `formdata`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `formdata` DROP COLUMN `phoneno`,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formData` ADD CONSTRAINT `formData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
