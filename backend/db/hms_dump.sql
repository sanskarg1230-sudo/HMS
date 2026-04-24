-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: hms_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_requests`
--

DROP TABLE IF EXISTS `admin_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `hostel_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `room_count` int DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `university_name` varchar(255) DEFAULT NULL,
  `warden_name` varchar(255) NOT NULL,
  `management_type` varchar(255) DEFAULT NULL,
  `hostel_type` varchar(255) DEFAULT NULL,
  `total_rooms` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6qih96t8k373kp0pqpx5abfnd` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_requests`
--

LOCK TABLES `admin_requests` WRITE;
/*!40000 ALTER TABLE `admin_requests` DISABLE KEYS */;
INSERT INTO `admin_requests` VALUES (1,'123 Palm Rd','2026-04-01 13:34:46.320486','alex@state.edu','Sunset Paradise','$2a$10$panFeXEC0u1qENi7XvPSyehVj6NYWrMpAlK0CjJdW5v16NdLobfim','555-1234',10,'APPROVED','State Univ','Alex Vance',NULL,NULL,NULL),(2,'sfaf','2026-04-03 09:46:30.714017','warder1@email.com','Sansakr','$2a$10$kGMhvBc1nWMDNRoeLa9YdueaA7j5n1twiN4/r5E6R5h.eJoni3nee','93838393',32,'REJECTED','sfkal','safa',NULL,NULL,NULL);
/*!40000 ALTER TABLE `admin_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_type` varchar(255) DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `hostel_id` bigint DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'FEE_GENERATED','Generated fee of ₹2000.0 for Johnny Doe (May 2026)',1,'ADMIN','2026-04-03 13:02:45.990965'),(2,'STUDENT_INVITED','Sent invitation to Sanskar Gupta (sanskarg1230@gmail.com)',1,'ADMIN','2026-04-03 13:30:16.206297'),(3,'ROOM_ASSIGNED','Assigned Sanskar Gupta to Room 102',1,'ADMIN','2026-04-03 13:32:47.547796'),(4,'ROOM_ADDED','Added Room 343 (SINGLE)',1,'ADMIN','2026-04-03 13:36:33.790288'),(5,'ROOM_ADDED','Added Room 535 (SINGLE)',1,'ADMIN','2026-04-03 13:36:39.914690'),(6,'ROOM_ADDED','Added Room 785 (SINGLE)',1,'ADMIN','2026-04-03 13:36:46.090688'),(7,'ROOM_ADDED','Added Room 895 (SINGLE)',1,'ADMIN','2026-04-03 13:36:50.838374'),(8,'ROOM_ADDED','Added Room 221 (SINGLE)',1,'ADMIN','2026-04-03 13:37:02.373350'),(9,'STUDENT_INVITED','Sent invitation to sanskar (sanskarg1230@gmail.com)',3,'ADMIN','2026-04-03 15:59:08.647671'),(10,'ROOM_ASSIGNED','Assigned sanskar to Room B101',3,'ADMIN','2026-04-03 16:00:54.793833'),(11,'ROOM_ASSIGNED','Assigned Johnny Doe to Room 102',1,'ADMIN','2026-04-09 06:38:10.214096'),(12,'ROOM_ASSIGNED','Assigned Johnny Doe to Room 102',1,'ADMIN','2026-04-09 06:49:16.721059'),(13,'ROOM_ASSIGNED','Assigned Johnny Doe to Room 101',1,'ADMIN','2026-04-09 06:49:30.448814'),(14,'STUDENT_INVITED','Sent invitation to Sanskar (sanskarg1230@gmail.com)',1,'ADMIN','2026-04-09 06:50:02.586808'),(15,'STUDENT_INVITED','Sent invitation to Sanskar Gupta (sanskar1230@gmail.com)',1,'ADMIN','2026-04-24 16:57:19.461111'),(16,'STUDENT_INVITED','Sent invitation to Sanskar Gupta (sanskarg1230@gmail.com)',1,'ADMIN','2026-04-24 16:58:18.706630');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bug_reports`
--

DROP TABLE IF EXISTS `bug_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bug_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `page_url` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `screenshot` longblob,
  `screenshot_content_type` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bug_reports`
--

LOCK TABLES `bug_reports` WRITE;
/*!40000 ALTER TABLE `bug_reports` DISABLE KEYS */;
INSERT INTO `bug_reports` VALUES (1,'2026-04-24 16:03:20.095086','Their is an bug in assigning room students doesnt apppear their','/admin/dashboard','admin',NULL,NULL,'in_progress','Bug Report','admin@hms.edu',NULL,NULL);
/*!40000 ALTER TABLE `bug_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `hostel_id` bigint NOT NULL,
  `room_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `student_id` bigint NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,'2026-04-03 12:09:57.930932','The water cooler placed at 4th floor is leaking\n',1,'103','RESOLVED',14,'Sanskar Gupta','Tap Broken of Water cooler');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'2026-04-24 15:24:18.835846','sannskarg1230@gmail.com','What are the charges for your platform','Sanskar Gupta','resolved','General Inquiry'),(2,'2026-04-24 15:59:14.302849','sanskarg1230@gmail.com','What are the prices of your serices\n','Sanskar Gupta','resolved','General Inquiry');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_records`
--

DROP TABLE IF EXISTS `fee_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `hostel_id` bigint NOT NULL,
  `month` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `student_id` bigint NOT NULL,
  `student_name` varchar(255) DEFAULT NULL,
  `year` int NOT NULL,
  `currency` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_records`
--

LOCK TABLES `fee_records` WRITE;
/*!40000 ALTER TABLE `fee_records` DISABLE KEYS */;
INSERT INTO `fee_records` VALUES (1,2000,'2026-04-01 13:32:26.653897',1,'March','UNPAID',5,'John Doe',2025,''),(2,2000,'2026-04-01 13:32:26.664145',1,'April','PAID',5,'John Doe',2025,''),(3,2000,'2026-04-03 12:13:07.015692',1,'April','UNPAID',14,'Sanskar Gupta',2026,''),(4,2000,'2026-04-03 13:02:45.978857',1,'May','UNPAID',5,'Johnny Doe',2026,'');
/*!40000 ALTER TABLE `fee_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hostels`
--

DROP TABLE IF EXISTS `hostels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hostels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `hostel_name` varchar(255) NOT NULL,
  `room_count` int DEFAULT NULL,
  `university_name` varchar(255) DEFAULT NULL,
  `warden_email` varchar(255) DEFAULT NULL,
  `warden_phone` varchar(255) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `hostel_type` varchar(255) DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  `warden_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hostels`
--

LOCK TABLES `hostels` WRITE;
/*!40000 ALTER TABLE `hostels` DISABLE KEYS */;
INSERT INTO `hostels` VALUES (1,'123 Campus Road, North Delhi, DL 110007','2026-04-01 13:32:26.554250','Green Campus Hostel',5,'Delhi University','admin@hms.edu','+91 9876543210',NULL,NULL,_binary '\0',4),(2,'123 Palm Rd','2026-04-01 13:37:12.120724','Sunset Paradise',10,'State Univ','alex@state.edu','555-1234',NULL,NULL,NULL,NULL),(3,'Technology Lane, Hauz Khas, New Delhi, DL 110016','2026-04-03 15:06:24.572987','Blue Sky Hostel',2,'IIT Delhi','admin@hms.edu','+91 9999988888',NULL,NULL,_binary '\0',4);
/*!40000 ALTER TABLE `hostels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_menu_items`
--

DROP TABLE IF EXISTS `mess_menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mess_menu_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `day` varchar(255) NOT NULL,
  `food_items` text,
  `meal_type` varchar(255) NOT NULL,
  `week_cycle` int DEFAULT NULL,
  `menu_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiwntb2iclagvq60ua7wcfwxml` (`menu_id`),
  CONSTRAINT `FKiwntb2iclagvq60ua7wcfwxml` FOREIGN KEY (`menu_id`) REFERENCES `mess_menus` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=225 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_menu_items`
--

LOCK TABLES `mess_menu_items` WRITE;
/*!40000 ALTER TABLE `mess_menu_items` DISABLE KEYS */;
INSERT INTO `mess_menu_items` VALUES (113,'MONDAY','poha ','BREAKFAST',1,1),(114,'MONDAY','dd','LUNCH',1,1),(115,'MONDAY','ggggg','SNACKS',1,1),(116,'MONDAY','klnvksfn','DINNER',1,1),(117,'TUESDAY','parathe','BREAKFAST',1,1),(118,'TUESDAY','gb','LUNCH',1,1),(119,'TUESDAY','gg','SNACKS',1,1),(120,'TUESDAY','snsnps','DINNER',1,1),(121,'WEDNESDAY','poha','BREAKFAST',1,1),(122,'WEDNESDAY','gg','LUNCH',1,1),(123,'WEDNESDAY','gew','SNACKS',1,1),(124,'WEDNESDAY','snsbb s','DINNER',1,1),(125,'THURSDAY','vermicili','BREAKFAST',1,1),(126,'THURSDAY','fs','LUNCH',1,1),(127,'THURSDAY','oi','SNACKS',1,1),(128,'THURSDAY','ngjkbs','DINNER',1,1),(129,'FRIDAY','aloo partha','BREAKFAST',1,1),(130,'FRIDAY','f','LUNCH',1,1),(131,'FRIDAY','kb','SNACKS',1,1),(132,'FRIDAY','kke','DINNER',1,1),(133,'SATURDAY','sandwhich','BREAKFAST',1,1),(134,'SATURDAY','d','LUNCH',1,1),(135,'SATURDAY','wm','SNACKS',1,1),(136,'SATURDAY','jr','DINNER',1,1),(137,'SUNDAY','idli','BREAKFAST',1,1),(138,'SUNDAY','wa ','LUNCH',1,1),(139,'SUNDAY','mg','SNACKS',1,1),(140,'SUNDAY','ejk','DINNER',1,1),(141,'MONDAY','svnsoin','BREAKFAST',2,1),(142,'MONDAY','fblf','LUNCH',2,1),(143,'MONDAY','bkjfbf','SNACKS',2,1),(144,'MONDAY','gjrgj','DINNER',2,1),(145,'TUESDAY','sfbnf','BREAKFAST',2,1),(146,'TUESDAY','ffgo','LUNCH',2,1),(147,'TUESDAY','bklnblflbkmbfk','SNACKS',2,1),(148,'TUESDAY','gr gjrgg','DINNER',2,1),(149,'WEDNESDAY','sbf skss ','BREAKFAST',2,1),(150,'WEDNESDAY','vjfj','LUNCH',2,1),(151,'WEDNESDAY','bkfblkf','SNACKS',2,1),(152,'WEDNESDAY','jjgjrk','DINNER',2,1),(153,'THURSDAY','m sfl f','BREAKFAST',2,1),(154,'THURSDAY','vn','LUNCH',2,1),(155,'THURSDAY','fl bfl','SNACKS',2,1),(156,'THURSDAY','j g g','DINNER',2,1),(157,'FRIDAY','sv jsd','BREAKFAST',2,1),(158,'FRIDAY','sdv sd','LUNCH',2,1),(159,'FRIDAY','bflb f','SNACKS',2,1),(160,'FRIDAY','db kb','DINNER',2,1),(161,'SATURDAY','sk vds','BREAKFAST',2,1),(162,'SATURDAY','sd jd','LUNCH',2,1),(163,'SATURDAY','fm ffb f','SNACKS',2,1),(164,'SATURDAY','dl b','DINNER',2,1),(165,'SUNDAY','js','BREAKFAST',2,1),(166,'SUNDAY','dvjbsdd','LUNCH',2,1),(167,'SUNDAY',' bl','SNACKS',2,1),(168,'SUNDAY','bflkffbm f','DINNER',2,1),(169,'MONDAY','poha ','BREAKFAST',1,3),(170,'TUESDAY','parathe','BREAKFAST',1,3),(171,'WEDNESDAY','poha','BREAKFAST',1,3),(172,'THURSDAY','vermicili','BREAKFAST',1,3),(173,'FRIDAY','aloo partha','BREAKFAST',1,3),(174,'SATURDAY','sandwhich','BREAKFAST',1,3),(175,'SUNDAY','idli','BREAKFAST',1,3),(176,'MONDAY','dd','LUNCH',1,3),(177,'TUESDAY','gb','LUNCH',1,3),(178,'WEDNESDAY','gg','LUNCH',1,3),(179,'THURSDAY','fs','LUNCH',1,3),(180,'FRIDAY','f','LUNCH',1,3),(181,'SATURDAY','d','LUNCH',1,3),(182,'SUNDAY','wa ','LUNCH',1,3),(183,'MONDAY','ggggg','SNACKS',1,3),(184,'TUESDAY','gg','SNACKS',1,3),(185,'WEDNESDAY','gew','SNACKS',1,3),(186,'THURSDAY','oi','SNACKS',1,3),(187,'FRIDAY','kb','SNACKS',1,3),(188,'SATURDAY','wm','SNACKS',1,3),(189,'SUNDAY','mg','SNACKS',1,3),(190,'MONDAY','klnvksfn','DINNER',1,3),(191,'TUESDAY','snsnps','DINNER',1,3),(192,'WEDNESDAY','snsbb s','DINNER',1,3),(193,'THURSDAY','ngjkbs','DINNER',1,3),(194,'FRIDAY','kke','DINNER',1,3),(195,'SATURDAY','jr','DINNER',1,3),(196,'SUNDAY','ejk','DINNER',1,3),(197,'MONDAY','svnsoin','BREAKFAST',2,3),(198,'TUESDAY','sfbnf','BREAKFAST',2,3),(199,'WEDNESDAY','sbf skss ','BREAKFAST',2,3),(200,'THURSDAY','m sfl f','BREAKFAST',2,3),(201,'FRIDAY','sv jsd','BREAKFAST',2,3),(202,'SATURDAY','sk vds','BREAKFAST',2,3),(203,'SUNDAY','js','BREAKFAST',2,3),(204,'MONDAY','fblf','LUNCH',2,3),(205,'TUESDAY','ffgo','LUNCH',2,3),(206,'WEDNESDAY','vjfj','LUNCH',2,3),(207,'THURSDAY','vn','LUNCH',2,3),(208,'FRIDAY','sdv sd','LUNCH',2,3),(209,'SATURDAY','sd jd','LUNCH',2,3),(210,'SUNDAY','dvjbsdd','LUNCH',2,3),(211,'MONDAY','bkjfbf','SNACKS',2,3),(212,'TUESDAY','bklnblflbkmbfk','SNACKS',2,3),(213,'WEDNESDAY','bkfblkf','SNACKS',2,3),(214,'THURSDAY','fl bfl','SNACKS',2,3),(215,'FRIDAY','bflb f','SNACKS',2,3),(216,'SATURDAY','fm ffb f','SNACKS',2,3),(217,'SUNDAY',' bl','SNACKS',2,3),(218,'MONDAY','gjrgj','DINNER',2,3),(219,'TUESDAY','gr gjrgg','DINNER',2,3),(220,'WEDNESDAY','jjgjrk','DINNER',2,3),(221,'THURSDAY','j g g','DINNER',2,3),(222,'FRIDAY','db kb','DINNER',2,3),(223,'SATURDAY','dl b','DINNER',2,3),(224,'SUNDAY','bflkffbm f','DINNER',2,3);
/*!40000 ALTER TABLE `mess_menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_menus`
--

DROP TABLE IF EXISTS `mess_menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mess_menus` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `hostel_id` bigint NOT NULL,
  `menu_type` varchar(255) NOT NULL,
  `month` varchar(255) DEFAULT NULL,
  `year` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_menus`
--

LOCK TABLES `mess_menus` WRITE;
/*!40000 ALTER TABLE `mess_menus` DISABLE KEYS */;
INSERT INTO `mess_menus` VALUES (1,'2026-04-03 14:11:42.616542',1,'MONTHLY_CYCLE','April',2026),(3,'2026-04-09 06:52:10.154644',1,'MONTHLY_CYCLE','APRIL',2026);
/*!40000 ALTER TABLE `mess_menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_id` bigint NOT NULL,
  `admin_name` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` date DEFAULT NULL,
  `hostel_id` bigint NOT NULL,
  `is_pinned` bit(1) NOT NULL,
  `message` text NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
INSERT INTO `notices` VALUES (1,4,'Admin User','2026-04-01 13:32:26.675165',NULL,1,_binary '','We\'re happy to have you here. Please read all the hostel rules in the notice board.','Welcome to Green Campus Hostel! (Updated) '),(2,4,'Admin User','2026-04-01 13:32:26.685210',NULL,1,_binary '\0','Monthly fees for April 2025 are due by April 15th. Please pay via the fees section.','Fee Due Date Reminder'),(3,4,'Admin User','2026-04-01 14:05:43.411381',NULL,1,_binary '','We\'re happy to have you here. Please read all the hostel rules in the notice board.','Welcome to Green Campus Hostel! ?'),(4,4,'Admin User','2026-04-03 12:13:41.647797',NULL,1,_binary '\0','All students are requested to pay the fees for the month of april\n','Fee Payment Notice'),(5,4,'Admin User','2026-04-03 14:53:43.513014',NULL,1,_binary '\0','Join us for a cultural night this Friday at 7 PM in the main courtyard. Snacks provided!','Hostel Night Event ?');
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_71lqwbwtklmljk3qlsugr1mig` (`token`),
  UNIQUE KEY `UK_la2ts67g4oh2sreayswhox1i6` (`user_id`),
  CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requested_hostels`
--

DROP TABLE IF EXISTS `requested_hostels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requested_hostels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `hostel_name` varchar(255) NOT NULL,
  `hostel_type` varchar(255) DEFAULT NULL,
  `total_rooms` int DEFAULT NULL,
  `admin_request_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKprgft5i6g7viinhvg2tt0j4fp` (`admin_request_id`),
  CONSTRAINT `FKprgft5i6g7viinhvg2tt0j4fp` FOREIGN KEY (`admin_request_id`) REFERENCES `admin_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requested_hostels`
--

LOCK TABLES `requested_hostels` WRITE;
/*!40000 ALTER TABLE `requested_hostels` DISABLE KEYS */;
/*!40000 ALTER TABLE `requested_hostels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assigned_student_id` bigint DEFAULT NULL,
  `capacity` int NOT NULL,
  `hostel_id` bigint NOT NULL,
  `occupied` bit(1) NOT NULL,
  `room_number` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `occupant_count` int NOT NULL,
  `is_ac` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,5,1,1,_binary '','101','SINGLE',1,_binary '\0'),(2,NULL,1,1,_binary '\0','102','SINGLE',0,_binary '\0'),(3,16,2,1,_binary '\0','103','DOUBLE',1,_binary '\0'),(4,NULL,2,1,_binary '\0','104','DOUBLE',0,_binary '\0'),(5,NULL,3,1,_binary '\0','105','TRIPLE',0,_binary '\0'),(6,NULL,1,2,_binary '\0','101','SINGLE',0,_binary '\0'),(7,NULL,1,2,_binary '\0','102','SINGLE',0,_binary '\0'),(8,NULL,1,2,_binary '\0','103','SINGLE',0,_binary '\0'),(9,NULL,1,2,_binary '\0','104','SINGLE',0,_binary '\0'),(10,NULL,1,2,_binary '\0','105','SINGLE',0,_binary '\0'),(11,NULL,1,2,_binary '\0','106','SINGLE',0,_binary '\0'),(12,NULL,1,2,_binary '\0','107','SINGLE',0,_binary '\0'),(13,NULL,1,2,_binary '\0','108','SINGLE',0,_binary '\0'),(14,NULL,1,2,_binary '\0','109','SINGLE',0,_binary '\0'),(15,NULL,1,2,_binary '\0','110','SINGLE',0,_binary '\0'),(17,NULL,4,1,_binary '\0','202','Four Seater',0,_binary ''),(18,NULL,5,1,_binary '\0','505','Five',0,_binary ''),(19,NULL,1,1,_binary '\0','343','SINGLE',0,_binary '\0'),(20,NULL,1,1,_binary '\0','535','SINGLE',0,_binary '\0'),(21,NULL,1,1,_binary '\0','785','SINGLE',0,_binary '\0'),(22,NULL,1,1,_binary '\0','895','SINGLE',0,_binary '\0'),(23,NULL,1,1,_binary '\0','221','SINGLE',0,_binary '\0'),(24,17,1,3,_binary '','B101','SINGLE',1,_binary '\0'),(25,NULL,2,3,_binary '\0','B102','DOUBLE',0,_binary '\0');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_address`
--

DROP TABLE IF EXISTS `student_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_address` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address_line` varchar(500) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `pincode` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_mwifv4t2o9e79h4t5ljfdp463` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_address`
--

LOCK TABLES `student_address` WRITE;
/*!40000 ALTER TABLE `student_address` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_documents`
--

DROP TABLE IF EXISTS `student_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_note` varchar(500) DEFAULT NULL,
  `document_type` varchar(255) NOT NULL,
  `file_path` varchar(1000) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `stored_filename` varchar(255) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `verified_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_documents`
--

LOCK TABLES `student_documents` WRITE;
/*!40000 ALTER TABLE `student_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_invites`
--

DROP TABLE IF EXISTS `student_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_invites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `hostel_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `room_id` bigint DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ij6xawp0ob2yp8vxdx556l0b4` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_invites`
--

LOCK TABLES `student_invites` WRITE;
/*!40000 ALTER TABLE `student_invites` DISABLE KEYS */;
INSERT INTO `student_invites` VALUES (9,'2026-04-03 12:04:35.094189','sanskarg1230@gmail.com','2026-04-05 12:04:35.090191',1,'Sanskar Gupta',NULL,'ACTIVATED','14050d6b-42cf-41dd-8ced-05d85395d057'),(10,'2026-04-03 13:30:16.182990','sanskarg1230@gmail.com','2026-04-05 13:30:16.172702',1,'Sanskar Gupta',NULL,'ACTIVATED','84ba8349-caf4-48ef-bedd-37ff7552f652'),(11,'2026-04-03 15:59:08.629959','sanskarg1230@gmail.com','2026-04-05 15:59:08.623624',3,'sanskar',NULL,'ACTIVATED','f0e55f08-fd21-42cd-9394-ae7a1f600795'),(14,'2026-04-24 16:58:18.700451','sanskarg1230@gmail.com','2026-04-26 16:58:18.700452',1,'Sanskar Gupta',NULL,'PENDING','cb52f966-217e-43d3-9f72-94e634b4c81d');
/*!40000 ALTER TABLE `student_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leave`
--

DROP TABLE IF EXISTS `student_leave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_leave` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actioned_by` varchar(255) DEFAULT NULL,
  `admin_note` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `from_date` varchar(255) NOT NULL,
  `reason` varchar(1000) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `student_id` bigint NOT NULL,
  `to_date` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leave`
--

LOCK TABLES `student_leave` WRITE;
/*!40000 ALTER TABLE `student_leave` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_leave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_medical`
--

DROP TABLE IF EXISTS `student_medical`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_medical` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allergies` varchar(1000) DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `doctor_contact` varchar(255) DEFAULT NULL,
  `medical_conditions` varchar(1000) DEFAULT NULL,
  `medications` varchar(1000) DEFAULT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_69396x804l6ehsrmxknqjsm75` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_medical`
--

LOCK TABLES `student_medical` WRITE;
/*!40000 ALTER TABLE `student_medical` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_medical` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_parents`
--

DROP TABLE IF EXISTS `student_parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_parents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `guardian_name` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `parent_email` varchar(255) DEFAULT NULL,
  `parent_phone` varchar(255) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ics9bg7jdqv05a8redv84fg8m` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_parents`
--

LOCK TABLES `student_parents` WRITE;
/*!40000 ALTER TABLE `student_parents` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_parents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profile`
--

DROP TABLE IF EXISTS `student_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profile` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `join_date` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `university` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_6ijt5eprw9x4rhrk9glqy1bol` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profile`
--

LOCK TABLES `student_profile` WRITE;
/*!40000 ALTER TABLE `student_profile` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `hostel_id` bigint DEFAULT NULL,
  `room_id` bigint DEFAULT NULL,
  `management_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'Admin User','admin@hms.edu','$2a$10$mFcyZovQ96S1CoyWUt6p1eRjb9gWxxu6wD0gFZLpODbt7tYOk7VH.','admin','2026-03-31 09:34:17',1,NULL,NULL),(5,'Johnny Doe','student@hms.edu','$2a$10$97c/SyfbX.h4g1zyF3rOo.asT6t8mFCFyTKGZBYDWFKcsZIrFaMSK','student','2026-03-31 09:34:18',1,1,NULL),(7,'Super Admin','superadmin@hms.edu','$2a$10$0uXjY1YobTwFylxvTxDpJuezHFrYiPJVaQO0ecG/5x60Y6GmfUwi.','super_admin','2026-04-01 13:32:27',NULL,NULL,NULL),(12,'Super Admin','super@hms.com','$2a$10$vwXUsxm5.J7OIztArPuyCujIFa/gqGXwmNfWyM6RYcBCi1QS42qSy','super_admin','2026-04-03 10:59:42',NULL,NULL,NULL),(13,'Test Admin','admin@hms.com','$2a$10$K/tK9P1wpXs6jH.2W5T.weDDpOKP.Nob0qZ4xrBZScnZRKGgAlpN.','admin','2026-04-03 10:59:42',1,NULL,NULL),(16,'Jane Smith','jane@hms.edu','$2a$10$Sty/N9WvuAjl1ePB2PRGX.l/Jo9tQb3TSfjzn5It7RdP04St0GkQq','student','2026-04-03 14:53:43',1,3,'SINGLE');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25  1:12:12
