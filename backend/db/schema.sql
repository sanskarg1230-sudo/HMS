-- ============================================================
-- HMS Database Schema
-- Run this script in MySQL Workbench or via the MySQL CLI:
--   mysql -u root -p < backend/db/schema.sql
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

-- Step 2: Create the users table
-- NOTE: Spring Boot's 'ddl-auto=update' will also create this
-- automatically on first startup, but this script is here for reference.
CREATE TABLE IF NOT EXISTS users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,  -- BCrypt hash (255 chars to be safe)
    role       VARCHAR(20)  NOT NULL,  -- 'admin' or 'student'
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ============================================================
-- NOTE: Do NOT insert users manually here.
-- The DataInitializer.java class automatically seeds the
-- following test users on every application startup:
--
--   email: admin@hms.edu    / password: admin123   / role: admin
--   email: student@hms.edu  / password: student123 / role: student
--
-- Passwords are hashed using BCryptPasswordEncoder at runtime,
-- so they are guaranteed to match when logging in.
-- ============================================================

-- Verify the table was created
DESCRIBE users;
