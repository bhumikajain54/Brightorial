SET FOREIGN_KEY_CHECKS = 0;

-- Campus Drives Table
CREATE TABLE IF NOT EXISTS `campus_drives` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `venue` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `capacity_per_day` int(11) DEFAULT 100,
  `status` enum('draft','live','closed') DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Campus Drive Participating Companies
CREATE TABLE IF NOT EXISTS `campus_drive_companies` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `drive_id` int(10) UNSIGNED NOT NULL,
  `recruiter_id` int(10) UNSIGNED NOT NULL,
  `status` enum('invited','accepted','rejected') DEFAULT 'invited',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`drive_id`) REFERENCES `campus_drives`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Campus Drive Applications
CREATE TABLE IF NOT EXISTS `campus_drive_applications` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `drive_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `recruiter_id` int(10) UNSIGNED NOT NULL,
  `status` enum('applied','shortlisted','rejected','selected') DEFAULT 'applied',
  `applied_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`drive_id`) REFERENCES `campus_drives`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
