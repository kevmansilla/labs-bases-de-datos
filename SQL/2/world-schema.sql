-- create database
DROP DATABASE IF EXISTS world;
CREATE DATABASE world DEFAULT CHARACTER SET utf8mb4;
USE world;

-- country table
drop table if exists country;
CREATE TABLE IF NOT EXISTS country (
    Code CHAR(3) NOT NULL DEFAULT '',
    Name CHAR(52) NOT NULL DEFAULT '',
    Continent enum('Asia','Europe','North America','Africa','Oceania','Antarctica','South America') NOT NULL DEFAULT 'Asia',
    Region CHAR(52) NOT NULL DEFAULT '',
    SurfaceArea DECIMAL(10,2) NOT NULL DEFAULT '0.00',
    IndepYear INT DEFAULT NULL,
    Population INT NOT NULL DEFAULT '0',
    LifeExpectancy DECIMAL(10,2) DEFAULT NULL,
    GNP DECIMAL(10,2) DEFAULT NULL,
    GNPOld DECIMAL(10,2) DEFAULT NULL,
    LocalName CHAR(52) NOT NULL DEFAULT '',
    GovernmentForm CHAR(52) NOT NULL DEFAULT '',
    HeadOfState CHAR(52) DEFAULT NULL,
    Capital INT DEFAULT NULL,
    Code2 CHAR(2) NOT NULL DEFAULT '',
    PRIMARY KEY(Code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- city table
drop table if exists city;
CREATE TABLE IF NOT EXISTS city (
    ID INT NOT NULL AUTO_INCREMENT,
    Name CHAR(52) NOT NULL DEFAULT '',
    CountryCode CHAR(3) NOT NULL DEFAULT '',
    District CHAR(52) NOT NULL DEFAULT '',
    Population INT NOT NULL DEFAULT '0',
    PRIMARY KEY(ID),
    KEY CountryCode(CountryCode),
    CONSTRAINT `city_fk` FOREIGN KEY(CountryCode) REFERENCES country(Code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- conuntrylanguaje table
drop table if exists countrylanguage;
CREATE TABLE IF NOT EXISTS countrylanguage (
    CountryCode CHAR(3) NOT NULL DEFAULT '',
    Language CHAR(30) NOT NULL DEFAULT '',
    IsOfficial enum('T','F') NOT NULL DEFAULT 'F',
     Percentage DECIMAL(4,1) NOT NULL DEFAULT '0.0',
    PRIMARY KEY(`CountryCode`,`Language`),
    KEY CountryCode(CountryCode),
    CONSTRAINT countryLanguage_fk FOREIGN KEY(CountryCode) REFERENCES country(Code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- continent table
drop table if exists continent;
CREATE TABLE IF NOT EXISTS continent (
    ContinenName CHAR(52) NOT NULL DEFAULT '',
    Area INT NOT NULL DEFAULT '0',
    Percentage DECIMAL(10,1) NOT NULL DEFAULT '0.0',
    PopulusCity CHAR(52) NOT NULL DEFAULT '',
    PRIMARY KEY(ContinenName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parte VI, primero cargar todos los datos antes de correr
ALTER TABLE country MODIFY COLUMN Continent CHAR(52) NOT NULL DEFAULT '';
ALTER TABLE country ADD CONSTRAINT ContinentOfCountry_bf FOREIGN KEY(Continent) REFERENCES continent(ContinenName);
