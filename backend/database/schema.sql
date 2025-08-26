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


--PARAMAETRE NORM
-- =========================
-- 1. Categories
-- =========================
DROP TABLE IF EXISTS limites;
DROP TABLE IF EXISTS parametres;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

INSERT INTO categories (nom) VALUES
('mecanique'),
('physique'),
('chimique'),
('durabilite'),
('composition');

-- =========================
-- 2. Parametres
-- =========================
CREATE TABLE parametres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categorie_id INT,
    nom VARCHAR(255) NOT NULL,
    unite VARCHAR(20),
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- Mechanical & Physical (Tableau 3)
INSERT INTO parametres (categorie_id, nom, unite) VALUES
(1, 'Résistance à 2 jours', 'MPa'),      -- id 1
(1, 'Résistance à 7 jours', 'MPa'),      -- id 2
(1, 'Résistance à 28 jours', 'MPa'),     -- id 3
(2, 'Temps de début de prise', 'min'),   -- id 4
(2, 'Stabilité', 'mm'),                  -- id 5
(2, 'Chaleur d’hydratation', 'J/g');     -- id 6

-- Chemical (Tableau 4)
INSERT INTO parametres (categorie_id, nom, unite) VALUES
(3, 'Perte au feu', '%'),                -- id 7
(3, 'Résidu insoluble', '%'),            -- id 8
(3, 'SO3 (sulfates)', '%'),              -- id 9
(3, 'Chlorures', '%'),                   -- id 10
(3, 'Pouzzolanicité', NULL);             -- id 11

-- Durability (Tableau 5)
INSERT INTO parametres (categorie_id, nom, unite) VALUES
(4, 'SO3 SR', '%'),                      -- id 12
(4, 'C3A', '%'),                         -- id 13
(4, 'Pouzzolanicité SR', NULL);          -- id 14

-- Composition (Tableau 1)
INSERT INTO parametres (categorie_id, nom, unite) VALUES
(5, 'Clinker', '%'),                     -- id 15
(5, 'Laitier', '%'),                     -- id 16
(5, 'Cendres volantes', '%'),            -- id 17
(5, 'Pouzzolane naturelle', '%'),        -- id 18
(5, 'Fumée de silice', '%'),             -- id 19
(5, 'Calcaire', '%'),                    -- id 20
(5, 'Autres constituants principaux', '%'); -- id 21

-- =========================
-- 3. Limites
-- =========================
CREATE TABLE limites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parametre_id INT,
    ciment_type VARCHAR(50),
    classe VARCHAR(10),
    limite_inf DECIMAL(10,3),
    limite_sup DECIMAL(10,3),
    limite_garantie DECIMAL(10,3),
    commentaire TEXT,
    FOREIGN KEY (parametre_id) REFERENCES parametres(id)
);

-- =========================
-- EXAMPLES (you will extend)
-- =========================

-- Résistance à 28 jours
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(3, 'CEM I', '32.5', 32.5, 52.5),
(3, 'CEM I', '42.5', 42.5, 62.5),
(3, 'CEM I', '52.5', 52.5, NULL);

-- Début de prise
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf) VALUES
(4, 'Tous', 'Toutes', 75);

-- Stabilité
INSERT INTO limites (parametre_id, ciment_type, classe, limite_sup) VALUES
(5, 'Tous', 'Toutes', 10);

-- Perte au feu
INSERT INTO limites (parametre_id, ciment_type, classe, limite_sup) VALUES
(7, 'CEM I', 'Toutes', 5.0),
(7, 'CEM III', 'Toutes', 5.0);

-- SO3
INSERT INTO limites (parametre_id, ciment_type, classe, limite_sup) VALUES
(9, 'CEM I', '32.5 N', 3.5),
(9, 'CEM I', '42.5 R', 4.0),
(9, 'CEM II/B-M', 'Toutes', 4.5),
(9, 'CEM III/C', 'Toutes', 4.5);

-- =========================
-- Composition rules (Tableau 1 – ALL CEMENTS)
-- =========================

-- CEM I: clinker 95–100
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM I', 'Toutes', 95, 100);

-- CEM II/A-S (Clinker 80–94, Laitier 6–20)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/A-S', 'Toutes', 80, 94),
(16, 'CEM II/A-S', 'Toutes', 6, 20);

-- CEM II/B-S (Clinker 65–79, Laitier 21–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/B-S', 'Toutes', 65, 79),
(16, 'CEM II/B-S', 'Toutes', 21, 35);

-- CEM II/A-V (Clinker 80–94, Cendres 6–20)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/A-V', 'Toutes', 80, 94),
(17, 'CEM II/A-V', 'Toutes', 6, 20);

-- CEM II/B-V (Clinker 65–79, Cendres 21–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/B-V', 'Toutes', 65, 79),
(17, 'CEM II/B-V', 'Toutes', 21, 35);

-- CEM II/A-P (Clinker 80–94, Pouzzolane 6–20)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/A-P', 'Toutes', 80, 94),
(18, 'CEM II/A-P', 'Toutes', 6, 20);

-- CEM II/B-P (Clinker 65–79, Pouzzolane 21–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/B-P', 'Toutes', 65, 79),
(18, 'CEM II/B-P', 'Toutes', 21, 35);

-- CEM II/A-Q (Clinker 80–94, Fumée silice 6–20)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/A-Q', 'Toutes', 80, 94),
(19, 'CEM II/A-Q', 'Toutes', 6, 20);

-- CEM II/B-Q (Clinker 65–79, Fumée silice 21–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/B-Q', 'Toutes', 65, 79),
(19, 'CEM II/B-Q', 'Toutes', 21, 35);

-- CEM II/A-L (Clinker 80–94, Calcaire 6–20)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/A-L', 'Toutes', 80, 94),
(20, 'CEM II/A-L', 'Toutes', 6, 20);

-- CEM II/B-L (Clinker 65–79, Calcaire 21–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM II/B-L', 'Toutes', 65, 79),
(20, 'CEM II/B-L', 'Toutes', 21, 35);

-- CEM III/A (Clinker 35–64, Laitier 36–65)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM III/A', 'Toutes', 35, 64),
(16, 'CEM III/A', 'Toutes', 36, 65);

-- CEM III/B (Clinker 20–34, Laitier 66–80)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM III/B', 'Toutes', 20, 34),
(16, 'CEM III/B', 'Toutes', 66, 80);

-- CEM III/C (Clinker 5–19, Laitier 81–95)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM III/C', 'Toutes', 5, 19),
(16, 'CEM III/C', 'Toutes', 81, 95);

-- CEM IV/A (Clinker 65–89, Pouzzolane 11–35)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM IV/A', 'Toutes', 65, 89),
(18, 'CEM IV/A', 'Toutes', 11, 35);

-- CEM IV/B (Clinker 45–64, Pouzzolane 36–55)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM IV/B', 'Toutes', 45, 64),
(18, 'CEM IV/B', 'Toutes', 36, 55);

-- CEM V/A (Clinker 40–64, Laitier 18–30, Cendres 18–30)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM V/A', 'Toutes', 40, 64),
(16, 'CEM V/A', 'Toutes', 18, 30),
(17, 'CEM V/A', 'Toutes', 18, 30);

-- CEM V/B (Clinker 20–38, Laitier 31–50, Cendres 18–30)
INSERT INTO limites (parametre_id, ciment_type, classe, limite_inf, limite_sup) VALUES
(15, 'CEM V/B', 'Toutes', 20, 38),
(16, 'CEM V/B', 'Toutes', 31, 50),
(17, 'CEM V/B', 'Toutes', 18, 30);





--PARAMETRE ENTREPRISE 
CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `sigle` varchar(50) DEFAULT NULL,
  `nom_raison_sociale` varchar(255) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `parametres_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `sigle`, `nom_raison_sociale`, `adresse`, `parametres_id`) VALUES
(1, 'CETIM', 'Centre d?Etudes et de Contrôle des Matériaux', 'Zone industrielle, Alger', 1),
(2, 'ENPC', 'Entreprise Nationale des Produits de Construction', 'Rue des cimenteries, Oran', 2),
(3, 'CETIM', 'Centre d?Études des Matériaux', 'Zone industrielle - Alger', 1),
(4, 'SONACIM', 'Société Nationale des Ciments', 'Boumerdès, Algérie', 2),
(5, 'LAFARGE', 'Lafarge Cement Company', 'Zéralda, Alger', 3),
(6, 'HOLCIM', 'Holcim Algérie', 'Oran - Route d?Arzew', 4),
(7, 'GRAVAL', 'Graval Construction', 'Constantine - Route El Khroub', 5);


--
-- Structure de la table `parametres_ciment`
--

CREATE TABLE `parametres_ciment` (
  `id` int(11) NOT NULL,
  `type_ciment` varchar(50) DEFAULT NULL,
  `classe_resistance` varchar(10) DEFAULT NULL,
  `court_terme` char(1) DEFAULT NULL,
  `min_rc_2j` float DEFAULT NULL,
  `min_rc_7j` float DEFAULT NULL,
  `min_rc_28j` float DEFAULT NULL,
  `min_debut_prise` int(11) DEFAULT NULL,
  `max_stabilite` float DEFAULT NULL,
  `max_chaleur_hydratation` float DEFAULT NULL,
  `max_perte_au_feu` float DEFAULT NULL,
  `max_residu_insoluble` float DEFAULT NULL,
  `max_so3` float DEFAULT NULL,
  `max_chlorure` float DEFAULT NULL,
  `max_c3a` float DEFAULT NULL,
  `exigence_pouzzolanicite` tinyint(1) DEFAULT NULL,
  `is_lh` tinyint(1) DEFAULT NULL,
  `is_sr` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parametres_ciment`
--

INSERT INTO `parametres_ciment` (`id`, `type_ciment`, `classe_resistance`, `court_terme`, `min_rc_2j`, `min_rc_7j`, `min_rc_28j`, `min_debut_prise`, `max_stabilite`, `max_chaleur_hydratation`, `max_perte_au_feu`, `max_residu_insoluble`, `max_so3`, `max_chlorure`, `max_c3a`, `exigence_pouzzolanicite`, `is_lh`, `is_sr`) VALUES
(1, 'CEM I', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(2, 'CEM I', '32,5', 'R', 10, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(3, 'CEM I', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(4, 'CEM I', '42,5', 'R', 20, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(5, 'CEM I', '52,5', 'N', 20, NULL, 52.5, 40, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(6, 'CEM I', '52,5', 'R', 30, NULL, 52.5, 40, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(7, 'CEM II/A-S', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(8, 'CEM II/A-S', '42,5', 'R', 20, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(9, 'CEM II/B-S', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(10, 'CEM II/B-S', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(11, 'CEM II/A-P', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(12, 'CEM II/A-P', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(13, 'CEM II/B-P', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(14, 'CEM II/B-P', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(15, 'CEM II/A-Q', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(16, 'CEM II/A-Q', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(17, 'CEM II/B-Q', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(18, 'CEM II/B-Q', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(19, 'CEM II/A-V', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(20, 'CEM II/A-V', '42,5', 'R', 20, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(21, 'CEM II/B-V', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(22, 'CEM II/B-V', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(23, 'CEM II/A-W', '32,5', 'R', 10, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(24, 'CEM II/A-L', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(25, 'CEM II/A-L', '42,5', 'R', 20, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(26, 'CEM II/B-L', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(27, 'CEM II/A-LL', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(28, 'CEM III/A', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(29, 'CEM III/A', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(30, 'CEM III/B', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4.5, 0.1, NULL, NULL, NULL, NULL),
(31, 'CEM III/B', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4.5, 0.1, NULL, NULL, NULL, NULL),
(32, 'CEM III/C', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4.5, 0.1, NULL, NULL, NULL, NULL),
(33, 'CEM IV/A', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(34, 'CEM IV/B', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(35, 'CEM IV/B', '42,5', 'N', 10, NULL, 42.5, 50, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(36, 'CEM V/A', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL),
(37, 'CEM V/B', '32,5', 'N', NULL, NULL, 32.5, 60, 10, NULL, 5, 5, 4, 0.1, NULL, NULL, NULL, NULL);
