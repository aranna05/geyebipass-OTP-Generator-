-- Create the gayebi_pass database if it does not already exist on the MySQL server
CREATE DATABASE IF NOT EXISTS gayebi_pass;

-- Select the gayebi_pass database for executing all subsequent table commands
USE gayebi_pass;

-- Create the secrets table to store one-time sensitive text entries securely
CREATE TABLE IF NOT EXISTS secrets (
  -- Unique 36-character UUID string acting as the primary identifier for each secret
  id VARCHAR(36) PRIMARY KEY,
  -- Column storing the confidential message or password text content
  secret_text TEXT NOT NULL
);
