-- Create Keyspace
CREATE KEYSPACE IF NOT EXISTS chatdb WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};

-- Use Keyspace
USE chatdb;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    userid UUID,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    partner TEXT,
    PRIMARY KEY ((email, partner), userid)
);


-- Create ChatHistory Table
CREATE TABLE IF NOT EXISTS chathistory (
    chatid UUID,
    userid UUID,
    chattitle TEXT,
    chathistoryjson BLOB,
    createdon TIMESTAMP,
    nettokenconsumption INT,
    PRIMARY KEY (userid, chatid)
);

-- Create AvailableModels Table
CREATE TABLE IF NOT EXISTS availablemodels (
    deploymentid UUID PRIMARY KEY,
    deploymentname TEXT,
    modelname TEXT,
    modeltype TEXT,
    modelversion TEXT,
    provider TEXT,
    endpoint TEXT,
    apikey TEXT,
    isactive BOOLEAN
);

-- Create UserSubscriptions Table
CREATE TABLE IF NOT EXISTS usersubscriptions (
    userid UUID,
    modelid UUID,
    PRIMARY KEY (userid, modelid)
);