-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: quotation_kitchen
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories_item_master`
--

DROP TABLE IF EXISTS `categories_item_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories_item_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` varchar(10) DEFAULT NULL,
  `category_name` varchar(150) DEFAULT NULL,
  `sub_category` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `sessionLogCat_id` int(150) DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `loginUserName` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_sessionLogCat_id` (`sessionLogCat_id`),
  CONSTRAINT `fk_sessionLogCat_id` FOREIGN KEY (`sessionLogCat_id`) REFERENCES `userslogin` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories_item_master`
--

LOCK TABLES `categories_item_master` WRITE;
/*!40000 ALTER TABLE `categories_item_master` DISABLE KEYS */;
INSERT INTO `categories_item_master` VALUES (31,'CAT31','CABINET','Cabinet','CABINET','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:19:37'),(32,'CAT32','SHUTTER','shutter','shutters','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:20:13'),(33,'CAT33','OTHERS','handles','handles','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:20:28'),(35,'CAT35','OTHERS','Drawer','DRAWERs','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:21:18'),(36,'CAT36','OTHERS','Others','Others','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:22:31'),(37,'CAT37','OTHERS','liftup','liftups','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-04 10:30:00'),(39,'CAT39','OTHER-CABINET','OTHER CABINET','OTHER CABINET','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-15 10:50:49'),(40,'CAT40','FREE-ITEM','FREE ITEM','FREE ITEM','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-16 04:53:45'),(41,'CAT41','OTHERS','handle','new','active',57,'Signet Kitchen Studio','Anand Bhavsar','2024-10-18 04:09:23');
/*!40000 ALTER TABLE `categories_item_master` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_category_insert` BEFORE INSERT ON `categories_item_master` FOR EACH ROW BEGIN
    SET @next_id = (SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'categories_item_master');
    SET NEW.category_id = CONCAT('CAT', @next_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_name` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `state_id` int(11) DEFAULT NULL,
  `state_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (4,'PUNE','active',NULL,'Maharashtra');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNo` varchar(15) DEFAULT NULL,
  `landline` varchar(15) DEFAULT NULL,
  `companyPhoneNo` varchar(15) DEFAULT NULL,
  `companyLandline` varchar(15) DEFAULT NULL,
  `companyType` varchar(100) DEFAULT NULL,
  `gstIN` varchar(20) DEFAULT NULL,
  `bankDetails` varchar(255) DEFAULT NULL,
  `ifscCode` varchar(20) DEFAULT NULL,
  `companyAddress` varchar(180) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `district` varchar(150) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (current_timestamp() - interval 2 day),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `accountNo` varchar(120) DEFAULT NULL,
  `companyLogo` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `users_allowed` int(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `userslogin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (63,'Kalkisoft Web Development','Milind','Bhavsar','Kalkisoft1@gmail.com','0205646564','0265443546','0253413456','0205474541','Regular_business','JDFHGR34343','Canara Bank','CAN000007458','Shop 1/2, Pinnak Memories, Karve Rd, Phase 2, Kothrud, Pune, Maharashtra','India','Maharashtra','Pune','Pune','411024','2024-06-27 18:30:00','2024-07-03 13:13:04','2346665401','1719550608054.png',56,3,'2023-07-27','2025-07-27','active'),(66,'Signet Kitchen Studio','Anand','Bhavsar','nabyteknashik@gmail.com','9850508642','9850508642','9850508642','9850508642','Regular_business','null','Hdfc Bank Ltd Indira Nagar, Nashik','HDFC0000878','Shop no. A-3, Uttam Tower, Ground Floor, Sharanpur Road, Nashik - 422001','India','Maharashtra','Nashik','Nashik','422001','2024-06-27 18:30:00','2025-10-17 05:36:45','50200027839517','uploads\\1760679405584.jpg',57,10,'2024-04-01','2025-09-30','active');
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_send_data`
--

DROP TABLE IF EXISTS `email_send_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_send_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) DEFAULT NULL,
  `recipientEmail` varchar(255) DEFAULT NULL,
  `senderEmail` varchar(255) DEFAULT NULL,
  `companyEmail` varchar(255) DEFAULT NULL,
  `companyName` varchar(255) DEFAULT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `superAdmin_name` varchar(255) DEFAULT NULL,
  `superAdminId` int(11) DEFAULT NULL,
  `User_id` int(11) DEFAULT NULL,
  `quotationId` int(11) DEFAULT NULL,
  `companyId` int(11) DEFAULT NULL,
  `businessName` varchar(255) DEFAULT NULL,
  `serviceNames` varchar(255) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_send_data`
--

LOCK TABLES `email_send_data` WRITE;
/*!40000 ALTER TABLE `email_send_data` DISABLE KEYS */;
INSERT INTO `email_send_data` VALUES (36,'quotation_XYZ_ID-510.pdf','aaaaaaa@gmail.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','Signet Kitchen Studio','Anand Bhavsar','Milind Bhavsar',56,57,510,66,'XYZ','3 Drawer','2024-10-21 09:12:43'),(37,'quotation_XYZ_ID-515.pdf','aaaaaaa@gmail.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','Signet Kitchen Studio','Anand Bhavsar','Milind Bhavsar',56,57,515,66,'XYZ','handle dup','2024-11-09 07:39:10'),(38,'quotation_test 03_ID-517.pdf','testfdfa@gmail.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','Signet Kitchen Studio','Anand Bhavsar','Milind Bhavsar',56,57,517,66,'test 03','2 drawer','2024-11-09 09:58:47'),(39,'quotation_Unknown_ID-516.pdf','default@example.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','Signet Kitchen Studio','Anand Bhavsar','Milind Bhavsar',56,57,516,66,'Unknown','2 drawer','2024-11-09 09:58:53'),(40,'quotation_test 03_ID-521.pdf','testfdfa@gmail.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','Signet Kitchen Studio','Anand Bhavsar','Milind Bhavsar',56,57,521,66,'test 03','3 Drawer','2024-11-18 06:11:38');
/*!40000 ALTER TABLE `email_send_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiry`
--

DROP TABLE IF EXISTS `enquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `contact_number` bigint(20) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `product_service` varchar(100) DEFAULT NULL,
  `select_state` varchar(255) DEFAULT NULL,
  `select_city` varchar(255) DEFAULT NULL,
  `status_main` varchar(255) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `reference` enum('socialMedia','portal','personalContact','others') DEFAULT NULL,
  `other_reference` varchar(200) DEFAULT NULL,
  `other_personal_contact` varchar(200) DEFAULT NULL,
  `other_portal_name` varchar(150) DEFAULT NULL,
  `other_personal_reference` varchar(150) DEFAULT NULL,
  `gst_in` varchar(200) DEFAULT NULL,
  `select_socialMedia` enum('Facebook','WhatsApp','Instagram','Telegram','LinkedIn','Quora') DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `createdOn` timestamp NOT NULL DEFAULT current_timestamp(),
  `timeline` varchar(100) DEFAULT NULL,
  `budget` varchar(155) DEFAULT NULL,
  `select_customer` varchar(155) DEFAULT NULL,
  `lead_qualification` enum('coldLeads','warmLeads','hotLeads','qualifiedLeads') DEFAULT NULL,
  `loginenq_id` int(100) DEFAULT NULL,
  `updatedOn` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `loginUserName` varchar(150) DEFAULT NULL,
  `quotationMailSend` enum('yes','no') DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `role` enum('superadmin','manager','executive') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enquiry_ibfk_1` (`user_id`),
  KEY `fk_loginenq_id` (`loginenq_id`),
  CONSTRAINT `enquiry_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loginenq_id` FOREIGN KEY (`loginenq_id`) REFERENCES `userslogin` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiry`
--

LOCK TABLES `enquiry` WRITE;
/*!40000 ALTER TABLE `enquiry` DISABLE KEYS */;
INSERT INTO `enquiry` VALUES (82,'aaa',2222222222,'aaaaaa','XYZ','product','Chhattisgarh','222','Follow Up','aaa','aaaaaaa@gmail.com','socialMedia','','',NULL,NULL,'222','Instagram',NULL,'2024-08-09 18:30:00','2024-08-09T18:30:00.000Z','666','{\"id\":82,\"name\":\"aaa\"}','coldLeads',57,'2024-11-09 10:24:30','Anand Bhavsar','yes','Signet Kitchen Studio','superadmin'),(85,'aaa',2222222222,'aaaaaa','XYZ','product','Chhattisgarh','222','Confirmed','aaa','aaaaaaa@gmail.com','personalContact','','aaaaa','','','222','',NULL,'2024-09-18 18:30:00','2024-09-18T18:30:00.000Z','12000','{\"id\":82,\"name\":\"aaa\"}','hotLeads',57,'2024-09-30 04:16:49','Anand Bhavsar','yes','Signet Kitchen Studio','superadmin'),(86,'Akash Gupta',8745214785,'R Roy','test 03','','Chhattisgarh','Pune','Completed','sr  erev erree erer','testfdfa@gmail.com','socialMedia','','','','','7474VBG54','Instagram',NULL,'2024-10-07 05:37:46','2024-10-10T18:30:00.000Z','12333','{\"id\":182,\"name\":\"Akash Gupta\"}','warmLeads',57,'2024-11-09 09:58:47','Anand Bhavsar','yes','Signet Kitchen Studio','superadmin'),(94,'DDDDDDDDDD',0,'SDSDSD','','','Chhattisgarh','ER','Meeting','D','XDXS@GMAIL.CO','','','','','','','',NULL,'2024-11-09 07:04:49','','','{\"id\":189,\"name\":\"DDDDDDDDDD\"}','',57,'2024-11-09 10:24:51','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(95,'DDDDDDDDDD',0,'SDSDSD','','','Chhattisgarh','ER','Completed','D','XDXS@GMAIL.CO','','','','','','','',NULL,'2024-11-09 07:47:24','','','{\"id\":189,\"name\":\"DDDDDDDDDD\"}','',57,'2024-11-09 09:22:08','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(96,'DSFDF',0,'','','','','','Meeting','3','','','','','','','','',NULL,'2024-11-09 10:47:41','','','{\"id\":194,\"name\":\"DSFDF\"}','',57,'2024-11-09 10:48:19','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(98,'Akash Gupta',2222222222,'aaaaaa','XYZ','','Chhattisgarh','222',NULL,'aaa','aaaaaaa@gmail.com','','','','','','222','',NULL,'2024-11-18 06:08:34','','','{\"id\":82,\"name\":\"Akash Gupta\"}','',57,'2024-11-18 06:08:34','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(99,'Akash Gupta',2222222222,'aaaaaa','XYZ','','Chhattisgarh','222','Quotation Send','aaa','aaaaaaa@gmail.com','','','','','','222','',NULL,'2024-11-18 06:09:04','2024-11-18T18:30:00.000Z','','{\"id\":82,\"name\":\"Akash Gupta\"}','',57,'2025-07-07 10:49:28','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(101,'Q',NULL,'','','','','',NULL,'1','','portal','','','12','','',NULL,NULL,'2024-12-16 05:52:25','2024-12-16T18:30:00.000Z','Q21','{\"id\":200,\"name\":\"Q\"}','coldLeads',57,'2024-12-16 05:52:25','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin'),(102,'sanika',9876543345,'ramesh','om ent','','Maharashtra','pune','Note','kothrud','sanika@gmail.com','socialMedia','','','','','1','Instagram',NULL,'2025-07-25 05:19:30','2025-07-28T18:30:00.000Z','200','{\"id\":203,\"name\":\"sanika\"}','warmLeads',57,'2025-07-25 05:20:44','Anand Bhavsar',NULL,'Signet Kitchen Studio','superadmin');
/*!40000 ALTER TABLE `enquiry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquiry_master`
--

DROP TABLE IF EXISTS `enquiry_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiry_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status_name` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `SessionMaster_id` int(20) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `login_company` varchar(200) DEFAULT NULL,
  `role` enum('superadmin','manager','executive') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_session_master` (`SessionMaster_id`),
  CONSTRAINT `fk_session_master` FOREIGN KEY (`SessionMaster_id`) REFERENCES `userslogin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquiry_master`
--

LOCK TABLES `enquiry_master` WRITE;
/*!40000 ALTER TABLE `enquiry_master` DISABLE KEYS */;
/*!40000 ALTER TABLE `enquiry_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enquirydetail`
--

DROP TABLE IF EXISTS `enquirydetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquirydetail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enquiryId` int(11) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `remark` varchar(250) DEFAULT NULL,
  `status` varchar(120) DEFAULT NULL,
  `time` varchar(100) DEFAULT NULL,
  `member_files` varchar(255) DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `role` enum('superadmin','manager','executive') DEFAULT NULL,
  `loginUserName` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enquiryId` (`enquiryId`),
  CONSTRAINT `enquirydetail_ibfk_1` FOREIGN KEY (`enquiryId`) REFERENCES `enquiry` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=335 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enquirydetail`
--

LOCK TABLES `enquirydetail` WRITE;
/*!40000 ALTER TABLE `enquirydetail` DISABLE KEYS */;
INSERT INTO `enquirydetail` VALUES (304,82,'2024-08-07','FOLLOW','Follow Up','2024-08-10T11:50',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(310,82,'2024-08-14','TODAY MEET','Meeting','2024-08-16T12:04',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(315,85,'2024-09-19','fpll','Follow Up','2024-09-20T16:25',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(316,85,'2024-09-30','confirmed','Confirmed','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(317,86,'2024-10-13','eree','Follow Up','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(318,86,'2024-10-15','sfdt','Note','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(319,86,'2024-10-16','rde','Note','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(320,86,'2024-10-16','adsrewrwer','Meeting','2024-10-21T11:35',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(321,86,'2024-10-18','dfger6456e4','Work in Progress','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(322,86,'2024-10-19','r3233423','Note','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(323,86,'2024-10-20','uyj','Note','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(324,86,'2024-11-09','jj','Completed','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(325,95,'2024-11-09','kjhj','Completed','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(326,82,'2024-11-09','foll','Follow Up','2024-11-09T15:54',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(327,94,'2024-11-09','meet','Meeting','2024-11-08T15:54',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(328,96,'2024-11-10','MEET','Meeting','2024-11-10T16:18',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(333,99,'2025-07-19','test','Quotation Send','2025-07-15T16:23',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar'),(334,102,'2025-07-30','TEST','Note','',NULL,'Signet Kitchen Studio','superadmin','Anand Bhavsar');
/*!40000 ALTER TABLE `enquirydetail` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_status_main_after_delete` AFTER DELETE ON `enquirydetail` FOR EACH ROW BEGIN
    DECLARE last_status VARCHAR(255);

    -- Get the last status from the remaining rows after deletion
    SELECT status INTO last_status
    FROM enquirydetail
    WHERE enquiryId = OLD.enquiryId
    ORDER BY date DESC
    LIMIT 1;

    -- Update the status_main column in enquiry table
    UPDATE enquiry
    SET status_main = last_status
    WHERE id = OLD.enquiryId;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `person_descriptions`
--

DROP TABLE IF EXISTS `person_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `person_descriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `contact_person2` varchar(120) DEFAULT NULL,
  `contact_number2` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `person_descriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person_descriptions`
--

LOCK TABLES `person_descriptions` WRITE;
/*!40000 ALTER TABLE `person_descriptions` DISABLE KEYS */;
INSERT INTO `person_descriptions` VALUES (21,82,'SAHIL','6365656666'),(22,82,'YOGESH','6566666666'),(40,189,'DFDFDF',''),(49,190,'RTRFTRTRT','5555555555');
/*!40000 ALTER TABLE `person_descriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation`
--

DROP TABLE IF EXISTS `quotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quotation` (
  `quotation_id` int(11) NOT NULL AUTO_INCREMENT,
  `item_quotation` int(11) DEFAULT NULL,
  `quotation_date` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `consignee_address` varchar(255) DEFAULT NULL,
  `gstin_no` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `transport` varchar(20) DEFAULT NULL,
  `discount` varchar(150) DEFAULT NULL,
  `discountedAmount` varchar(100) DEFAULT NULL,
  `IGST` varchar(100) DEFAULT NULL,
  `igstAmount` varchar(100) DEFAULT NULL,
  `cgst` varchar(100) DEFAULT NULL,
  `cgstAmount` varchar(100) DEFAULT NULL,
  `sgst` varchar(100) DEFAULT NULL,
  `sgstAmount` varchar(100) DEFAULT NULL,
  `total_quantity` varchar(100) DEFAULT NULL,
  `total_rate` varchar(100) DEFAULT NULL,
  `total_amount` varchar(100) DEFAULT NULL,
  `grand_total` decimal(20,4) DEFAULT NULL,
  `integrated_amount` decimal(20,4) DEFAULT NULL,
  `other_charges` decimal(20,2) DEFAULT NULL,
  `special_discount` varchar(100) DEFAULT NULL,
  `special_discount_remark` varchar(1000) DEFAULT NULL,
  `special_discount_total` varchar(100) DEFAULT NULL,
  `discounted_total_amount_display` varchar(150) DEFAULT NULL,
  `grand_total_in_words` varchar(100) DEFAULT NULL,
  `remark` varchar(1000) DEFAULT NULL,
  `select_customer` varchar(300) DEFAULT NULL,
  `business_name` varchar(150) DEFAULT NULL,
  `agent_commission` varchar(100) DEFAULT NULL,
  `amount_show_hide` varchar(150) DEFAULT NULL,
  `loginserquot_id` int(100) DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `loginUserName` varchar(150) DEFAULT NULL,
  `role` enum('superadmin','manager','executive') DEFAULT NULL,
  `is_coppied` varchar(200) DEFAULT NULL,
  `type_of_commission` varchar(200) DEFAULT NULL,
  `copy_remark` varchar(1000) DEFAULT NULL,
  `companyLogoOne` varchar(1000) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`quotation_id`),
  KEY `fk_loginserquot_id` (`loginserquot_id`),
  CONSTRAINT `fk_loginserquot_id` FOREIGN KEY (`loginserquot_id`) REFERENCES `userslogin` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=896 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation`
--

LOCK TABLES `quotation` WRITE;
/*!40000 ALTER TABLE `quotation` DISABLE KEYS */;
INSERT INTO `quotation` VALUES (889,17,'24-07-2025','','Kapil Sharma','pna','','','2025-07-24 10:44:19','2855555555','','0','','0.00','','0.00','','0.00','','0.00','29.00','4684.00','2653.48',2653.4800,2653.4800,0.00,'0','','0.00','2653.48','Two Thousand Six Hundred Fifty Three and forty eight Paise','1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. <br>2. Production Time -- 45 Days After Order Confirmatiion. <br>3. Installation Time --- 5 Days On Site. <br>4. Tax- 18 % Gst Is Extra Or As Applicable. <br>5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer <br>6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. <br>7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. <br>8. 30 Days For Installation After Granite, Wall Tiles Work. <br>9. Once Order Placed Cannot Be Cancelled Or Refunded. <br>10. Quotation Valid For 30 Days From Date Of Issue.','{\"id\":201,\"name\":\"Kapil Sharma\"}','','0','hideAmount',57,'Signet Kitchen Studio','Anand Bhavsar','superadmin','','','','[]','2025-07-24 10:44:19'),(891,18,'24-07-2025','neha','BHARAT','SD','','','2025-07-24 11:39:45','2111111111','','0','','0.00','','0.00','','0.00','','0.00','30.00','5165.00','4512.50',4512.5000,4512.5000,0.00,'0','','0.00','4512.50','Four Thousand Five Hundred Twelve and fifty Paise','1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. <br>2. Production Time -- 45 Days After Order Confirmatiion. <br>3. Installation Time --- 5 Days On Site. <br>4. Tax- 18 % Gst Is Extra Or As Applicable. <br>5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer <br>6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. <br>7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. <br>8. 30 Days For Installation After Granite, Wall Tiles Work. <br>9. Once Order Placed Cannot Be Cancelled Or Refunded. <br>10. Quotation Valid For 30 Days From Date Of Issue.','{\"id\":202,\"name\":\"BHARAT\"}','','0','showAmount',57,'Signet Kitchen Studio','Anand Bhavsar','superadmin','','','','[]','2025-07-24 11:40:13'),(893,19,'24-07-2025','aaaaaa','Akash Gupta','aaa','222','Chhattisgarh','2025-07-24 12:05:22','7723162331','aaaaaaa@gmail.com','0','','0.00','','0.00','','0.00','','0.00','30.00','4989.00','8079.91',7271.9200,8079.9100,0.00,'10','','807.99','7271.92','Seven Thousand Two Hundred Seventy One and ninety two Paise','1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. <br>2. Production Time -- 45 Days After Order Confirmatiion. <br>3. Installation Time --- 5 Days On Site. <br>4. Tax- 18 % Gst Is Extra Or As Applicable. <br>5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer <br>6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. <br>7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. <br>8. 30 Days For Installation After Granite, Wall Tiles Work. <br>9. Once Order Placed Cannot Be Cancelled Or Refunded. <br>10. Quotation Valid For 30 Days From Date Of Issue.','{\"id\":82,\"name\":\"Akash Gupta\"}','XYZ','0','showAmount',57,'Signet Kitchen Studio','Anand Bhavsar','superadmin','','','','[]','2025-10-16 09:20:37'),(894,20,'25-07-2025','ramesh','sanika','kothrud','1','Maharashtra','2025-07-25 05:22:40','9903456789','sanika@gmail.com','0','','0.00','','0.00','','0.00','','0.00','2.00','353.00','253.00',253.0000,253.0000,0.00,'0','TEST','0.00','253.00','Two Hundred Fifty Three','1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. <br>2. Production Time -- 45 Days After Order Confirmatiion. <br>3. Installation Time --- 5 Days On Site. <br>4. Tax- 18 % Gst Is Extra Or As Applicable. <br>5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer <br>6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. <br>7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. <br>8. 30 Days For Installation After Granite, Wall Tiles Work. <br>9. Once Order Placed Cannot Be Cancelled Or Refunded. <br>10. Quotation Valid For 30 Days From Date Of Issue.','{\"id\":203,\"name\":\"sanika\"}','om ent','0','showAmount',57,'Signet Kitchen Studio','Anand Bhavsar','superadmin','','','','[]','2025-07-25 05:27:01'),(895,21,'30-07-2025','SDSDSD','DDDDDDDDDD','D','','Chhattisgarh','2025-07-30 06:52:56','3333333333','XDXS@GMAIL.CO','0','','0.00','','0.00','','0.00','','0.00','27.00','4253.00','2335.50',2335.5000,2335.5000,0.00,'0','','0.00','2335.50','Two Thousand Three Hundred Thirty Five and fifty Paise','1. Payment Term -- 70% Advance With Purchase Order, 20% Before Dispatch & 10% After Installation Of Site. <br>2. Production Time -- 45 Days After Order Confirmatiion. <br>3. Installation Time --- 5 Days On Site. <br>4. Tax- 18 % Gst Is Extra Or As Applicable. <br>5. Above Quotation Does Not Inclued Granite, Cement, Cement Sheet, Sand, Fridge, Chimaney Hob, Ovens, Sink, Tab Any Civil Labour Charges, Tiels, Plumbing Work and Food Disposer <br>6. We Only Provide Electrical, Plumbing, Wall Tiles 2d Drawing. <br>7. If You Want Electrical, Plumbing Marking On Site Than, Rs 2000/- Will Be Visiting Charges Which Is Not Included In Quotation. <br>8. 30 Days For Installation After Granite, Wall Tiles Work. <br>9. Once Order Placed Cannot Be Cancelled Or Refunded. <br>10. Quotation Valid For 30 Days From Date Of Issue.','{\"id\":189,\"name\":\"DDDDDDDDDD\"}','','0','showAmount',57,'Signet Kitchen Studio','Anand Bhavsar','superadmin','','','','[]','2025-07-30 06:52:56');
/*!40000 ALTER TABLE `quotation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_insert_quotation` BEFORE INSERT ON `quotation` FOR EACH ROW BEGIN
    DECLARE max_item_quotation INT;

    -- Get the maximum item_quotation value
    SELECT COALESCE(MAX(item_quotation), 0) INTO max_item_quotation FROM quotation;

    -- Set the new item_quotation to max + 1
    SET NEW.item_quotation = max_item_quotation + 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `quotations_descriptions`
--

DROP TABLE IF EXISTS `quotations_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quotations_descriptions` (
  `quotationdesc_id` int(11) NOT NULL AUTO_INCREMENT,
  `quotation_id` int(11) DEFAULT NULL,
  `item_name` varchar(150) DEFAULT NULL,
  `item_category` varchar(150) DEFAULT NULL,
  `itemDescription` varchar(555) DEFAULT NULL,
  `hsn_code` varchar(120) DEFAULT NULL,
  `quantity` varchar(120) DEFAULT NULL,
  `rate` varchar(120) DEFAULT NULL,
  `initial_discount` varchar(50) DEFAULT NULL,
  `initial_sgst` varchar(50) DEFAULT NULL,
  `initial_cgst` varchar(50) DEFAULT NULL,
  `initial_igst` varchar(50) DEFAULT NULL,
  `amount` decimal(20,4) DEFAULT NULL,
  `free_item_amount` varchar(120) DEFAULT NULL,
  `select_service` varchar(400) DEFAULT NULL,
  `purchase_price` varchar(150) DEFAULT NULL,
  `shelves_count` varchar(150) DEFAULT NULL,
  `al_profile` varchar(150) DEFAULT NULL,
  `multitop_profile` varchar(150) DEFAULT NULL,
  `plastic_clip` varchar(150) DEFAULT NULL,
  `valleyht_profile` varchar(150) DEFAULT NULL,
  `area_shutter` varchar(150) DEFAULT NULL,
  `shutter_area_other` varchar(150) DEFAULT NULL,
  `safeTotalShutterArea` varchar(150) DEFAULT NULL,
  `add_extra_area` varchar(150) DEFAULT NULL,
  `free_item_desc` varchar(300) DEFAULT NULL,
  `row_commission` varchar(150) DEFAULT NULL,
  `unit_of_measurement` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`quotationdesc_id`),
  KEY `quotations_descriptions_ibfk_1` (`quotation_id`),
  CONSTRAINT `fk_quotation_id` FOREIGN KEY (`quotation_id`) REFERENCES `quotation` (`quotation_id`) ON DELETE CASCADE,
  CONSTRAINT `quotations_descriptions_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotation` (`quotation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations_descriptions`
--

LOCK TABLES `quotations_descriptions` WRITE;
/*!40000 ALTER TABLE `quotations_descriptions` DISABLE KEYS */;
INSERT INTO `quotations_descriptions` VALUES (1551,889,'3 Drawer Cabinet','CABINET','Good cabinet 3','http://localhost:3000/1728104044413.jpeg','1','253','hideAmount','100','100','1',136.8500,'',NULL,'130','5','0','0','0','0','8.00','','8.00118403022162','','','0','Sq. ft'),(1552,889,'2 drawer','CABINET','good 2','http://localhost:3000/1728104133101.jpeg','1','253','hideAmount','1','1','1',1.7200,'',NULL,'130','4','0.2','0.3','0.5','0.4','8.00','','8.00118403022162','','','0','Nos.'),(1553,889,'shutter 1','SHUTTER','shutter good','http://localhost:3000/1728104194597.JPG','1','253','hideAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','0','0','0','0','0','8.00','','','','','0','Others'),(1554,889,'other1','OTHERS','xcv','http://localhost:3000/1728104242902.JPG','1','253','hideAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Others'),(1555,889,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','hideAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Pair'),(1556,889,'lift no. 25','OTHERS','new data ','http://localhost:3000/1728104392268.webp','1','25','hideAmount',NULL,NULL,NULL,25.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Set'),(1557,889,'liftuppppp','OTHERS','l1','http://localhost:3000/1728105690501.JPG','1','253','hideAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(1558,889,'handle dup','OTHERS','AQ','http://localhost:3000/1728103174292.jpeg','1','120','hideAmount',NULL,NULL,NULL,120.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(1559,889,'cabinet 3 drawer test','CABINET','','http://localhost:3000/1728884501864.jpeg','1','253','hideAmount','1','1','1',0.4200,'',NULL,'130','5','0','0','0','0.4','8.00','','8.00118403022162','','','0','Nos.'),(1560,889,'3 drawer cabinet test','CABINET','','http://localhost:3000/1728884553658.jpeg','1','253','hideAmount','1','1','1',0.4200,'',NULL,'130','5','0','0','0','0.4','8.00','','8.00118403022162','','','0','R. mtr'),(1561,889,'2 drawer cabinet test','CABINET','','http://localhost:3000/1728884605762.jpeg','1','253','hideAmount','1','1','1',0.6200,'',NULL,'130','4','0.2','0','0','0.4','8.00','','8.00118403022162','','','0','Set'),(1562,889,'2 drawer cabinet','CABINET','2 drawer cabinet testing','http://localhost:3000/1728884731906.jpeg','1','253','hideAmount','1','1','1',0.0200,'',NULL,'130','4','0','0','0','0','8.00','','8.00118403022162','','','0','Sq. ft'),(1563,889,'S Corner-Cabinet','OTHER-CABINET','Corner Cabinet','http://localhost:3000/1728991718990.jpeg','1','253','hideAmount','1','1','1',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8.00118403022162','','','0','Set'),(1564,889,'OTHER CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1729930243648.jpeg','1','253','hideAmount','1','1','1',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8.00118403022162','','','0','Others'),(1565,889,'BLANK ITEM','FREE-ITEM','','http://localhost:3000/1736313652831.jpeg','1','0','hideAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1566,889,'3 drawer 900x600x7000','CABINET','new arrival....','http://localhost:3000/1736313640727.jpeg','1','253','hideAmount','1','1','1',0.4200,'',NULL,'130','5','0','0','0','0.4','8.00','0','8.00118403022162','','','0','R. mtr'),(1567,889,'BASE CABINET','CABINET','','http://localhost:3000/1753255494675.webp','1','100','hideAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1568,889,'BASE 1 DRAWER CABINET','OTHERS','','http://localhost:3000/1753258909693.jpg','1','100','hideAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(1569,889,'BASE THALI OUT CABINET','CABINET','','http://localhost:3000/1753259089398.webp','1','100','hideAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1570,889,'BASE CARROUALL CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259227684.webp','1','123','hideAmount','1','1','1',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1571,889,'BASE MAGIC CORNER CABINET','OTHERS','','http://localhost:3000/1753259289379.jpg','1','100','hideAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(1572,889,'WALL AQUA CABINET','CABINET','','http://localhost:3000/1753259384043.jpg','1','100','hideAmount','1','1','1',0.0100,'',NULL,'0','3','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1573,889,'WALL BLIND CORNER CABINET','OTHERS','','http://localhost:3000/1753259499638.webp','1','90','hideAmount',NULL,NULL,NULL,90.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(1574,889,'WALL L-CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259574687.webp','1','89','hideAmount','1','1','1',89.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1575,889,'TALL BUILT IN FRIDGE CABINET','OTHER-CABINET','','http://localhost:3000/1753259654743.jpg','1','123','hideAmount','1','1','1',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Others'),(1576,889,'TALL UNIT WOODEN BASE','CABINET','','http://localhost:3000/1753259738935.jpg','1','100','hideAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8.00118403022162','','','0','Nos.'),(1577,889,'ROLLING SHUTTER CABINET','OTHERS','','http://localhost:3000/1753259822718.jpg','1','100','hideAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(1578,889,'J HANDLE','OTHERS','','http://localhost:3000/1753259904756.jpg','1','100','hideAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Set'),(1579,889,'lift no. 25','OTHERS','new data ','http://localhost:3000/1728104392268.webp','1','25','hideAmount',NULL,NULL,NULL,25.0000,'','{\"service_id\":291,\"service_name\":\"lift no. 25\",\"item_name\":\"lift no. 25\",\"item_category\":\"OTHERS\",\"select_category\":\"OTHERS\",\"select_sub_category\":\"liftup\",\"itemDescription\":\"new data \",\"selling_price\":\"25\",\"purchase_price\":\"0\",\"companyLogo\":\"1728104392268.webp\",\"unit_of_measurement\":\"Set\",\"shelves_count\":\"2\",\"al_profile\":\"0\",\"multitop_profile\":\"0\",\"plastic_clip\":\"0\",\"valleyht_profile\":\"0\",\"shutte','0','2','0','0','0','0','8.00','0','8.00118403022162','0','','0','Set'),(1761,891,'3 Drawer Cabinet','CABINET','Good cabinet 3','http://localhost:3000/1728104044413.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0','8.00','','8','','','0','Sq. ft'),(1762,891,'2 drawer','CABINET','good 2','http://localhost:3000/1728104133101.jpeg','1','253','showAmount','0','0','0',0.5000,'',NULL,'130','4','0.2','0.3','0.5','0.4','8.00','','8','','','0','Nos.'),(1763,891,'shutter 1','SHUTTER','shutter good','http://localhost:3000/1728104194597.JPG','1','253','showAmount',NULL,NULL,NULL,2024.0000,'',NULL,'0','0','0','0','0','0','8.00','','8','','','0','Others'),(1764,891,'other1','OTHERS','xcv','http://localhost:3000/1728104242902.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Others'),(1765,891,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Pair'),(1766,891,'lift no. 25','OTHERS','new data ','http://localhost:3000/1728104392268.webp','1','25','showAmount',NULL,NULL,NULL,25.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Set'),(1767,891,'liftuppppp','OTHERS','l1','http://localhost:3000/1728105690501.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(1768,891,'handle dup','OTHERS','AQ','http://localhost:3000/1728103174292.jpeg','1','120','showAmount',NULL,NULL,NULL,120.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(1769,891,'cabinet 3 drawer test','CABINET','','http://localhost:3000/1728884501864.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','','8','','','0','Nos.'),(1770,891,'3 drawer cabinet test','CABINET','','http://localhost:3000/1728884553658.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','','8','','','0','R. mtr'),(1771,891,'2 drawer cabinet test','CABINET','','http://localhost:3000/1728884605762.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','4','0.2','0','0','0.4','8.00','','8','','','0','Set'),(1772,891,'2 drawer cabinet','CABINET','2 drawer cabinet testing','http://localhost:3000/1728884731906.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','4','0','0','0','0','8.00','','8','','','0','Sq. ft'),(1773,891,'S Corner-Cabinet','OTHER-CABINET','Corner Cabinet','http://localhost:3000/1728991718990.jpeg','1','253','showAmount','0','0','0',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8','','','0','Set'),(1774,891,'OTHER CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1729930243648.jpeg','1','253','showAmount','0','0','0',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8','','','0','Others'),(1775,891,'BLANK ITEM','FREE-ITEM','','http://localhost:3000/1736313652831.jpeg','1','0','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1776,891,'3 drawer 900x600x7000','CABINET','new arrival....','http://localhost:3000/1736313640727.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','0','8','','','0','R. mtr'),(1777,891,'BASE CABINET','CABINET','','http://localhost:3000/1753255494675.webp','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1778,891,'BASE 1 DRAWER CABINET','OTHERS','','http://localhost:3000/1753258909693.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(1779,891,'BASE THALI OUT CABINET','CABINET','','http://localhost:3000/1753259089398.webp','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1780,891,'BASE CARROUALL CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259227684.webp','1','123','showAmount','0','0','0',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1781,891,'BASE MAGIC CORNER CABINET','OTHERS','','http://localhost:3000/1753259289379.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(1782,891,'WALL AQUA CABINET','CABINET','','http://localhost:3000/1753259384043.jpg','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','3','0','0','0','0','8.00','0','8','','','0','Nos.'),(1783,891,'WALL BLIND CORNER CABINET','OTHERS','','http://localhost:3000/1753259499638.webp','1','90','showAmount',NULL,NULL,NULL,90.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(1784,891,'WALL L-CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259574687.webp','1','89','showAmount','0','0','0',89.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1785,891,'TALL BUILT IN FRIDGE CABINET','OTHER-CABINET','','http://localhost:3000/1753259654743.jpg','1','123','showAmount','0','0','0',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Others'),(1786,891,'TALL UNIT WOODEN BASE','CABINET','','http://localhost:3000/1753259738935.jpg','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(1787,891,'ROLLING SHUTTER CABINET','OTHERS','','http://localhost:3000/1753259822718.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(1788,891,'J HANDLE','OTHERS','','http://localhost:3000/1753259904756.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Set'),(1789,891,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','showAmount',NULL,NULL,NULL,253.0000,'','{\"service_id\":290,\"service_name\":\"drawer 1\",\"item_name\":\"drawer 1\",\"item_category\":\"OTHERS\",\"select_category\":\"OTHERS\",\"select_sub_category\":\"Drawer\",\"itemDescription\":\"d1\",\"selling_price\":\"253\",\"purchase_price\":\"0\",\"companyLogo\":\"1728104282988.jpeg\",\"unit_of_measurement\":\"Pair\",\"shelves_count\":\"2\",\"al_profile\":\"0\",\"multitop_profile\":\"0\",\"plastic_clip\":\"0\",\"valleyht_profile\":\"0\",\"shutter_area_othe','0','2','0','0','0','0','8.00','0','','0','','0','Pair'),(1790,891,'3 Drawer Cabinet','CABINET','Good cabinet 3','http://localhost:3000/1728104044413.jpeg','1','253','showAmount','0','0','0',0.0000,'','{\"service_id\":286,\"service_name\":\"3 Drawer Cabinet\",\"item_name\":\"3 Drawer Cabinet\",\"item_category\":\"CABINET\",\"select_category\":\"CABINET\",\"select_sub_category\":\"Cabinet\",\"itemDescription\":\"Good cabinet 3\",\"selling_price\":\"253\",\"purchase_price\":\"130\",\"companyLogo\":\"1728104044413.jpeg\",\"unit_of_measurement\":\"Sq. ft\",\"shelves_count\":\"5\",\"al_profile\":\"0\",\"multitop_profile\":\"0\",\"plastic_clip\":\"0\",\"valle','130','5','0','0','0','0','8.00','0','8','0','','0','Sq. ft'),(2036,894,'WALL AQUA CABINET','CABINET','','http://localhost:3000/1753259384043.jpg','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','3','0','0','0','0','0.00','0','0','','','0','Nos.'),(2037,894,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','showAmount',NULL,NULL,NULL,253.0000,'','{\"service_id\":290,\"service_name\":\"drawer 1\",\"item_name\":\"drawer 1\",\"item_category\":\"OTHERS\",\"select_category\":\"OTHERS\",\"select_sub_category\":\"Drawer\",\"itemDescription\":\"d1\",\"selling_price\":\"253\",\"purchase_price\":\"0\",\"companyLogo\":\"1728104282988.jpeg\",\"unit_of_measurement\":\"Pair\",\"shelves_count\":\"2\",\"al_profile\":\"0\",\"multitop_profile\":\"0\",\"plastic_clip\":\"0\",\"valleyht_profile\":\"0\",\"shutter_area_othe','0','2','0','0','0','0','0.00','0','','0','','0','Pair'),(2038,895,'2 drawer','CABINET','good 2','http://localhost:3000/1728104133101.jpeg','1','253','showAmount','0','0','0',0.5000,'',NULL,'130','4','0.2','0.3','0.5','0.4','8.00','','8','','','0','Nos.'),(2039,895,'other1','OTHERS','xcv','http://localhost:3000/1728104242902.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Others'),(2040,895,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Pair'),(2041,895,'lift no. 25','OTHERS','new data ','http://localhost:3000/1728104392268.webp','1','25','showAmount',NULL,NULL,NULL,25.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Set'),(2042,895,'liftuppppp','OTHERS','l1','http://localhost:3000/1728105690501.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(2043,895,'handle dup','OTHERS','AQ','http://localhost:3000/1728103174292.jpeg','1','120','showAmount',NULL,NULL,NULL,120.0000,'',NULL,'0','2','0','0','0','0','8.00','','','','','0','Sq. ft'),(2044,895,'cabinet 3 drawer test','CABINET','','http://localhost:3000/1728884501864.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','','8','','','0','Nos.'),(2045,895,'3 drawer cabinet test','CABINET','','http://localhost:3000/1728884553658.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','','8','','','0','R. mtr'),(2046,895,'2 drawer cabinet test','CABINET','','http://localhost:3000/1728884605762.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','4','0.2','0','0','0.4','8.00','','8','','','0','Set'),(2047,895,'2 drawer cabinet','CABINET','2 drawer cabinet testing','http://localhost:3000/1728884731906.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','4','0','0','0','0','8.00','','8','','','0','Sq. ft'),(2048,895,'S Corner-Cabinet','OTHER-CABINET','Corner Cabinet','http://localhost:3000/1728991718990.jpeg','1','253','showAmount','0','0','0',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8','','','0','Set'),(2049,895,'OTHER CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1729930243648.jpeg','1','253','showAmount','0','0','0',253.0000,'',NULL,'0','2','0','0','0','0','8.00','4','8','','','0','Others'),(2050,895,'BLANK ITEM','FREE-ITEM','','http://localhost:3000/1736313652831.jpeg','1','0','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2051,895,'3 drawer 900x600x7000','CABINET','new arrival....','http://localhost:3000/1736313640727.jpeg','1','253','showAmount','0','0','0',0.0000,'',NULL,'130','5','0','0','0','0.4','8.00','0','8','','','0','R. mtr'),(2052,895,'BASE CABINET','CABINET','','http://localhost:3000/1753255494675.webp','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2053,895,'BASE 1 DRAWER CABINET','OTHERS','','http://localhost:3000/1753258909693.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(2054,895,'BASE THALI OUT CABINET','CABINET','','http://localhost:3000/1753259089398.webp','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2055,895,'BASE CARROUALL CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259227684.webp','1','123','showAmount','0','0','0',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2056,895,'BASE MAGIC CORNER CABINET','OTHERS','','http://localhost:3000/1753259289379.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(2057,895,'WALL AQUA CABINET','CABINET','','http://localhost:3000/1753259384043.jpg','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','3','0','0','0','0','8.00','0','8','','','0','Nos.'),(2058,895,'WALL BLIND CORNER CABINET','OTHERS','','http://localhost:3000/1753259499638.webp','1','90','showAmount',NULL,NULL,NULL,90.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Nos.'),(2059,895,'WALL L-CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259574687.webp','1','89','showAmount','0','0','0',89.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2060,895,'TALL BUILT IN FRIDGE CABINET','OTHER-CABINET','','http://localhost:3000/1753259654743.jpg','1','123','showAmount','0','0','0',123.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Others'),(2061,895,'TALL UNIT WOODEN BASE','CABINET','','http://localhost:3000/1753259738935.jpg','1','100','showAmount','0','0','0',0.0000,'',NULL,'0','2','0','0','0','0','8.00','0','8','','','0','Nos.'),(2062,895,'ROLLING SHUTTER CABINET','OTHERS','','http://localhost:3000/1753259822718.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Others'),(2063,895,'J HANDLE','OTHERS','','http://localhost:3000/1753259904756.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','8.00','0','','','','0','Set'),(2064,895,'Base','OTHERS','','http://localhost:3000/1753791265872.webp','1','100','showAmount',NULL,NULL,NULL,100.0000,'','{\"service_id\":349,\"service_name\":\"Base\",\"item_name\":\"Base\",\"item_category\":\"OTHERS\",\"select_category\":\"OTHERS\",\"select_sub_category\":\"handle\",\"itemDescription\":\"\",\"selling_price\":\"100\",\"purchase_price\":\"0\",\"companyLogo\":\"1753791265872.webp\",\"unit_of_measurement\":\"Others\",\"shelves_count\":\"2\",\"al_profile\":\"0\",\"multitop_profile\":\"0\",\"plastic_clip\":\"0\",\"valleyht_profile\":\"0\",\"shutter_area_other\":\"0\"}','0','2','0','0','0','0','8.00','0','8','0','','0','Others'),(2095,893,'3 Drawer Cabinet','CABINET','Good cabinet 3','http://localhost:3000/1728104044413.jpeg','1','253','showAmount','100','100','100',204.6200,'',NULL,'130','5','0','0','0','0','10.43','','10.430631791601742','','','0','Sq. ft'),(2096,893,'2 drawer','CABINET','good 2','http://localhost:3000/1728104133101.jpeg','1','253','showAmount','1','1','1',1.7200,'',NULL,'130','4','0.2','0.3','0.5','0.4','10.43','','10.430631791601742','','','0','Nos.'),(2097,893,'shutter 1','SHUTTER','shutter good','http://localhost:3000/1728104194597.JPG','1','253','showAmount',NULL,NULL,NULL,2638.9500,'',NULL,'0','0','0','0','0','0','10.43','','10.430631791601742','','','0','Others'),(2098,893,'other1','OTHERS','xcv','http://localhost:3000/1728104242902.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','10.43','','','','','0','Others'),(2099,893,'drawer 1','OTHERS','d1','http://localhost:3000/1728104282988.jpeg','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','10.43','','','','','0','Pair'),(2100,893,'lift no. 25','OTHERS','new data ','http://localhost:3000/1728104392268.webp','1','25','showAmount',NULL,NULL,NULL,25.0000,'',NULL,'0','2','0','0','0','0','10.43','','','','','0','Set'),(2101,893,'liftuppppp','OTHERS','l1','http://localhost:3000/1728105690501.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'',NULL,'0','2','0','0','0','0','10.43','','','','','0','Sq. ft'),(2102,893,'handle dup','OTHERS','AQ','http://localhost:3000/1728103174292.jpeg','1','120','showAmount',NULL,NULL,NULL,120.0000,'',NULL,'0','2','0','0','0','0','10.43','','','','','0','Sq. ft'),(2103,893,'cabinet 3 drawer test','CABINET','','http://localhost:3000/1728884501864.jpeg','1','253','showAmount','1','1','1',0.4200,'',NULL,'130','5','0','0','0','0.4','10.43','','10.430631791601742','','','0','Nos.'),(2104,893,'3 drawer cabinet test','CABINET','','http://localhost:3000/1728884553658.jpeg','1','253','showAmount','1','1','1',0.4200,'',NULL,'130','5','0','0','0','0.4','10.43','','10.430631791601742','','','0','R. mtr'),(2105,893,'2 drawer cabinet test','CABINET','','http://localhost:3000/1728884605762.jpeg','1','253','showAmount','1','1','1',0.6200,'',NULL,'130','4','0.2','0','0','0.4','10.43','','10.430631791601742','','','0','Set'),(2106,893,'2 drawer cabinet','CABINET','2 drawer cabinet testing','http://localhost:3000/1728884731906.jpeg','1','253','showAmount','1','1','1',0.0200,'',NULL,'130','4','0','0','0','0','10.43','','10.430631791601742','','','0','Sq. ft'),(2107,893,'S Corner-Cabinet','OTHER-CABINET','Corner Cabinet','http://localhost:3000/1728991718990.jpeg','1','253','showAmount','1','1','1',253.0000,'',NULL,'0','2','0','0','0','0','10.43','4','10.430631791601742','','','0','Set'),(2108,893,'OTHER CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1729930243648.jpeg','1','253','showAmount','1','1','1',253.0000,'',NULL,'0','2','0','0','0','0','10.43','4','10.430631791601742','','','0','Others'),(2109,893,'BLANK ITEM','FREE-ITEM','','http://localhost:3000/1736313652831.jpeg','1','0','showAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','10.43','0','10.430631791601742','','','0','Nos.'),(2110,893,'BASE 1 DRAWER CABINET','OTHERS','','http://localhost:3000/1753258909693.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','10.43','0','','','','0','Others'),(2111,893,'BASE THALI OUT CABINET','CABINET','','http://localhost:3000/1753259089398.webp','1','100','showAmount','1','1','1',0.0000,'',NULL,'0','2','0','0','0','0','10.43','0','10.430631791601742','','','0','Nos.'),(2112,893,'BASE MAGIC CORNER CABINET','OTHERS','','http://localhost:3000/1753259289379.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','10.43','0','','','','0','Nos.'),(2113,893,'WALL AQUA CABINET','CABINET','','http://localhost:3000/1753259384043.jpg','1','100','showAmount','1','1','1',0.0100,'',NULL,'0','3','0','0','0','0','10.43','0','10.430631791601742','','','0','Nos.'),(2114,893,'WALL BLIND CORNER CABINET','OTHERS','','http://localhost:3000/1753259499638.webp','1','90','showAmount',NULL,NULL,NULL,90.0000,'',NULL,'0','2','0','0','0','0','10.43','0','','','','0','Nos.'),(2115,893,'WALL L-CORNER CABINET','OTHER-CABINET','','http://localhost:3000/1753259574687.webp','1','89','showAmount','1','1','11',89.0000,'',NULL,'0','2','0','0','0','0','10.43','0','10.430631791601742','','','0','Nos.'),(2116,893,'TALL BUILT IN FRIDGE CABINET','OTHER-CABINET','','http://localhost:3000/1753259654743.jpg','1','123','showAmount','1','1','1',123.0000,'',NULL,'0','2','0','0','0','0','10.43','0','10.430631791601742','','','0','Others'),(2117,893,'TALL UNIT WOODEN BASE','CABINET','','http://localhost:3000/1753259738935.jpg','1','100','showAmount','100','100','100',43.0600,'',NULL,'0','2','0','0','0','0','10.43','0','10.430631791601742','','','0','Nos.'),(2118,893,'ROLLING SHUTTER CABINET','OTHERS','','http://localhost:3000/1753259822718.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','10.43','0','','','','0','Others'),(2119,893,'J HANDLE','OTHERS','','http://localhost:3000/1753259904756.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'',NULL,'0','2','0','0','0','0','10.43','0','','','','0','Set'),(2120,893,'other1','OTHERS','xcv','http://localhost:3000/1728104242902.JPG','1','253','showAmount',NULL,NULL,NULL,253.0000,'','{}','0','2','0','0','0','0','10.43','0','8.000118403022165','0','','0','Others'),(2121,893,'BASE CABINET','CABINET','','http://localhost:3000/1753255494675.webp','1','100','showAmount','100','100','100',43.0600,'','{}','0','2','0','0','0','0','10.43','0','10.430631791601742','0','','0','Nos.'),(2122,893,'TALL UNIT WOODEN BASE','CABINET','','http://localhost:3000/1753259738935.jpg','1','100','showAmount','100','100','100',43.0600,'','{}','0','2','0','0','0','0','10.43','0','10.430631791601742','0','','0','Nos.'),(2123,893,'J HANDLE','OTHERS','','http://localhost:3000/1753259904756.jpg','1','100','showAmount',NULL,NULL,NULL,100.0000,'','{}','0','2','0','0','0','0','10.43','0','','0','','0','Set'),(2124,893,'shutter 1','SHUTTER','shutter good','http://localhost:3000/1728104194597.JPG','1','253','showAmount',NULL,NULL,NULL,2638.9500,'','{}','0','0','0','0','0','0','10.43','0','10.430631791601742','2','','0','Others');
/*!40000 ALTER TABLE `quotations_descriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_descriptions`
--

DROP TABLE IF EXISTS `service_descriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_descriptions` (
  `description_id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) DEFAULT NULL,
  `service_description` varchar(280) DEFAULT NULL,
  PRIMARY KEY (`description_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `fk_service_id` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`)
) ENGINE=InnoDB AUTO_INCREMENT=167 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_descriptions`
--

LOCK TABLES `service_descriptions` WRITE;
/*!40000 ALTER TABLE `service_descriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_descriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `service_id` int(150) NOT NULL AUTO_INCREMENT,
  `select_category` varchar(255) DEFAULT NULL,
  `select_sub_category` varchar(150) DEFAULT NULL,
  `shelves_count` varchar(50) DEFAULT NULL,
  `selling_price` varchar(50) DEFAULT NULL,
  `purchase_price` varchar(50) DEFAULT NULL,
  `al_profile` varchar(20) DEFAULT NULL,
  `multitop_profile` varchar(280) DEFAULT NULL,
  `plastic_clip` varchar(20) DEFAULT NULL,
  `valleyht_profile` varchar(30) DEFAULT NULL,
  `shutter_area_other` varchar(30) DEFAULT NULL,
  `selectedOption` varchar(255) DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `service_desc` varchar(280) DEFAULT NULL,
  `created_at` date DEFAULT curdate(),
  `basic_purchase_price` varchar(100) DEFAULT NULL,
  `unit_of_measurement` enum('R. mtr','Nos.','Pair','Set','Sq. ft','Others') DEFAULT NULL,
  `loginSessionSer_id` int(150) DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `loginUserName` varchar(150) DEFAULT NULL,
  `companyLogo` varchar(220) DEFAULT NULL,
  `priceB` decimal(10,2) NOT NULL,
  PRIMARY KEY (`service_id`),
  KEY `fk_loginSessionSer_id` (`loginSessionSer_id`),
  CONSTRAINT `fk_loginSessionSer_id` FOREIGN KEY (`loginSessionSer_id`) REFERENCES `userslogin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=350 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (284,'CXEWDC','XF','ZX C','DFS','DFDF',NULL,'DFE',NULL,NULL,NULL,'XCD',NULL,NULL,'0000-00-00',NULL,NULL,NULL,NULL,NULL,NULL,0.00),(286,'CABINET','Cabinet','5','253','130','0','0','0','0','',NULL,'3 Drawer Cabinet','Good cabinet 3','2024-10-05','3','Sq. ft',57,'Signet Kitchen Studio','Anand Bhavsar','1728104044413.jpeg',0.00),(287,'CABINET','Cabinet','4','253','130','0.2','0.3','0.5','0.4',NULL,NULL,'2 drawer','good 2','2024-10-05','2','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1728104133101.jpeg',0.00),(288,'SHUTTER','shutter','0','253','0','0','0','0','0',NULL,NULL,'shutter 1','shutter good','2024-10-05','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1728104194597.JPG',0.00),(289,'OTHERS','Others','2','253','0','0','0','0','0',NULL,NULL,'other1','xcv','2024-10-05','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1728104242902.JPG',0.00),(290,'OTHERS','Drawer','2','253','0','0','0','0','0',NULL,NULL,'drawer 1','d1','2024-10-05','0','Pair',57,'Signet Kitchen Studio','Anand Bhavsar','1728104282988.jpeg',0.00),(291,'OTHERS','liftup','2','25','0','0','0','0','0',NULL,NULL,'lift no. 25','new data ','2024-10-05','0','Set',57,'Signet Kitchen Studio','Anand Bhavsar','1728104392268.webp',0.00),(292,'OTHERS','liftup','2','253','0','0','0','0','0',NULL,NULL,'liftuppppp','l1','2024-10-05','0','Sq. ft',57,'Signet Kitchen Studio','Anand Bhavsar','1728105690501.JPG',0.00),(293,'OTHERS','handles','2','120','0','0','0','0','0',NULL,NULL,'handle dup','AQ','2024-10-05','0','Sq. ft',57,'Signet Kitchen Studio','Anand Bhavsar','1728103174292.jpeg',0.00),(294,'CABINET','Cabinet','5','253','130','0','0','0','0.4',NULL,NULL,'cabinet 3 drawer test','','2024-10-14','3','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1728884501864.jpeg',0.00),(295,'CABINET','Cabinet','5','253','130','0','0','0','0.4','',NULL,'3 drawer cabinet test','','2024-10-14','3','R. mtr',57,'Signet Kitchen Studio','Anand Bhavsar','1728884553658.jpeg',0.00),(296,'CABINET','Cabinet','4','253','130','0.2','0','0','0.4',NULL,NULL,'2 drawer cabinet test','','2024-10-14','2','Set',57,'Signet Kitchen Studio','Anand Bhavsar','1728884605762.jpeg',0.00),(297,'CABINET','Cabinet','4','253','130','0','0','0','0',NULL,NULL,'2 drawer cabinet','2 drawer cabinet testing','2024-10-14','2','Sq. ft',57,'Signet Kitchen Studio','Anand Bhavsar','1728884731906.jpeg',0.00),(298,'OTHER-CABINET','OTHER CABINET','2','253','0','0','0','0','0','4',NULL,'S Corner-Cabinet','Corner Cabinet','2024-10-15','0','Set',57,'Signet Kitchen Studio','Anand Bhavsar','1728991718990.jpeg',0.00),(299,'OTHER-CABINET','OTHER CABINET','2','253','0','0','0','0','0','4',NULL,'OTHER CORNER CABINET','','2024-10-26','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1729930243648.jpeg',0.00),(300,'FREE-ITEM','FREE ITEM','2','0','0','0','0','0','0','0',NULL,'BLANK ITEM','','2024-12-14','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1736313652831.jpeg',0.00),(301,'CXCXC','XCXC','X','X','C','D','D',NULL,NULL,NULL,NULL,NULL,NULL,'0000-00-00',NULL,NULL,NULL,NULL,NULL,NULL,0.00),(302,'CABINET','Cabinet','5','253','130','0','0','0','0.4','0',NULL,'3 drawer 900x600x7000','new arrival....','2024-12-16','3','R. mtr',57,'Signet Kitchen Studio','Anand Bhavsar','1736313640727.jpeg',0.00),(303,'XXCXC',' CCXF',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'0000-00-00',NULL,NULL,NULL,NULL,NULL,NULL,0.00),(336,'CABINET','Cabinet','2','100','0','0','0','0','0','0',NULL,'BASE CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753255494675.webp',100.00),(337,'OTHERS','Drawer','2','100','0','0','0','0','0','0',NULL,'BASE 1 DRAWER CABINET','','2025-07-23','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1753258909693.jpg',100.00),(338,'CABINET','Cabinet','2','100','0','0','0','0','0','0',NULL,'BASE THALI OUT CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259089398.webp',10.00),(339,'OTHER-CABINET','OTHER CABINET','2','123','0','0','0','0','0','0',NULL,'BASE CARROUALL CORNER CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259227684.webp',124.00),(340,'OTHERS','Others','2','100','0','0','0','0','0','0',NULL,'BASE MAGIC CORNER CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259289379.jpg',150.00),(341,'CABINET','Cabinet','3','100','0','0','0','0','0','0',NULL,'WALL AQUA CABINET','','2025-07-23','1','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259384043.jpg',78.00),(342,'OTHERS','Others','2','90','0','0','0','0','0','0',NULL,'WALL BLIND CORNER CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259499638.webp',80.00),(343,'OTHER-CABINET','OTHER CABINET','2','89','0','0','0','0','0','0',NULL,'WALL L-CORNER CABINET','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259574687.webp',90.00),(344,'OTHER-CABINET','OTHER CABINET','2','123','0','0','0','0','0','0',NULL,'TALL BUILT IN FRIDGE CABINET','','2025-07-23','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1753259654743.jpg',123.00),(345,'CABINET','Cabinet','2','100','0','0','0','0','0','0',NULL,'TALL UNIT WOODEN BASE','','2025-07-23','0','Nos.',57,'Signet Kitchen Studio','Anand Bhavsar','1753259738935.jpg',90.00),(346,'OTHERS','Drawer','2','100','0','0','0','0','0','0',NULL,'ROLLING SHUTTER CABINET','','2025-07-23','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1753259822718.jpg',100.00),(347,'OTHERS','handles','2','100','0','0','0','0','0','0',NULL,'J HANDLE','','2025-07-23','0','Set',57,'Signet Kitchen Studio','Anand Bhavsar','1753259904756.jpg',123.00),(349,'OTHERS','handle','2','100','0','0','0','0','0','0',NULL,'Base','','2025-07-29','0','Others',57,'Signet Kitchen Studio','Anand Bhavsar','1753791265872.webp',100.00);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state_name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (2,'Maharashtra',''),(3,'UK','active');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_city_state_name` AFTER UPDATE ON `states` FOR EACH ROW BEGIN
    UPDATE cities
    SET state_name = NEW.state_name
    WHERE state_id = NEW.id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `owner_mobile` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact_number` varchar(100) DEFAULT NULL,
  `business_name` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `pincode` varchar(100) DEFAULT NULL,
  `gst_in` varchar(100) DEFAULT NULL,
  `landline_no` varchar(100) DEFAULT NULL,
  `login_id` int(100) DEFAULT NULL,
  `superadmin_id` int(100) DEFAULT NULL,
  `login_company` varchar(200) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `loginUserName` varchar(150) DEFAULT NULL,
  `role` enum('superadmin','manager','executive') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_login_id` (`login_id`),
  CONSTRAINT `fk_login_id` FOREIGN KEY (`login_id`) REFERENCES `userslogin` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (82,'Akash Gupta','7723162331','aaaaaaa@gmail.com','2222222222','XYZ','aaaaaa','Chhattisgarh','222','aaa','222222','222','2222222222',57,56,'Signet Kitchen Studio','2024-09-24 09:27:48','Anand Bhavsar','superadmin'),(92,'Testing 01','0000000000','Testing1212@gmail.com','0000000000','Testing 010','Testing 012','Chhattisgarh','Testing 000','Testing 01Testing 01','000000','','0000000000',57,56,'Signet Kitchen Studio','2024-09-25 06:47:22','Anand Bhavsar','superadmin'),(181,'Testing 0111','0111011101','Testingyf0111@gmail.com','8745896587','Testing 012 0111','A Sharma 0111','Chhattisgarh','Pune','pune -address new 0111','411047','45FFG40111','2025784122',57,56,'Signet Kitchen Studio','2024-10-05 11:39:51','Anand Bhavsar','superadmin'),(182,'Akash Gupta 001','5784525896','testfdfa@gmail.com','8745214785','test 03','R Roy','Chhattisgarh','Pune','pune -address','411074','7474VBG54','2025789655',57,56,'Signet Kitchen Studio','2024-10-05 11:39:51','Anand Bhavsar','superadmin'),(189,'DDDDDDDDDD','3333333333','XDXS@GMAIL.CO','','','SDSDSD','Chhattisgarh','ER','D','','','',57,56,'Signet Kitchen Studio','2024-10-10 11:20:07','Anand Bhavsar','superadmin'),(190,'FDDFDF','4444444444','CF5@GM','6666666666','','CGFTFGF','Chhattisgarh','GHGHGHGH','GHGHHGH','','','',57,56,'Signet Kitchen Studio','2024-10-10 11:20:36','Anand Bhavsar','superadmin'),(199,'testing','222owner2','','','','','','','w','','','',57,56,'Signet Kitchen Studio','2024-12-16 05:33:24','Anand Bhavsar','superadmin'),(201,'Kapil Sharma','2855555555','','','','','','','pna','','','',57,56,'Signet Kitchen Studio','2024-12-17 10:55:48','Anand Bhavsar','superadmin'),(202,'BHARAT','2111111111','','','','neha','','','SD','','','',57,56,'Signet Kitchen Studio','2024-12-17 11:14:46','Anand Bhavsar','superadmin'),(203,'sanika','9903456789','sanika@gmail.com','9876543345','om ent','ramesh','Maharashtra','pune','kothrud','737377','1','0987656945',57,56,'Signet Kitchen Studio','2025-07-25 05:18:04','Anand Bhavsar','superadmin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userslogin`
--

DROP TABLE IF EXISTS `userslogin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userslogin` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `email` varchar(180) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `confirmPassword` varchar(100) DEFAULT NULL,
  `role` enum('kalkisoft','superadmin','executive','manager','accountant') DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT NULL,
  `employeeCode` varchar(20) DEFAULT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `phoneNo` varchar(15) DEFAULT NULL,
  `panCard` varchar(15) DEFAULT NULL,
  `aadhar` varchar(20) DEFAULT NULL,
  `designation` varchar(50) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `fullname` varchar(120) GENERATED ALWAYS AS (concat(`firstName`,' ',`lastName`)) STORED,
  `select_company` varchar(280) DEFAULT NULL,
  `sessionUser_id` int(150) DEFAULT NULL,
  `sessionUser_name` text DEFAULT NULL,
  `created_id` varchar(50) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT (current_timestamp() - interval 1 day),
  PRIMARY KEY (`id`),
  UNIQUE KEY `employeeCode` (`employeeCode`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userslogin`
--

LOCK TABLES `userslogin` WRITE;
/*!40000 ALTER TABLE `userslogin` DISABLE KEYS */;
INSERT INTO `userslogin` VALUES (56,'kalkisoftadmin@gmail.com','kalkisoftadmin@gmail.com','kalkisoftadmin@gmail.com','kalkisoft',NULL,'active',NULL,'Milind','Bhavsar','9823366045','NDFRJ7648Z','254516531361','kalkisoft Super admin','Shop 1/2, Pinnak Memories, Karve Rd, Phase 2, Kothrud, Pune, Maharashtra 411024','Milind Bhavsar','Kalkisoft Web Development',55,'Milind Bhavsar',NULL,'2024-09-24 18:30:00'),(57,'nabyteknashik@gmail.com','nabyteknashik@gmail.com','nabyteknashik@gmail.com','superadmin',NULL,'active',NULL,'Anand','Bhavsar','9850508642\n','','','MD','Signet kitchen Studio\nShop no. A-3, Uttam Tower,\nGround Floor, Sharanpur Road, Nashik - 422001','Anand Bhavsar','Signet Kitchen Studio',56,'Milind Bhavsar','SIGNET01','2024-09-24 18:30:00');
/*!40000 ALTER TABLE `userslogin` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-03 14:04:46
