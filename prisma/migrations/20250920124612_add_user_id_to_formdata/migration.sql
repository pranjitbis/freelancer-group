/*
  Warnings:

  - You are about to drop the column `specificService` on the `formdata` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `formdata` DROP COLUMN `specificService`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
