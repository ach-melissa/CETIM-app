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
('infomely@gmail.com', '$2b$10$jFaPwdHdM1w6NepomzLbkeql8IjD1UHKmQHoE09.R/WjRnyKf78AG', 'admin'),
('info@gmail.com',  '$2b$10$xAaOR8vubWnUhB5OdZxOwetPn2Bd3PbspJn4kTb99pXz4xI4hl1du', 'user');

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


-- =========================
-- 5. Mechanical Properties Table (Updated with min/sup limits for 2/7 days)
-- =========================
CREATE TABLE proprietes_mecaniques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  classe_resistance_id INT NOT NULL,
  resistance_2j_min DECIMAL(5,1) NULL,       -- Minimum resistance at 2 days (MPa)
  resistance_2j_sup DECIMAL(5,1) NULL,       -- Superior resistance at 2 days (MPa)
  garantie_2j DECIMAL(5,1) NULL,             -- Guarantee limit at 2 days (MPa)
  resistance_7j_min DECIMAL(5,1) NULL,       -- Minimum resistance at 7 days (MPa)
  resistance_7j_sup DECIMAL(5,1) NULL,       -- Superior resistance at 7 days (MPa)
  garantie_7j DECIMAL(5,1) NULL,             -- Guarantee limit at 7 days (MPa)
  resistance_28j_min DECIMAL(5,1) NOT NULL,  -- Minimum resistance at 28 days (MPa)
  resistance_28j_sup DECIMAL(5,1) NULL,      -- Superior resistance at 28 days (MPa)
  garantie_28j DECIMAL(5,1) NOT NULL,        -- Guaranteed value at 28 days (MPa)
  FOREIGN KEY (classe_resistance_id) REFERENCES classes_resistance(id)
);

-- Insert mechanical properties for all classes with min/sup limits
INSERT INTO proprietes_mecaniques (classe_resistance_id, resistance_2j_min, resistance_2j_sup, garantie_2j, resistance_7j_min, resistance_7j_sup, garantie_7j, resistance_28j_min, resistance_28j_sup, garantie_28j) VALUES
-- 32.5 L (Only for CEM III)
((SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'L'), NULL, NULL, NULL, 12.0, NULL, 10.0, 32.5, 52.5, 30.0),
-- 32.5 N
((SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, NULL, 16.0, NULL, 14.0, 32.5, 52.5, 30.0),
-- 32.5 R
((SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), 10.0, NULL, 8.0, NULL, NULL, NULL, 32.5, 52.5, 30.0),
-- 42.5 L (Only for CEM III)
((SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'L'), NULL, NULL, NULL, 16.0, NULL, 14.0, 42.5, 62.5, 40.0),
-- 42.5 N
((SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), 10.0, NULL, 8.0, NULL, NULL, NULL, 42.5, 62.5, 40.0),
-- 42.5 R
((SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), 20.0, NULL, 18.0, NULL, NULL, NULL, 42.5, 62.5, 40.0),
-- 52.5 L (Only for CEM III)
((SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'L'), 10.0, NULL, 8.0, NULL, NULL, NULL, 52.5, NULL, 50.0),
-- 52.5 N
((SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), 20.0, NULL, 18.0, NULL, NULL, NULL, 52.5, NULL, 50.0),
-- 52.5 R
((SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), 30.0, NULL, 28.0, NULL, NULL, NULL, 52.5, NULL, 50.0);

-- =========================
-- 6. Link table between cement types and resistance classes
-- =========================
CREATE TABLE IF NOT EXISTS types_ciment_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_ciment_id INT NOT NULL,
  classe_resistance_id INT NOT NULL,
  FOREIGN KEY (type_ciment_id) REFERENCES types_ciment(id),
  FOREIGN KEY (classe_resistance_id) REFERENCES classes_resistance(id),
  UNIQUE KEY (type_ciment_id, classe_resistance_id)
);

-- =========================
-- 7. Views for mechanical properties
-- =========================

-- View: mechanical properties only (per class)
CREATE VIEW vue_proprietes_mecaniques_complet AS
SELECT 
    cr.classe,
    cr.type_court_terme,
    pm.resistance_2j_min,
    pm.resistance_2j_sup,
    pm.garantie_2j,
    pm.resistance_7j_min,
    pm.resistance_7j_sup,
    pm.garantie_7j,
    pm.resistance_28j_min,
    pm.resistance_28j_sup,
    pm.garantie_28j
FROM proprietes_mecaniques pm
JOIN classes_resistance cr ON pm.classe_resistance_id = cr.id
ORDER BY 
    CAST(SUBSTRING_INDEX(cr.classe, '.', 1) AS UNSIGNED),
    CASE cr.type_court_terme 
        WHEN 'L' THEN 1 
        WHEN 'N' THEN 2 
        WHEN 'R' THEN 3 
    END;

-- View: cement types + properties
CREATE VIEW vue_tous_ciments_proprietes AS
SELECT 
    fc.code AS famille_code,
    fc.nom AS famille_nom,
    tc.code AS type_code,
    tc.description AS type_description,
    tc.sr AS sulfate_resistant,
    cr.classe,
    cr.type_court_terme,
    pm.resistance_2j_min,
    pm.resistance_2j_sup,
    pm.garantie_2j,
    pm.resistance_7j_min,
    pm.resistance_7j_sup,
    pm.garantie_7j,
    pm.resistance_28j_min,
    pm.resistance_28j_sup,
    pm.garantie_28j
FROM types_ciment_classes tcc
JOIN types_ciment tc ON tcc.type_ciment_id = tc.id
JOIN familles_ciment fc ON tc.famille_id = fc.id
JOIN classes_resistance cr ON tcc.classe_resistance_id = cr.id
JOIN proprietes_mecaniques pm ON cr.id = pm.classe_resistance_id
ORDER BY 
    fc.code, 
    tc.code,
    CAST(SUBSTRING_INDEX(cr.classe, '.', 1) AS UNSIGNED),
    CASE cr.type_court_terme 
        WHEN 'L' THEN 1 
        WHEN 'N' THEN 2 
        WHEN 'R' THEN 3 
    END;

-- View: all possible cement type/class combinations (even without data)
CREATE VIEW vue_tous_ciments_proprietes_complet AS
SELECT 
    fc.code AS famille_code,
    fc.nom AS famille_nom,
    tc.code AS type_code,
    tc.description AS type_description,
    tc.sr AS sulfate_resistant,
    cr.classe,
    cr.type_court_terme,
    pm.resistance_2j_min,
    pm.resistance_2j_sup,
    pm.garantie_2j,
    pm.resistance_7j_min,
    pm.resistance_7j_sup,
    pm.garantie_7j,
    pm.resistance_28j_min,
    pm.resistance_28j_sup,
    pm.garantie_28j
FROM types_ciment tc
JOIN familles_ciment fc ON tc.famille_id = fc.id
CROSS JOIN classes_resistance cr
LEFT JOIN proprietes_mecaniques pm ON cr.id = pm.classe_resistance_id
ORDER BY 
    fc.code, 
    tc.code,
    CAST(SUBSTRING_INDEX(cr.classe, '.', 1) AS UNSIGNED),
    CASE cr.type_court_terme 
        WHEN 'L' THEN 1 
        WHEN 'N' THEN 2 
        WHEN 'R' THEN 3 
    END;

-- =========================
-- POPULATE types_ciment_classes
-- =========================

-- 1) For CEM I, II, IV, V: only N and R classes
INSERT IGNORE INTO types_ciment_classes (type_ciment_id, classe_resistance_id)
SELECT tc.id, cr.id
FROM types_ciment tc
CROSS JOIN classes_resistance cr
WHERE tc.famille_id IN (
    SELECT id FROM familles_ciment WHERE code IN ('CEM I', 'CEM II', 'CEM IV', 'CEM V')
)
AND cr.type_court_terme IN ('N', 'R');

-- 2) For CEM III: all classes (L, N, R)
INSERT IGNORE INTO types_ciment_classes (type_ciment_id, classe_resistance_id)
SELECT tc.id, cr.id
FROM types_ciment tc
CROSS JOIN classes_resistance cr
WHERE tc.famille_id IN (
    SELECT id FROM familles_ciment WHERE code = 'CEM III'
);

-- =========================
-- Verification queries
-- =========================
-- Count associations
SELECT COUNT(*) AS total_associations FROM types_ciment_classes;

-- Check some associations
SELECT 
    fc.code AS famille_code,
    tc.code AS type_code, 
    cr.classe,
    cr.type_court_terme,
    COUNT(*) AS count
FROM types_ciment_classes tcc
JOIN types_ciment tc ON tcc.type_ciment_id = tc.id
JOIN familles_ciment fc ON tc.famille_id = fc.id
JOIN classes_resistance cr ON tcc.classe_resistance_id = cr.id
GROUP BY fc.code, tc.code, cr.classe, cr.type_court_terme
ORDER BY fc.code, tc.code, cr.classe, cr.type_court_terme;

-- Check CEM II specifically
SELECT * FROM vue_tous_ciments_proprietes
WHERE famille_code = 'CEM II'
ORDER BY type_code, classe, type_court_terme;

-- Check CEM III specifically (includes L classes)
SELECT * FROM vue_tous_ciments_proprietes
WHERE famille_code = 'CEM III'
ORDER BY type_code, classe, type_court_terme;




-- =========================
-- 7. Unified Physical Properties Table
-- =========================
CREATE TABLE proprietes_physiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie ENUM('temps_debut_prise', 'stabilite', 'chaleur_hydratation') NOT NULL,
  classe_resistance_id INT NULL,  -- NULL for properties that apply to all classes
  famille_ciment_id INT NULL,     -- NULL for properties that apply to all families, or specific family ID
  temps_debut_prise_min INT NULL,             -- Minimum limit for setting time
  temps_debut_prise_sup INT NULL,             -- Maximum limit for setting time
  temps_debut_prise_garanti INT NULL,         -- Guaranteed value for setting time
  stabilite_min INT NULL,                     -- Minimum limit for stability
  stabilite_sup INT NULL,                     -- Maximum limit for stability
  stabilite_garanti INT NULL,                 -- Guaranteed value for stability
  chaleur_hydratation_min INT NULL,           -- Minimum limit for heat of hydration
  chaleur_hydratation_sup INT NULL,           -- Maximum limit for heat of hydration
  chaleur_hydratation_garanty INT NULL,       -- Guaranteed value for heat of hydration
  FOREIGN KEY (classe_resistance_id) REFERENCES classes_resistance(id),
  FOREIGN KEY (famille_ciment_id) REFERENCES familles_ciment(id)
);

-- Insert setting time requirements (temps de début de prise)
INSERT INTO proprietes_physiques (categorie, classe_resistance_id, famille_ciment_id, temps_debut_prise_min, temps_debut_prise_sup, temps_debut_prise_garanti) VALUES
-- 32.5 classes
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, 75, NULL, 60),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, 75, NULL, 60),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'L'), NULL, 75, NULL, 60),
-- 42.5 classes
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, 60, NULL, 50),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, 60, NULL, 50),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'L'), NULL, 60, NULL, 50),
-- 52.5 classes
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, 45, NULL, 40),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, 45, NULL, 40),
('temps_debut_prise', (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'L'), NULL, 45, NULL, 40);

-- Insert stability requirements (stabilite) - applies to all cements
INSERT INTO proprietes_physiques (categorie, classe_resistance_id, famille_ciment_id, stabilite_min, stabilite_sup, stabilite_garanti) VALUES
('stabilite', NULL, NULL, NULL, 10, 10);

-- Insert heat of hydration requirements (chaleur d'hydratation) - Only for CEM III
INSERT INTO proprietes_physiques (categorie, classe_resistance_id, famille_ciment_id, chaleur_hydratation_min, chaleur_hydratation_sup, chaleur_hydratation_garanty) VALUES
('chaleur_hydratation', NULL, (SELECT id FROM familles_ciment WHERE code = 'CEM III'), NULL, 270, 300);

-- =========================
-- 8. Views for Physical Properties
-- =========================

-- View for all physical properties
CREATE VIEW vue_proprietes_physiques AS
SELECT 
    fc.code AS famille_code,
    fc.nom AS famille_nom,
    tc.code AS type_code,
    tc.description AS type_description,
    cr.classe,
    cr.type_court_terme,
    pp.temps_debut_prise_min,
    pp.temps_debut_prise_sup,
    pp.temps_debut_prise_garanti,
    pp.stabilite_min,
    pp.stabilite_sup,
    pp.stabilite_garanti,
    pp.chaleur_hydratation_min,
    pp.chaleur_hydratation_sup,
    pp.chaleur_hydratation_garanty
FROM types_ciment_classes tcc
JOIN types_ciment tc ON tcc.type_ciment_id = tc.id
JOIN familles_ciment fc ON tc.famille_id = fc.id
JOIN classes_resistance cr ON tcc.classe_resistance_id = cr.id
LEFT JOIN proprietes_physiques pp ON (
    (pp.classe_resistance_id = cr.id AND pp.categorie = 'temps_debut_prise') OR
    (pp.classe_resistance_id IS NULL AND pp.famille_ciment_id IS NULL AND pp.categorie = 'stabilite') OR
    (pp.famille_ciment_id = fc.id AND pp.categorie = 'chaleur_hydratation')
)
ORDER BY 
    fc.code, 
    tc.code,
    CAST(SUBSTRING_INDEX(cr.classe, '.', 1) AS UNSIGNED),
    CASE cr.type_court_terme 
        WHEN 'L' THEN 1 
        WHEN 'N' THEN 2 
        WHEN 'R' THEN 3 
    END;

-- View for setting time requirements only
CREATE VIEW vue_temps_debut_prise AS
SELECT 
    cr.classe,
    cr.type_court_terme,
    pp.temps_debut_prise_min,
    pp.temps_debut_prise_sup,
    pp.temps_debut_prise_garanti
FROM proprietes_physiques pp
JOIN classes_resistance cr ON pp.classe_resistance_id = cr.id
WHERE pp.categorie = 'temps_debut_prise'
ORDER BY 
    CAST(SUBSTRING_INDEX(cr.classe, '.', 1) AS UNSIGNED),
    CASE cr.type_court_terme 
        WHEN 'L' THEN 1 
        WHEN 'N' THEN 2 
        WHEN 'R' THEN 3 
    END;

-- Voir toutes les propriétés physiques
SELECT * FROM vue_proprietes_physiques;

-- Voir seulement la stabilité
SELECT famille_code, type_code, classe, type_court_terme, 
       stabilite_min, stabilite_sup, stabilite_garanti 
FROM vue_proprietes_physiques;

-- Voir seulement la chaleur d'hydratation (surtout pour CEM III)
SELECT famille_code, type_code, classe, type_court_terme,
       chaleur_hydratation_min, chaleur_hydratation_sup, chaleur_hydratation_garanty
FROM vue_proprietes_physiques
WHERE chaleur_hydratation_min IS NOT NULL 
   OR chaleur_hydratation_sup IS NOT NULL 
   OR chaleur_hydratation_garanty IS NOT NULL;

-- Check physical properties
SELECT COUNT(*) AS count FROM vue_proprietes_physiques;
--SELECT * FROM vue_proprietes_physiques;
    SELECT * FROM vue_proprietes_physiques;
--View setting time requirements only
    SELECT * FROM vue_temps_debut_prise;

-- =========================
-- 9. Chemical Properties Table
-- =========================
CREATE TABLE proprietes_chimiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie ENUM('pert_au_feu', 'residu_insoluble', 'teneur_chlour', 'pouzzolanicite', 'SO3', 'SO3_supp', 'pouzzolanicite_supp', 'C3A') NOT NULL,
  famille_ciment_id INT NULL,
  classe_resistance_id INT NULL,
  type_court_terme ENUM('N','R','L') NULL,
  limit_inf DECIMAL(5,2) NULL,
  limit_sup DECIMAL(5,2) NULL,
  limit_garanti DECIMAL(5,2) NULL,
  description_garanti TEXT NULL,
  FOREIGN KEY (famille_ciment_id) REFERENCES familles_ciment(id),
  FOREIGN KEY (classe_resistance_id) REFERENCES classes_resistance(id)
);

-- Insert chemical properties data
INSERT INTO proprietes_chimiques (categorie, famille_ciment_id, classe_resistance_id, type_court_terme, limit_inf, limit_sup, limit_garanti, description_garanti) VALUES
-- Pert au feu (Ciment 1 and 2, all classes)
('pert_au_feu', 1, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
('pert_au_feu', 2, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),

-- Residu insoluble (Ciment 1 and 3, all classes)
('residu_insoluble', 1, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
('residu_insoluble', 3, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),

-- Teneur en chlour (All ciments, all classes)
('teneur_chlour', NULL, NULL, NULL, NULL, 0.10, 0.10, 'Limit sup = 0.10%'),

-- Pouzzolanicite (Only cement 4, classes N and R)
('pouzzolanicite', 4, NULL, 'N', NULL, NULL, NULL, 'Satisfait à l essai - Positive après 15 jours'),
('pouzzolanicite', 4, NULL, 'R', NULL, NULL, NULL, 'Satisfait à l essai - Positive après 15 jours'),

-- SO3 for CEM I, II, IV, V
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 1, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),

-- SO3 for CEM II
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 2, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),

-- SO3 for CEM IV
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 4, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),

-- SO3 for CEM V
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 4.00, NULL),
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 4.00, 4.50, NULL),
('SO3', 5, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 4.00, 4.50, NULL),

-- SO3 for CEM III
('SO3', 3, NULL, NULL, NULL, 4.00, 4.50, 'For CEM III/A and CEM III/B'),
('SO3', 3, NULL, NULL, NULL, 4.00, 5.00, 'For CEM III/C'),

-- SO3 supplémentaire pour ciments SR
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5N'),
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5R'),
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.00, 3.00, 'For SR cements: 42.5N'),
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 3.50, 'For SR cements: 42.5R'),
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5N'),
('SO3_supp', 1, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5R'),

('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'N'), NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5N'),
('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '32.5' AND type_court_terme = 'R'), NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5R'),
('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'N'), NULL, NULL, 3.00, 3.00, 'For SR cements: 42.5N'),
('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '42.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 3.50, 'For SR cements: 42.5R'),
('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'N'), NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5N'),
('SO3_supp', 4, (SELECT id FROM classes_resistance WHERE classe = '52.5' AND type_court_terme = 'R'), NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5R'),

-- Pouzzolanicité supplémentaire
('pouzzolanicite_supp', 4, NULL, 'N', NULL, NULL, NULL, 'Résultat doit être positif à 8 jours'),
('pouzzolanicite_supp', 4, NULL, 'R', NULL, NULL, NULL, 'Résultat doit être positif à 8 jours'),

-- C3A
('C3A', 1, NULL, NULL, NULL, 0.00, 2.00, 'C3A limit for I-SR0: max 0%, garanty 2%'),
('C3A', 1, NULL, NULL, NULL, 3.00, 4.00, 'C3A limit for I-SR3: max 3%, garanty 4%'),
('C3A', 1, NULL, NULL, NULL, 5.00, 6.00, 'C3A limit for I-SR5: max 5%, garanty 6%'),
('C3A', 4, NULL, NULL, NULL, 9.00, 10.00, 'C3A limit for IV/A-SR: max 9%, garanty 10%'),
('C3A', 4, NULL, NULL, NULL, 9.00, 10.00, 'C3A limit for IV/B-SR: max 9%, garanty 10%');

-- =========================
-- 10. View for Chemical Properties
-- =========================
CREATE OR REPLACE VIEW vue_proprietes_chimiques AS
SELECT 
    fc.code AS famille_code,
    fc.nom AS famille_nom,
    tc.code AS type_code,
    tc.description AS type_description,
    cr.classe,
    cr.type_court_terme,
    pc.categorie,
    pc.limit_inf,
    pc.limit_sup,
    pc.limit_garanti,
    pc.description_garanti
FROM proprietes_chimiques pc
LEFT JOIN familles_ciment fc ON pc.famille_ciment_id = fc.id
LEFT JOIN types_ciment tc ON tc.famille_id = fc.id
LEFT JOIN classes_resistance cr ON pc.classe_resistance_id = cr.id
ORDER BY fc.code, tc.code, pc.categorie, cr.classe, cr.type_court_terme;

-- Vérification des données
SELECT * FROM vue_proprietes_chimiques WHERE categorie = 'SO3';
SELECT * FROM vue_proprietes_chimiques WHERE categorie = 'SO3_supp';
SELECT * FROM vue_proprietes_chimiques WHERE categorie = 'C3A';
SELECT * FROM vue_proprietes_chimiques WHERE categorie = 'pouzzolanicite_supp';







CREATE TABLE controles_conformite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parametre VARCHAR(255) NOT NULL,
  type_controle ENUM('mesure','attribut') NOT NULL,
  methode_reference VARCHAR(100),
  categorie VARCHAR(100),
  ciment_soumis VARCHAR(255),
  frequence_courante VARCHAR(50),
  frequence_admission VARCHAR(50)
);


-- ======================
-- CONTRÔLES PAR MESURE 
-- ======================

INSERT INTO controles_conformite 
(parametre, type_controle, methode_reference, categorie, ciment_soumis, frequence_courante, frequence_admission) VALUES
('Résistance  à 2 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
('Résistance  à 7 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
('Résistance à 28 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine');

-- ======================
-- CONTRÔLES PAR ATTRIBUT 
-- ======================

INSERT INTO controles_conformite 
(parametre, type_controle, methode_reference, categorie, ciment_soumis, frequence_courante, frequence_admission) VALUES
('Temps debut de prise', 'attribut', 'EN 196-3', 'physique', 'Tous', '2/semaine', '4/semaine'),
('Stabilité (expansion)', 'attribut', 'EN 196-3', 'physique', 'Tous', '1/semaine', '4/semaine'),
('Perte au feu', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
('Résidu insoluble', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
('Teneur en sulfate', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/semaine', '4/semaine'),
('Teneur en chlorure', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/mois', '1/semaine'),
('C3A dans le clinker', 'attribut', 'EN 196-2 (calc)', 'chimique', 'CEM I-SR 0, CEM I-SR 3, CEM I-SR 5, CEM II/A-SR, CEM IV/B-SR', '2/mois', '1/semaine'),
('C3A dans le clinker', NULL, 'EN 196-2 (calc)', 'chimique', 'CEM II/A-SR, CEM IV/B-SR', NULL, NULL),
('Pouzzolanicité', 'attribut', 'EN 196-5', 'chimique', 'CEM IV', '2/mois', '1/semaine'),
('Chaleur d’hydratation', 'attribut', 'EN 196-8 ou EN 196-9', 'physique', 'Ciments courants à faible chaleur d’hydratation', '1/mois', '1/semaine'),
('Composition', 'attribut', NULL, 'chimique', 'Tous', '1/mois', '1/semaine');


-- Table des valeurs statistiques Pk / Cr (Tableau 7)
CREATE TABLE valeurs_statistiques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie VARCHAR(100) NOT NULL,       -- mécanique / physique_chimique
    sous_type VARCHAR(100) NULL,           -- limite inférieure / limite supérieure / NULL
    percentile_pk DECIMAL(5,2) NOT NULL,   -- valeur en %
    prob_acceptation_cr DECIMAL(5,2) NOT NULL  -- valeur en %
);

-- ======================
-- Données du Tableau 7
-- ======================

-- Exigences mécaniques (limite inférieure)
INSERT INTO valeurs_statistiques (categorie, sous_type, percentile_pk, prob_acceptation_cr)
VALUES ('mecanique', 'limite_inferieure', 5.00, 5.00);

-- Exigences mécaniques (limite supérieure)
INSERT INTO valeurs_statistiques (categorie, sous_type, percentile_pk, prob_acceptation_cr)
VALUES ('mecanique', 'limite_superieure', 10.00, 5.00);

-- Exigences physiques et chimiques
INSERT INTO valeurs_statistiques (categorie, sous_type, percentile_pk, prob_acceptation_cr)
VALUES ('physique', NULL, 10.00, 5.00),
('chimique', NULL, 10.00, 5.00);




CREATE TABLE coefficients_k (
  id INT AUTO_INCREMENT PRIMARY KEY,
  n_min INT NOT NULL,
  n_max INT NOT NULL,
  n_range VARCHAR(20) NOT NULL,   -- textual range as in the norm
  k_pk5 DECIMAL(4,2) NOT NULL,    -- k for Pk = 5% (résistance, limite inférieure)
  k_pk10 DECIMAL(4,2) NOT NULL    -- k for Pk = 10% (autres propriétés / limite sup)
);

INSERT INTO coefficients_k (n_min, n_max, n_range, k_pk5, k_pk10) VALUES
(20, 21, '20 à 21', 2.40, 1.93),
(22, 23, '22 à 23', 2.35, 1.89),
(24, 25, '24 à 25', 2.31, 1.85),
(26, 27, '26 à 27', 2.27, 1.82),
(28, 29, '28 à 29', 2.24, 1.80),
(30, 34, '30 à 34', 2.22, 1.78),
(35, 39, '35 à 39', 2.17, 1.73),
(40, 44, '40 à 44', 2.13, 1.70),
(45, 49, '45 à 49', 2.09, 1.67),
(50, 59, '50 à 59', 2.07, 1.65),
(60, 69, '60 à 69', 2.02, 1.61),
(70, 79, '70 à 79', 1.99, 1.58),
(80, 89, '80 à 89', 1.97, 1.56),
(90, 99, '90 à 99', 1.94, 1.54),
(100, 149, '100 à 149', 1.93, 1.53),
(150, 199, '150 à 199', 1.87, 1.48),
(200, 299, '200 à 299', 1.84, 1.45),
(300, 399, '300 à 399', 1.80, 1.42),
(401, 1000000, '> 400', 1.78, 1.40);


----------
--valeur ca correspond to pk=10%
CREATE TABLE conditions_statistiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  n_min INT NOT NULL,
  n_max INT NOT NULL,
  pk_percentile DECIMAL(4,2) NOT NULL,   -- Pk (% fractile)
  ca_probabilite DECIMAL(4,2) NOT NULL   -- Ca (% probabilité d’acceptation)
);

INSERT INTO conditions_statistiques (n_min, n_max, pk_percentile, ca_probabilite) VALUES
-- (0, 19, 10, 0);
(20, 39, 10, 0),
(40, 54, 10, 1),
(40, 54, 10, 2),
(40, 54, 10, 3),
(40, 54, 10, 4),
(40, 54, 10, 5),
(40, 54, 10, 6),
(40, 54, 10, 7);


-----------------------------
-- parametre entreprise --
-----------------------------
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sigle VARCHAR(50) DEFAULT NULL,
  nom_resaux_sociale VARCHAR(255) DEFAULT NULL,
  adresse TEXT DEFAULT NULL,
  famillecement VARCHAR(50) DEFAULT NULL,
  typecement VARCHAR(50) DEFAULT NULL,
  methodeessai VARCHAR(50) DEFAULT NULL
);

-- Déchargement des données de la table `clients`

INSERT INTO `clients` (`id`, `sigle`, `nom_resaux_sociale`, `adresse`) VALUES
(1, 'CETIM', 'Centre d?Etudes et de Contrôle des Matériaux', 'Zone industrielle, Alger'),
(2, 'ENPC', 'Entreprise Nationale des Produits de Construction', 'Rue des cimenteries, Oran'),
(3, 'CETIM', 'Centre d?Études des Matériaux', 'Zone industrielle - Alger'),
(4, 'SONACIM', 'Société Nationale des Ciments', 'Boumerdès, Algérie'),
(5, 'LAFARGE', 'Lafarge Cement Company', 'Zéralda, Alger'),
(6, 'HOLCIM', 'Holcim Algérie', 'Oran - Route d?Arzew'),
(7, 'GRAVAL', 'Graval Construction', 'Constantine - Route El Khroub');

