-- init.sql
CREATE TABLE IF NOT EXISTS record (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value INT,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO record (value, name, created_at) VALUES 
  (100, 'Alice', '2025-06-01 10:00:00'),
  (200, 'Bob', '2025-06-02 11:30:00'),
  (300, 'Charlie', '2025-06-03 15:45:00');
