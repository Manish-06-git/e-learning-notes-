CREATE DATABASE elearn_notes;
USE elearn_notes;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Updated notes table (added status column)
CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  content TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NEW TABLE for Version History
CREATE TABLE note_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  note_id INT,
  content TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);
