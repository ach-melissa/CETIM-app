-- =========================
-- DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS ciment_conformite;
USE ciment_conformite;

-- LOGIN PAGE 
-- TABLE utilisateurs
-- =========================
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL
);

INSERT INTO utilisateurs (email, mot_de_passe, role) VALUES
('infomely@gmail.com', '$2b$10$A46BsmRiNw.FjnYLYcuyMunzyYFbDfjc8hUR7uXVdfV0cfD/c6iN.', 'admin'),
('info@gmail.com',  '$2b$10$9wR2Jc9ltr13s4ihJ5OR.e1hjY8dXPWnjkr2kJBa7G5uUFMWri5y2', 'user');

-- =========================  
-- 1. Families of Cement
-- =========================
CREATE TABLE familles_ciment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL,      -- e.g., "CEM I", "CEM II", ...
  nom VARCHAR(255) NOT NULL       -- e.g., "Ciment Portland"
);

INSERT INTO familles_ciment (code, nom) VALUES
('CEM I', 'Ciment Portland'),
('CEM II', 'Ciment Portland composé'),
('CEM III', 'Ciment de haut fourneau'),
('CEM IV', 'Ciment pouzzolanique'),
('CEM V', 'Ciment composé');



-- =========================
-- 2. Types of Cement
-- =========================
CREATE TABLE types_ciment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  famille_id INT NOT NULL,
  code VARCHAR(20) NOT NULL,      -- e.g., "CEM II/A-S", "CEM I-SR 5"
  description TEXT,
  sr BOOLEAN DEFAULT FALSE,       -- true if resistant aux sulfates
  FOREIGN KEY (famille_id) REFERENCES familles_ciment(id)
);


-- CEM I and SR
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(1, 'CEM I', 'Ciment Portland', 0),
(1, 'CEM I-SR 0', 'Ciment Portland SR (C3A = 0%)', 1),
(1, 'CEM I-SR 3', 'Ciment Portland SR (C3A ≤ 3%)', 1),
(1, 'CEM I-SR 5', 'Ciment Portland SR (C3A ≤ 5%)', 1);

-- Example CEM II
-- Example CEM II
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(2, 'CEM II/A-S', 'Portland au laitier 6–20% S', 0),
(2, 'CEM II/B-S', 'Portland au laitier 21–35% S', 0),
(2, 'CEM II/A-D', 'Ciment portland à la fumée de silice 6–10% D', 0),
(2, 'CEM II/A-P', 'Ciment portland à la pouzzolane 6–20% P', 0),
(2, 'CEM II/B-P', 'Ciment portland à la pouzzolane 21–35% P', 0),
(2, 'CEM II/A-Q', 'Ciment portland à la pouzzolane 6–20% Q', 0),
(2, 'CEM II/B-Q', 'Ciment portland à la pouzzolane 21–35% Q', 0),
(2, 'CEM II/A-V', 'Ciment portland aux cendres volantes 6–20% V', 0),
(2, 'CEM II/B-V', 'Ciment portland aux cendres volantes 21–35% V', 0),
(2, 'CEM II/A-W', 'Ciment portland aux cendres volantes 6–20% W', 0),
(2, 'CEM II/B-W', 'Ciment portland aux cendres volantes 21–35% W', 0),
(2, 'CEM II/A-T', 'Ciment portland aux schistes calcinés 6–20% T', 0),
(2, 'CEM II/B-T', 'Ciment portland aux schistes calcinés 21–35% T', 0),
(2, 'CEM II/A-L', 'Ciment portland au calcaire 6–20% L', 0),
(2, 'CEM II/B-L', 'Ciment portland au calcaire 21–35% L', 0),
(2, 'CEM II/A-LL', 'Ciment portland au calcaire 6–20% LL', 0),
(2, 'CEM II/B-LL', 'Ciment portland au calcaire 21–35% LL', 0),
(2, 'CEM II/A-M', 'Ciment portland composé 12–20% S D P Q V W T L LL', 0),
(2, 'CEM II/B-M', 'Ciment portland composé 21–35% S D P Q V W T L LL', 0);


-- CEM III
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(3, 'CEM III/A', 'Haut fourneau (36–65% S)', 0),
(3, 'CEM III/B', 'Haut fourneau (66–80% S)', 0),
(3, 'CEM III/C', 'Haut fourneau (81–95% S)', 0),
(3, 'CEM III/B-SR', 'Haut fourneau SR', 1),
(3, 'CEM III/C-SR', 'Haut fourneau SR', 1);

-- CEM IV
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(4, 'CEM IV/A', 'Pouzzolanique (11–35% D P Q V W)', 0),
(4, 'CEM IV/B', 'Pouzzolanique (36–55% D P Q V W)', 0),
(4, 'CEM IV/A-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1),
(4, 'CEM IV/B-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1);

-- CEM V
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(5, 'CEM V/A', 'Composé (18–30% laitier + 18–30% P Q V )', 0),
(5, 'CEM V/B', 'Composé (31–49% laitier + 31–49% P Q V )', 0);


-- =========================
-- 3. Classes of Resistance
-- =========================
CREATE TABLE classes_resistance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  classe VARCHAR(10) NOT NULL,    -- "32.5", "42.5", "52.5"
  type_court_terme ENUM('N','R','L') NOT NULL -- Normal, Rapide, Lent
);

INSERT INTO classes_resistance (classe, type_court_terme) VALUES
('32.5','N'),
('32.5','R'),
('42.5','N'),
('42.5','R'),
('52.5','N'),
('52.5','R'),
('32.5','L'), -- Only for CEM III
('42.5','L'), -- Only for CEM III
('52.5','L'); -- Only for CEM III


-- =========================
-- 4. Categories of Parameters
-- =========================
CREATE TABLE categories_parametre (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom ENUM('mecanique','physique','chimique','supplémentaire') NOT NULL
);

INSERT INTO categories_parametre (nom) VALUES
('mecanique'),
('physique'),
('chimique');

RENAME TABLE categories_parametre TO categories;

