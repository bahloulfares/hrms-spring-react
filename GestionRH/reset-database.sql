-- Reset entire database and let Flyway recreate everything
-- WARNING: This will DELETE ALL DATA

USE mysql;

-- Drop the gestionrh database
DROP DATABASE IF EXISTS gestionrh;

-- Recreate the empty database
CREATE DATABASE gestionrh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify
SHOW DATABASES LIKE 'gestionrh';
