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
('admin@cetim.dz', '$2b$10$WSo10LJR.p4F3Vx5E98WSeq5VY7XXATT3gmgqYC12rtMrD8HLUk9y', 'admin'),
('user@cetim.dz',  '$2b$10$txGEp4e7f7gO6UXeeZPe5OXPaDVrpVCr.V2b7i0aLya8yw8NZi19W', 'user');



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
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(2, 'CEM II/A-S', 'Portland au laitier 6–20%', 0),
(2, 'CEM II/B-S', 'Portland au laitier 21–35%', 0);

-- CEM III
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(3, 'CEM III/A', 'Haut fourneau (36–65%)', 0),
(3, 'CEM III/B', 'Haut fourneau (66–80%)', 0),
(3, 'CEM III/C', 'Haut fourneau (81–95%)', 0),
(3, 'CEM III/B-SR', 'Haut fourneau SR', 1),
(3, 'CEM III/C-SR', 'Haut fourneau SR', 1);

-- CEM IV
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(4, 'CEM IV/A', 'Pouzzolanique (11–35%)', 0),
(4, 'CEM IV/B', 'Pouzzolanique (36–55%)', 0),
(4, 'CEM IV/A-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1),
(4, 'CEM IV/B-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1);

-- CEM V
INSERT INTO types_ciment (famille_id, code, description, sr) VALUES
(5, 'CEM V/A', 'Composé (18–30% laitier + 18–30% cendres volantes)', 0),
(5, 'CEM V/B', 'Composé (31–49% laitier + 31–49% cendres volantes)', 0);




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
('chimique'),
('supplémentaire');



-- =========================
-- 5. Parameters Definitions
-- =========================
CREATE TABLE parametres_norme (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categorie_id INT NOT NULL,
  nom VARCHAR(255) NOT NULL,       -- e.g., "Résistance à 28 jours", "SO3"
  reference_norme VARCHAR(50),     -- e.g., "EN 196-1"
  unite VARCHAR(50),               -- e.g., "MPa", "%", "J/g", "mm"
  FOREIGN KEY (categorie_id) REFERENCES categories_parametre(id)
);

-- Mécaniques
INSERT INTO parametres_norme (categorie_id, nom, reference_norme, unite) VALUES
(1, 'Resistance à 2 jours', 'EN 196-1', 'MPa'),
(1, 'Resistance à 7 jours', 'EN 196-1', 'MPa'),
(1, 'Resistance à 28 jours', 'EN 196-1', 'MPa');

-- Physiques
INSERT INTO parametres_norme (categorie_id, nom, reference_norme, unite) VALUES
(2, 'Temps de debut de prise', 'EN 196-3', 'min'),
(2, 'Stabilite (expansion)', 'EN 196-3', 'mm'),
(2, 'Chaleur d’hydratation', 'EN 196-8/9', 'J/g');

-- Chimiques
INSERT INTO parametres_norme (categorie_id, nom, reference_norme, unite) VALUES
(3, 'Perte au feu', 'EN 196-2', '%'),
(3, 'Residu insoluble', 'EN 196-2', '%'),
(3, 'SO3', 'EN 196-2', '%'),
(3, 'Chlorures', 'EN 196-2', '%'),
(3, 'Pouzzolanicite', 'EN 196-5', 'Essai');

-- Supplémentaires (SR)
INSERT INTO parametres_norme (categorie_id, nom, reference_norme, unite) VALUES
(4, 'SO3 (SR)', 'EN 196-2', '%'),
(4, 'C3A (clinker)', 'EN 196-2', '%'),
(4, 'Pouzzolanicite (SR)', 'EN 196-5', 'Essai');



-- =========================
-- 6. Values per Cement Type/Class
-- =========================
CREATE TABLE valeurs_parametres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_ciment_id INT NOT NULL,
  classe_id INT,                    -- nullable if same for all classes
  parametre_id INT NOT NULL,
  valeur_min DECIMAL(10,2),         -- lower limit if applicable
  valeur_max DECIMAL(10,2),         -- upper limit if applicable
  valeur_exacte DECIMAL(10,2),      -- for fixed values (e.g. C3A=0%)
  commentaire TEXT,                 -- notes like "≤", "≥", "résultat positif"
  FOREIGN KEY (type_ciment_id) REFERENCES types_ciment(id),
  FOREIGN KEY (classe_id) REFERENCES classes_resistance(id),
  FOREIGN KEY (parametre_id) REFERENCES parametres_norme(id)
);

-- 32.5N
INSERT INTO valeurs_parametres (type_ciment_id, classe_id, parametre_id, valeur_min, valeur_max, commentaire)
VALUES
(NULL, 1, 2, 16.0, NULL, '≥ 16 MPa à 7 jours'),
(NULL, 1, 3, 32.5, 52.5, '28 jours 32.5–52.5'),
(NULL, 1, 4, 75, NULL, '≥ 75 min début de prise'),
(NULL, 1, 5, NULL, 10, 'Expansion ≤ 10mm');

-- 32.5R
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_min, commentaire)
VALUES
(2, 1, 10.0, '≥ 10 MPa à 2 jours'),
(2, 3, 32.5, 52.5, '28 jours 32.5–52.5');

-- 42.5N
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_min, valeur_max, commentaire)
VALUES
(3, 2, 16.0, NULL, '≥ 16 MPa à 7 jours'),
(3, 3, 42.5, 62.5, '28 jours 42.5–62.5');

-- 42.5R
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_min, commentaire)
VALUES
(4, 1, 20.0, '≥ 20 MPa à 2 jours'),
(4, 3, 42.5, 62.5, '28 jours 42.5–62.5');

-- 52.5N
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_min, commentaire)
VALUES
(5, 2, 20.0, '≥ 20 MPa à 7 jours'),
(5, 3, 52.5, NULL, '≥ 52.5 à 28 jours');

-- 52.5R
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_min, commentaire)
VALUES
(6, 1, 30.0, '≥ 30 MPa à 2 jours'),
(6, 3, 52.5, NULL, '≥ 52.5 à 28 jours');



-- Perte au feu et Résidu insoluble
INSERT INTO valeurs_parametres (parametre_id, valeur_max, commentaire)
VALUES
(7, 5.0, '≤ 5%'),
(8, 5.0, '≤ 5%');

-- SO3 (cas par classe/type)
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_max, commentaire)
VALUES
(1, 9, 3.5, '32.5N ≤ 3.5%'),
(2, 9, 3.5, '32.5R ≤ 3.5%'),
(3, 9, 3.5, '42.5N ≤ 3.5%'),
(4, 9, 4.0, '42.5R ≤ 4.0%'),
(5, 9, 4.0, '52.5N ≤ 4.0%'),
(6, 9, 4.0, '52.5R ≤ 4.0%');

-- Chlorures
INSERT INTO valeurs_parametres (parametre_id, valeur_max, commentaire)
VALUES
(10, 0.10, '≤ 0.10% (sauf CEM III tolérance plus haute)');

-- Pouzzolanicité
INSERT INTO valeurs_parametres (parametre_id, commentaire)
VALUES
(11, 'CEM IV doit réussir EN 196-5');


-- SO3 SR
INSERT INTO valeurs_parametres (classe_id, parametre_id, valeur_max, commentaire)
VALUES
(1, 12, 3.0, '32.5N ≤ 3.0%'),
(2, 12, 3.0, '32.5R ≤ 3.0%'),
(3, 12, 3.0, '42.5N ≤ 3.0%'),
(4, 12, 3.5, '42.5R ≤ 3.5%'),
(5, 12, 3.5, '52.5N ≤ 3.5%'),
(6, 12, 3.5, '52.5R ≤ 3.5%');

-- C3A clinker
INSERT INTO valeurs_parametres (type_ciment_id, parametre_id, valeur_exacte, valeur_max, commentaire)
VALUES
(2, 13, 0, NULL, 'CEM I-SR 0 = 0%'),
(3, 13, NULL, 3, 'CEM I-SR 3 ≤ 3%'),
(4, 13, NULL, 5, 'CEM I-SR 5 ≤ 5%'),
(15, 13, NULL, 9, 'CEM IV-SR ≤ 9%');

-- Pouzzolanicité SR
INSERT INTO valeurs_parametres (type_ciment_id, parametre_id, commentaire)
VALUES
(15, 14, 'CEM IV/A-SR doit être positif à 8 jours'),
(16, 14, 'CEM IV/B-SR doit être positif à 8 jours');

-- Chaleur d’hydratation ≤ 270 J/g
-- Chaleur d’hydratation ≤ 270 J/g (parametre_id = 6)
INSERT INTO valeurs_parametres (type_ciment_id, parametre_id, valeur_max, commentaire)
VALUES
(6, 6, 270, 'CEM III/A-L ≤ 270 J/g'),
(7, 6, 270, 'CEM III/B-L ≤ 270 J/g'),
(8, 6, 270, 'CEM III/C-L ≤ 270 J/g');



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
-- CONTRÔLES PAR MESURE (Résistances)
-- ======================

INSERT INTO controles_conformite 
(parametre, type_controle, methode_reference, categorie, ciment_soumis, frequence_courante, frequence_admission) VALUES
('Résistance  à 2 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
('Résistance  à 7 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
('Résistance à 28 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine');

-- ======================
-- CONTRÔLES PAR ATTRIBUT (Résistances)
-- ======================

INSERT INTO controles_conformite 
(parametre, type_controle, methode_reference, categorie, ciment_soumis, frequence_courante, frequence_admission) VALUES
('Temps debut de prise', 'attribut', 'EN 196-3', 'physique', 'Tous', '2/semaine', '4/semaine'),
('Stabilité (expansion)', 'attribut', 'EN 196-3', 'physique', 'Tous', '1/semaine', '4/semaine'),
('Perte au feu', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
('Résidu insoluble', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
('Teneur en sulfate', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/semaine', '4/semaine'),
('Teneur en chlorure', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/mois', '1/semaine'),
('C3A dans le clinker', 'attribut', 'EN 196-2 (calc)', 'supplémentaire', 'CEM I-SR 0, CEM I-SR 3, CEM I-SR 5, CEM II/A-SR, CEM IV/B-SR', '2/mois', '1/semaine'),
('C3A dans le clinker', NULL, 'EN 196-2 (calc)', 'supplémentaire', 'CEM II/A-SR, CEM IV/B-SR', NULL, NULL),
('Pouzzolanicité', 'attribut', 'EN 196-5', 'chimique', 'CEM IV', '2/mois', '1/semaine'),
('Chaleur d’hydratation', 'attribut', 'EN 196-8 ou EN 196-9', 'physique', 'Ciments courants à faible chaleur d’hydratation', '1/mois', '1/semaine'),
('Composition', 'attribut', NULL, 'chimique', 'Tous', '1/mois', '1/semaine');



-- Table des valeurs statistiques (Tableau 7)
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
VALUES ('physique_chimique', NULL, 10.00, 5.00);



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




-- =========================
-- tab10 : limit de garanti
-- =========================
CREATE TABLE parametres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_ciment_id INT NULL,               -- parfois utilisé (stabilité, SO3, C3A, etc.)
    classe_resistance_id INT NULL,         -- parfois utilisé (résistance 7j, 28j, prise, etc.)
    categorie_id INT NOT NULL,             -- mécanique, physique, chimique, supplémentaire
    nom_parametre VARCHAR(100) NOT NULL,   -- nom du paramètre (Résistance 7j, SO3, Cl-, etc.)
    limite_garantie DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (type_ciment_id) REFERENCES types_ciment(id),
    FOREIGN KEY (classe_resistance_id) REFERENCES classes_resistance(id),
    FOREIGN KEY (categorie_id) REFERENCES categories_parametre(id)
);


-- 1) Résistance 2 jours (valeur limite inférieure)
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(2, 1, 'Résistance 2 jours',  8.0),  -- 32.5 R
(3, 1, 'Résistance 2 jours',  8.0),  -- 42.5 N
(4, 1, 'Résistance 2 jours', 18.0),  -- 42.5 R
(9, 1, 'Résistance 2 jours',  8.0),  -- 52.5 L (CEM III)
(5, 1, 'Résistance 2 jours', 18.0),  -- 52.5 N
(6, 1, 'Résistance 2 jours', 28.0);  -- 52.5 R

-- 2) Résistance 7 jours (valeur limite inférieure)
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(7, 1, 'Résistance 7 jours', 10.0),  -- 32.5 L (CEM III)
(1, 1, 'Résistance 7 jours', 14.0),  -- 32.5 N
(8, 1, 'Résistance 7 jours', 14.0);  -- 42.5 L (CEM III)

-- 3) Résistance 28 jours (valeur limite inférieure)
-- Apply per class (same value for L/N/R within the class)
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(1, 1, 'Résistance 28 jours', 30.0), -- 32.5 N
(2, 1, 'Résistance 28 jours', 30.0), -- 32.5 R
(7, 1, 'Résistance 28 jours', 30.0), -- 32.5 L
(3, 1, 'Résistance 28 jours', 40.0), -- 42.5 N
(4, 1, 'Résistance 28 jours', 40.0), -- 42.5 R
(8, 1, 'Résistance 28 jours', 40.0), -- 42.5 L
(5, 1, 'Résistance 28 jours', 50.0), -- 52.5 N
(6, 1, 'Résistance 28 jours', 50.0), -- 52.5 R
(9, 1, 'Résistance 28 jours', 50.0); -- 52.5 L

-- =========================
-- Temps de début de prise (min)
-- =========================
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(1, 4, 'Temps début de prise', 60),
(2, 4, 'Temps début de prise', 60),
(7, 4, 'Temps début de prise', 60),
(3, 4, 'Temps début de prise', 50),
(4, 4, 'Temps début de prise', 50),
(8, 4, 'Temps début de prise', 50),
(5, 4, 'Temps début de prise', 40),
(6, 4, 'Temps début de prise', 40),
(9, 4, 'Temps début de prise', 40);

-- =========================
-- Stabilité (expansion en mm)
-- =========================
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(1, 1, 'Stabilité (Le Chatelier)', 10.0),
(2, 1, 'Stabilité (Le Chatelier)', 10.0),
(3, 1, 'Stabilité (Le Chatelier)', 10.0),
(4, 1, 'Stabilité (Le Chatelier)', 10.0),
(5, 1, 'Stabilité (Le Chatelier)', 10.0),
(6, 1, 'Stabilité (Le Chatelier)', 10.0),
(7, 1, 'Stabilité (Le Chatelier)', 10.0),
(8, 1, 'Stabilité (Le Chatelier)', 10.0),
(9, 1, 'Stabilité (Le Chatelier)', 10.0);

-- =========================
-- Teneur en sulfates (SO3 %)
-- =========================
-- CEM I (including SR variants)
INSERT INTO parametres (type_ciment_id, classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(1, 1, 3, 'SO3', 4), -- CEM I 32.5N
(1, 2, 3, 'SO3', 4), -- CEM I 32.5R
(1, 3, 3, 'SO3', 4.0), -- CEM I 42.5N
(1, 4, 3, 'SO3', 4.5), -- CEM I 42.5R
(1, 5, 3, 'SO3', 4.5), -- CEM I 52.5N
(1, 6, 3, 'SO3', 4.5), -- CEM I 52.5R


-- 🔹 CEM II (Portland composite cements)
(2, 1, 3, 'SO3', 4.0), -- CEM II 32.5N
(2, 2, 3, 'SO3', 4.0), -- CEM II 32.5R
(2, 3, 3, 'SO3', 4.0), -- CEM II 42.5N
(2, 4, 3, 'SO3', 4.5), -- CEM II 42.5R
(2, 5, 3, 'SO3', 4.5), -- CEM II 52.5N
(2, 6, 3, 'SO3', 4.5), -- CEM II 52.5R

-- 🔹 CEM IV (Pozzolanic cements)
(4, 1, 3, 'SO3', 4.0), -- CEM IV 32.5N
(4, 2, 3, 'SO3', 4.0), -- CEM IV 32.5R
(4, 3, 3, 'SO3', 4.0), -- CEM IV 42.5N
(4, 4, 3, 'SO3', 4.5), -- CEM IV 42.5R
(4, 5, 3, 'SO3', 4.5), -- CEM IV 52.5N
(4, 6, 3, 'SO3', 4.5), -- CEM IV 52.5R

-- 🔹 CEM V (Composite cements)
(5, 1, 3, 'SO3', 4.0), -- CEM V 32.5N
(5, 2, 3, 'SO3', 4.0), -- CEM V 32.5R
(5, 3, 3, 'SO3', 4.0), -- CEM V 42.5N
(5, 4, 3, 'SO3', 4.5), -- CEM V 42.5R
(5, 5, 3, 'SO3', 4.5), -- CEM V 52.5N
(5, 6, 3, 'SO3', 4.5); -- CEM V 52.5R


-- 🔹 CEM I-SR 0 / SR 3 / SR 5
(6, 1, 3, 'SO3', 3.5), -- CEM I-SR0 32.5N
(6, 2, 3, 'SO3', 3.5), -- CEM I-SR0 32.5R
(6, 3, 3, 'SO3', 3.5), -- CEM I-SR0 42.5N
(6, 4, 3, 'SO3', 4.0), -- CEM I-SR0 42.5R
(6, 5, 3, 'SO3', 4.0), -- CEM I-SR0 52.5N
(6, 6, 3, 'SO3', 4.0), -- CEM I-SR0 52.5R

(7, 1, 3, 'SO3', 3.5), -- CEM I-SR3 32.5N
(7, 2, 3, 'SO3', 3.5), -- CEM I-SR3 32.5R
(7, 3, 3, 'SO3', 3.5), -- CEM I-SR3 42.5N
(7, 4, 3, 'SO3', 4.0), -- CEM I-SR3 42.5R
(7, 5, 3, 'SO3', 4.0), -- CEM I-SR0 52.5N
(7, 6, 3, 'SO3', 4.0), -- CEM I-SR3 52.5R

(8, 1, 3, 'SO3', 3.5), -- CEM I-SR5 32.5N
(8, 2, 3, 'SO3', 3.5), -- CEM I-SR5 32.5R
(8, 3, 3, 'SO3', 3.5), -- CEM I-SR5 42.5N
(8, 4, 3, 'SO3', 4.0), -- CEM I-SR5 42.5R
(8, 5, 3, 'SO3', 4.0), -- CEM I-SR0 52.5N
(8, 6, 3, 'SO3', 4.0), -- CEM I-SR5 52.5R

-- 🔹 CEM IV/A-SR
(14, 1, 3, 'SO3', 4.0), -- CEM IV/A-SR 32.5N
(14, 2, 3, 'SO3', 4.0), -- CEM IV/A-SR 32.5R
(14, 3, 3, 'SO3', 4.0), -- CEM IV/A-SR 42.5N
(14, 4, 3, 'SO3', 4.0), -- CEM IV/A-SR 42.5R
(14, 5, 3, 'SO3', 4.0), -- CEM IV/A-SR 52.5N
(14, 6, 3, 'SO3', 4.0), -- CEM IV/A-SR 52.5R

-- 🔹 CEM IV/B-SR
(15, 1, 3, 'SO3', 4.0), -- CEM IV/B-SR 32.5N
(15, 2, 3, 'SO3', 4.0), -- CEM IV/B-SR 32.5R
(15, 3, 3, 'SO3', 4.0), -- CEM IV/B-SR 42.5N
(15, 4, 3, 'SO3', 4.0), -- CEM IV/B-SR 42.5R
(15, 5, 3, 'SO3', 4.0), -- CEM IV/B-SR 52.5N
(15, 6, 3, 'SO3', 4.0); -- CEM IV/B-SR 52.5R



-- CEM III/A
(7, 1, 3, 'SO3', 4.5), -- 32.5 N
(7, 2, 3, 'SO3', 4.5), -- 32.5 R
(7, 7, 3, 'SO3', 4.5), -- 32.5 L
(7, 3, 3, 'SO3', 4.5), -- 42.5 N
(7, 4, 3, 'SO3', 4.5), -- 42.5 R
(7, 8, 3, 'SO3', 4.5), -- 42.5 L
(7, 5, 3, 'SO3', 4.5), -- 52.5 N
(7, 6, 3, 'SO3', 4.5), -- 52.5 R
(7, 9, 3, 'SO3', 4.5), -- 52.5 L

-- CEM III/B
(8, 1, 3, 'SO3', 4.5), -- 32.5 N
(8, 2, 3, 'SO3', 4.5), -- 32.5 R
(8, 7, 3, 'SO3', 4.5), -- 32.5 L
(8, 3, 3, 'SO3', 4.5), -- 42.5 N
(8, 4, 3, 'SO3', 4.5), -- 42.5 R
(8, 8, 3, 'SO3', 4.5), -- 42.5 L
(8, 5, 3, 'SO3', 4.5), -- 52.5 N
(8, 6, 3, 'SO3', 4.5), -- 52.5 R
(8, 9, 3, 'SO3', 4.5), -- 52.5 L

-- CEM III/C
(9, 1, 3, 'SO3', 5.0), -- 32.5 N
(9, 2, 3, 'SO3', 5.0), -- 32.5 R
(9, 7, 3, 'SO3', 5.0), -- 32.5 L
(9, 3, 3, 'SO3', 5.0), -- 42.5 N
(9, 4, 3, 'SO3', 5.0), -- 42.5 R
(9, 8, 3, 'SO3', 5.0), -- 42.5 L
(9, 5, 3, 'SO3', 5.0), -- 52.5 N
(9, 6, 3, 'SO3', 5.0), -- 52.5 R
(9, 9, 3, 'SO3', 5.0); -- 52.5 L



-- =========================
-- C3A (%) (uniquement pour SR)
-- =========================
INSERT INTO parametres (type_ciment_id, classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
-- CEM I SR 0
(6, 1, 3, 'C3A', 1),   -- CEM I SR 0 - classe 32,5N
(6, 2, 3, 'C3A', 1),   -- CEM I SR 0 - classe 32,5R
(6, 7, 3, 'C3A', 1),   -- CEM I SR 0 - classe 32,5L
(6, 3, 3, 'C3A', 1),   -- CEM I SR 0 - classe 42,5N
(6, 4, 3, 'C3A', 1),   -- CEM I SR 0 - classe 42,5R
(6, 8, 3, 'C3A', 1),   -- CEM I SR 0 - classe 42,5L
(6, 5, 3, 'C3A', 1),   -- CEM I SR 0 - classe 52,5N
(6, 6, 3, 'C3A', 1),   -- CEM I SR 0 - classe 52,5R
(6, 9, 3, 'C3A', 1),   -- CEM I SR 0 - classe 52,5L
-- CEM I SR 3 (C3A ≤ 3%)
(7, 1, 3, 'C3A', 4),   -- classe 32,5N
(7, 2, 3, 'C3A', 4),   -- classe 32,5R
(7, 7, 3, 'C3A', 4),   -- classe 32,5L
(7, 3, 3, 'C3A', 4),   -- classe 42,5N
(7, 4, 3, 'C3A', 4),   -- classe 42,5R
(7, 8, 3, 'C3A', 4),   -- classe 42,5L
(7, 5, 3, 'C3A', 4),   -- classe 52,5N
(7, 6, 3, 'C3A', 4),   -- classe 52,5R
(7, 9, 3, 'C3A', 4),   -- classe 52,5L

-- CEM I SR 5 (C3A ≤ 5%)
(8, 1, 3, 'C3A', 6),   -- classe 32,5N
(8, 2, 3, 'C3A', 6),   -- classe 32,5R
(8, 7, 3, 'C3A', 6),   -- classe 32,5L
(8, 3, 3, 'C3A', 6),   -- classe 42,5N
(8, 4, 3, 'C3A', 6),   -- classe 42,5R
(8, 8, 3, 'C3A', 6),   -- classe 42,5L
(8, 5, 3, 'C3A', 6),   -- classe 52,5N
(8, 6, 3, 'C3A', 6),   -- classe 52,5R
(8, 9, 3, 'C3A', 6),   -- classe 52,5L

-- CEM IV/A-SR (C3A ≤ 3%)
(9, 1, 3, 'C3A', 10),   -- classe 32,5N
(9, 2, 3, 'C3A', 10),   -- classe 32,5R
(9, 7, 3, 'C3A', 10),   -- classe 32,5L
(9, 3, 3, 'C3A', 10),   -- classe 42,5N
(9, 4, 3, 'C3A', 10),   -- classe 42,5R
(9, 8, 3, 'C3A', 10),   -- classe 42,5L
(9, 5, 3, 'C3A', 10),   -- classe 52,5N
(9, 6, 3, 'C3A', 10),   -- classe 52,5R
(9, 9, 3, 'C3A', 10),   -- classe 52,5L

-- CEM IV/B-SR (C3A ≤ 3%)
(10, 1, 3, 'C3A', 10),   -- classe 32,5N
(10, 2, 3, 'C3A', 10),   -- classe 32,5R
(10, 7, 3, 'C3A', 10),   -- classe 32,5L
(10, 3, 3, 'C3A', 10),   -- classe 42,5N
(10, 4, 3, 'C3A', 10),   -- classe 42,5R
(10, 8, 3, 'C3A', 10),   -- classe 42,5L
(10, 5, 3, 'C3A', 10),   -- classe 52,5N
(10, 6, 3, 'C3A', 10),   -- classe 52,5R
(10, 9, 3, 'C3A', 10);   -- classe 52,5L

-- =========================
-- Chlorures (%)
-- =========================
INSERT INTO parametres (classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(1, 1, 'Chlorures (Cl⁻)', 0.10),
(2, 1, 'Chlorures (Cl⁻)', 0.10),
(3, 1, 'Chlorures (Cl⁻)', 0.10),
(4, 1, 'Chlorures (Cl⁻)', 0.10),
(5, 1, 'Chlorures (Cl⁻)', 0.10),
(6, 1, 'Chlorures (Cl⁻)', 0.10),
(7, 1, 'Chlorures (Cl⁻)', 0.10),
(8, 1, 'Chlorures (Cl⁻)', 0.10),
(9, 1, 'Chlorures (Cl⁻)', 0.10);

ALTER TABLE parametres MODIFY limite_garantie VARCHAR(50);

-- =========================
-- Pouzzolane (positivité après 15 jours)
-- =========================
INSERT INTO parametres (type_ciment_id, classe_resistance_id, categorie_id, nom_parametre, limite_garantie) VALUES
(4, 1, 3, 'Pouzzolanicité', 'Positive après 15 jours'),
(4, 2, 3, 'Pouzzolanicité', 'Positive après 15 jours'),
(4, 3, 3, 'Pouzzolanicité', 'Positive après 15 jours'),
(4, 4, 3, 'Pouzzolanicité', 'Positive après 15 jours'),
(4, 5, 3, 'Pouzzolanicité', 'Positive après 15 jours'),
(4, 6, 3, 'Pouzzolanicité', 'Positive après 15 jours');


-- =========================
-- Chaleur d’hydratation (J/g)
-- =========================
INSERT INTO parametres (type_ciment_id, categorie_id, nom_parametre, limite_garantie) VALUES
(3, 4, 'Chaleur hydratation', 300), -- CEM III LH
(5, 4, 'Chaleur hydratation', 300); -- CEM V LH






