
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


CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `nom` enum('mecanique','physique','chimique','supplémentaire') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `nom`) VALUES
(1, 'mecanique'),
(2, 'physique'),
(3, 'chimique');

-- --------------------------------------------------------

--
-- Structure de la table `classes_resistance`
--

CREATE TABLE `classes_resistance` (
  `id` int(11) NOT NULL,
  `classe` varchar(10) NOT NULL,
  `type_court_terme` enum('N','R','L') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `classes_resistance`
--

INSERT INTO `classes_resistance` (`id`, `classe`, `type_court_terme`) VALUES
(1, '32.5', 'N'),
(2, '32.5', 'R'),
(3, '42.5', 'N'),
(4, '42.5', 'R'),
(5, '52.5', 'N'),
(6, '52.5', 'R'),
(7, '32.5', 'L'),
(8, '42.5', 'L'),
(9, '52.5', 'L');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `sigle` varchar(50) DEFAULT NULL,
  `nom_raison_sociale` varchar(255) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `famillecement` varchar(50) DEFAULT NULL,
  `methodeessai` varchar(50) DEFAULT NULL,
  `typecement_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `sigle`, `nom_raison_sociale`, `adresse`, `famillecement`, `methodeessai`, `typecement_id`) VALUES
(18, 'CETIM', 'Centre dEtudes et de Controle des Materiaux', 'Zone industrielle, Alger', NULL, NULL, NULL),
(19, 'ENPC', 'Entreprise Nationale des Produits de Construction', 'Rue des Cimenteries, Oran', NULL, NULL, NULL),
(20, 'SONACIM', 'Societe Nationale des Ciments', 'Boumerdes, Algerie', NULL, NULL, NULL),
(21, 'LAFARGE', 'Lafarge Cement Company', 'Zone Industrielle, Zeralda - Alger', NULL, NULL, NULL),
(22, 'HOLCIM', 'Holcim Algerie', 'Oran - Route dArzew', NULL, NULL, NULL),
(23, 'GRAVAL', 'Graval Construction', 'Constantine - Route El Khroub', NULL, NULL, NULL);


ALTER TABLE clients 
ADD COLUMN photo_client VARCHAR(255) NULL AFTER methodeessai,
ADD COLUMN telephone VARCHAR(20) NULL AFTER photo_client,
ADD COLUMN numero_identification VARCHAR(50) NULL AFTER telephone,
ADD COLUMN email VARCHAR(100) NULL AFTER numero_identification;
-- Cette commande est correcte - elle supprime juste la colonne problématique
-- Supprimer la contrainte de clé étrangère
ALTER TABLE clients DROP FOREIGN KEY fk_clients_typecement;
-- Maintenant vous pouvez supprimer la colonne
ALTER TABLE clients DROP COLUMN typecement_id;
-- --------------------------------------------------------

--
-- Structure de la table `client_types_ciment`
--

CREATE TABLE `client_types_ciment` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `typecement_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `client_types_ciment`
--

INSERT INTO `client_types_ciment` (`id`, `client_id`, `typecement_id`) VALUES
(43, 19, 3),
(44, 20, 4),
(45, 20, 5),
(48, 22, 2),
(49, 22, 3),
(50, 22, 4),
(51, 23, 5),
(59, 21, 1),
(60, 21, 6),
(61, 18, 1),
(62, 18, 4),
(63, 18, 33),
(64, 18, 34),
(72, 18, 32),
(73, 18, 20),
(74, 18, 16),
(75, 20, 24);
(64, 18, 34);


-- Exécutez cette commande SQL dans votre base de données
CREATE TABLE IF NOT EXISTS phase_selection (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  produit_id INT NOT NULL,
  phase ENUM('situation_courante', 'nouveau_type_produit') NOT NULL DEFAULT 'situation_courante',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_client_produit (client_id, produit_id),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES client_types_ciment(id) ON DELETE CASCADE
);


CREATE TABLE `echantillons` (
  `id` bigint(20) NOT NULL,
  `client_type_ciment_id` int(11) NOT NULL,

  `client_id` int(11) NOT NULL,
  `produit_id` int(11) DEFAULT NULL,

  `phase` varchar(50) DEFAULT NULL,
  `num_ech` varchar(100) DEFAULT NULL,
  `date_test` date DEFAULT NULL,
  `rc2j` decimal(9,3) DEFAULT NULL,
  `rc7j` decimal(9,3) DEFAULT NULL,
  `rc28j` decimal(9,3) DEFAULT NULL,
  `prise` decimal(9,3) DEFAULT NULL,
  `stabilite` decimal(9,3) DEFAULT NULL,
  `hydratation` decimal(9,3) DEFAULT NULL,
  `pfeu` decimal(9,3) DEFAULT NULL,
  `r_insoluble` decimal(9,3) DEFAULT NULL,
  `so3` decimal(9,3) DEFAULT NULL,
  `chlorure` decimal(9,3) DEFAULT NULL,
  `c3a` decimal(9,3) DEFAULT NULL,
  `ajout_percent` decimal(9,3) DEFAULT NULL,
  `type_ajout` varchar(50) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `date_import` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `echantillons` (`id`, `client_type_ciment_id`, `phase`, `num_ech`, `date_test`, `rc2j`, `rc7j`, `rc28j`, `prise`, `stabilite`, `hydratation`, `pfeu`, `r_insoluble`, `so3`, `chlorure`, `c3a`, `ajout_percent`, `type_ajout`, `source`, `date_import`) VALUES
(1, 61, 'fabrication', 'CETIM-001', '2023-01-15', 15.200, 28.500, 42.300, 2.150, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', 'Laboratoire', '2025-09-19 00:27:13'),
(2, 61, 'fabrication', 'CETIM-002', '2023-01-16', 16.800, 30.100, 45.200, 2.100, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', 'Laboratoire', '2025-09-19 00:27:13'),
(3, 61, 'fabrication', 'CETIM-003', '2023-01-20', 15.700, 29.000, 43.100, 2.120, 0.480, 252.000, 2.050, 0.750, 3.150, 0.045, 8.400, 15.500, 'Laitier', 'Laboratoire', '2025-09-19 00:46:03'),
(4, 61, 'fabrication', 'CETIM-004', '2023-01-25', 16.200, 29.800, 44.000, 2.180, 0.500, 254.000, 2.150, 0.820, 3.250, 0.055, 8.600, 16.200, 'Laitier', 'Laboratoire', '2025-09-19 00:46:03'),
(5, 43, 'livraison', 'ENPC-101', '2023-02-01', 14.500, 27.800, 40.900, 2.200, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Pouzzolane', 'Site client', '2025-09-19 00:27:19'),
(6, 43, 'livraison', 'ENPC-102', '2023-02-05', 14.800, 28.200, 41.500, 2.230, 0.620, 249.000, 2.300, 0.910, 3.350, 0.065, 8.800, 14.300, 'Pouzzolane', 'Site client', '2025-09-19 00:46:03'),
(7, 43, 'livraison', 'ENPC-103', '2023-02-12', 15.300, 28.900, 42.400, 2.190, 0.600, 251.000, 2.250, 0.860, 3.200, 0.050, 8.500, 15.000, 'Pouzzolane', 'Site client', '2025-09-19 00:46:03'),
(8, 44, 'fabrication', 'SONACIM-201', '2023-03-05', 17.100, 31.000, 46.500, 2.050, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', 'Laboratoire', '2025-09-19 00:27:24'),
(9, 44, 'fabrication', 'SONACIM-202', '2023-03-10', 17.400, 31.500, 47.200, 2.060, 0.490, 262.000, 1.850, 0.650, 2.950, 0.035, 7.900, 12.500, 'Pouzzolane', 'Laboratoire', '2025-09-19 00:46:03'),
(30, 61, NULL, 'ECH001', '2023-01-15', 15.200, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-21 17:50:39'),
(31, 61, NULL, 'ECH002', '2023-01-16', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-21 17:50:39'),
(32, 61, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-21 17:50:39'),
(33, 61, NULL, 'ECH004', '2023-01-18', 17.100, 31.000, 46.500, 2.000, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', NULL, '2025-09-21 17:50:39'),
(34, 61, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-21 17:50:39'),
(35, 61, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-21 17:50:39'),
(36, 61, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-21 17:50:39'),
(37, 61, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-21 17:50:39'),
(38, 61, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-21 17:50:39'),
(39, 61, NULL, 'ECH010', '2023-01-24', NULL, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-21 17:50:39'),
(40, 61, NULL, 'ECH001', '2023-01-15', 15.200, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-21 17:51:56'),
(41, 61, NULL, 'ECH002', '2023-01-16', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-21 17:51:56'),
(42, 61, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-21 17:51:56'),
(43, 61, NULL, 'ECH004', '2023-01-18', 17.100, 31.000, 46.500, 2.000, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', NULL, '2025-09-21 17:51:56'),
(44, 61, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-21 17:51:56'),
(45, 61, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-21 17:51:56'),
(46, 61, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-21 17:51:56'),
(47, 61, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-21 17:51:56'),
(48, 61, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-21 17:51:56'),
(49, 61, NULL, 'ECH010', '2023-01-24', NULL, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-21 17:51:56'),
(50, 61, NULL, 'ECH001', '2023-01-15', 15.200, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-21 18:36:38'),
(51, 61, NULL, 'ECH002', '2023-01-16', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-21 18:36:38'),
(52, 61, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-21 18:36:38'),
(53, 61, NULL, 'ECH004', '2023-01-18', 17.100, 31.000, 46.500, 2.000, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', NULL, '2025-09-21 18:36:38'),
(54, 61, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-21 18:36:38'),
(55, 61, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-21 18:36:38'),
(56, 61, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:36:38'),
(57, 61, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-21 18:36:38'),
(58, 61, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-21 18:36:38'),
(59, 61, NULL, 'ECH010', '2023-01-24', NULL, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:36:38'),
(60, 43, NULL, 'ECH001', '2023-01-15', 15.200, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-21 18:37:33'),
(61, 43, NULL, 'ECH002', '2023-01-16', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-21 18:37:33'),
(62, 43, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-21 18:37:33'),
(63, 43, NULL, 'ECH004', '2023-01-18', 17.100, 31.000, 46.500, 2.000, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', NULL, '2025-09-21 18:37:33'),
(64, 43, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-21 18:37:33'),
(65, 43, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-21 18:37:33'),
(66, 43, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:37:33'),
(67, 43, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-21 18:37:33'),
(68, 43, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-21 18:37:33'),
(69, 43, NULL, 'ECH010', '2023-01-24', NULL, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:37:33'),
(70, 62, NULL, 'ECH001', '2023-01-15', 15.400, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-21 18:48:14'),
(71, 62, NULL, 'ECH002', '2023-01-16', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-21 18:48:14'),
(72, 62, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-21 18:48:14'),
(74, 62, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-21 18:48:14'),
(75, 62, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-21 18:48:14'),
(76, 62, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:48:14'),
(77, 62, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-21 18:48:14'),
(78, 62, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-21 18:48:14'),
(79, 62, NULL, 'ECH010', '2023-01-24', NULL, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-21 18:48:14'),
(80, 44, NULL, 'ECH001', '2023-01-15', 15.200, 28.500, 42.300, 2.000, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(81, 44, NULL, 'ECH002', '0000-00-00', 16.800, 30.100, 45.200, 2.000, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(82, 44, NULL, 'ECH003', '2023-01-17', 14.500, NULL, 40.900, NULL, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(83, 44, NULL, 'ECH004', '2023-01-18', 17.100, 31.000, 46.500, 2.000, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49'),
(84, 44, NULL, 'ECH005', '2023-01-19', 15.900, 29.700, 44.100, 2.000, 0.400, 252.000, 2.100, 0.800, 3.200, 0.050, 8.400, 13.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(85, 44, NULL, 'ECH006', '2023-01-20', 18.000, 32.400, 47.300, 2.000, 0.500, 265.000, 2.000, 0.700, 3.100, 0.040, 8.600, 17.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(86, 44, NULL, 'ECH007', '2023-01-21', 14.900, 28.200, 41.700, 2.000, 0.600, 247.000, 2.300, 0.900, 3.400, 0.060, 8.900, 15.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49'),
(87, 44, NULL, 'ECH008', '2023-01-22', 16.300, 29.900, 43.800, 2.000, 0.500, 253.000, 2.100, 0.800, 3.200, 0.050, 8.300, 14.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(88, 44, NULL, 'ECH009', '2023-01-23', 17.500, 31.600, 47.000, 2.000, 0.400, 258.000, 1.900, 0.700, 3.100, 0.040, 8.100, 16.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(89, 44, NULL, 'ECH010', '2023-01-24', 20.000, 28.900, 42.900, 2.000, 0.500, 251.000, 2.200, 0.800, 3.300, 0.050, 8.500, 15.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49'),
(90, 44, NULL, 'ECH0011', '0000-00-00', 14.000, 30.000, 40.000, 0.094, 0.600, 255.000, 2.000, 0.600, 3.000, 0.060, 8.100, 12.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49'),
(91, 44, NULL, 'ECH0012', '0000-00-00', 15.000, 29.000, 41.000, 0.092, 0.300, 255.000, 3.000, 0.600, 3.400, 0.070, 8.100, 12.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(92, 44, NULL, 'ECH0013', '0000-00-00', 16.000, 29.100, 41.000, 0.093, 0.400, 254.000, 3.000, 0.700, 3.000, 0.060, 8.100, 12.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(93, 44, NULL, 'ECH0014', '0000-00-00', 18.000, 29.100, 40.000, 0.094, 0.500, 266.000, 3.000, 0.500, 3.800, 0.090, 8.500, 14.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(94, 44, NULL, 'ECH0015', '0000-00-00', 20.000, 28.900, 42.000, 0.094, 0.600, 260.000, 4.000, 0.800, 3.200, 0.050, 8.600, 15.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(95, 44, NULL, 'ECH0016', '0000-00-00', 20.000, 17.000, 42.000, 0.090, 0.800, 264.000, 4.000, 0.900, 3.000, 0.070, 8.400, 16.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(96, 44, NULL, 'ECH0017', '0000-00-00', 20.000, 20.000, 42.000, 0.093, 0.200, 230.000, 2.100, 0.100, 3.400, 0.060, 8.300, 17.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(97, 44, NULL, 'ECH0018', '0000-00-00', 10.000, 10.000, 43.000, 0.093, 0.300, 220.000, 2.100, 0.100, 3.000, 0.050, 8.600, 12.000, 'Cendres volantes', NULL, '2025-09-22 13:33:49'),
(98, 44, NULL, 'ECH0019', '0000-00-00', 15.000, 19.000, 43.300, 0.094, 0.400, 240.000, 2.300, 0.900, 3.100, 0.050, 8.500, 14.000, 'Laitier', NULL, '2025-09-22 13:33:49'),
(99, 44, NULL, 'ECH0020', '0000-00-00', 16.000, 18.000, 43.200, 0.096, 0.500, 256.000, 2.400, 0.800, 3.600, 0.060, 8.300, 16.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49'),
(100, 44, NULL, 'ECH0021', '0000-00-00', 17.000, 18.000, 43.500, 0.097, 0.600, 260.000, 3.100, 0.700, 3.100, 0.040, 8.400, 15.000, 'Pouzzolane', NULL, '2025-09-22 13:33:49');


CREATE TABLE `familles_ciment` (
  `id` int(11) NOT NULL,
  `code` varchar(10) NOT NULL,
  `nom` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `familles_ciment`
--

INSERT INTO `familles_ciment` (`id`, `code`, `nom`) VALUES
(1, 'CEM I', 'Ciment Portland'),
(2, 'CEM II', 'Ciment Portland composé'),
(3, 'CEM III', 'Ciment de haut fourneau'),
(4, 'CEM IV', 'Ciment pouzzolanique'),
(5, 'CEM V', 'Ciment composé');

-- --------------------------------------------------------

--
-- Structure de la table `proprietes_chimiques`
--




CREATE TABLE `types_ciment` (
  `id` int(11) NOT NULL,
  `famille_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `sr` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `types_ciment`
--

INSERT INTO `types_ciment` (`id`, `famille_id`, `code`, `description`, `sr`) VALUES
(1, 1, 'CEM I', 'Ciment Portland', 0),
(2, 1, 'CEM I-SR 0', 'Ciment Portland SR ', 1),
(3, 1, 'CEM I-SR 3', 'Ciment Portland SR ', 1),
(4, 1, 'CEM I-SR 5', 'Ciment Portland SR ', 1),
(5, 2, 'CEM II/A-S', 'Portland au laitier ', 0),
(6, 2, 'CEM II/B-S', 'Portland au laitier ', 0),
(7, 2, 'CEM II/A-D', 'Ciment portland a la fumee de silice ', 0),
(8, 2, 'CEM II/A-P', 'Ciment portland a la pouzzolane naturelle', 0),
(9, 2, 'CEM II/B-P', 'Ciment portland a la pouzzolane naturelle', 0),
(10, 2, 'CEM II/A-Q', 'Ciment portland a la pouzzolane naturelle calcinee', 0),
(11, 2, 'CEM II/B-Q', 'Ciment portland a la pouzzolane naturelle calcinee', 0),
(12, 2, 'CEM II/A-V', 'Ciment portland aux cendres volantes ', 0),
(13, 2, 'CEM II/B-V', 'Ciment portland aux cendres volantes ', 0),
(14, 2, 'CEM II/A-W', 'Ciment portland aux cendres volantes ', 0),
(15, 2, 'CEM II/B-W', 'Ciment portland aux cendres volantes ', 0),
(16, 2, 'CEM II/A-T', 'Ciment portland aux schistes calcine ', 0),
(17, 2, 'CEM II/B-T', 'Ciment portland aux schistes calcine ', 0),
(18, 2, 'CEM II/A-L', 'Ciment portland au calcaire ', 0),
(19, 2, 'CEM II/B-L', 'Ciment portland au calcaire ', 0),
(20, 2, 'CEM II/A-LL', 'Ciment portland au calcaire ', 0),
(21, 2, 'CEM II/B-LL', 'Ciment portland au calcaire ', 0),
(22, 2, 'CEM II/A-M', 'Ciment portland compose ', 0),
(23, 2, 'CEM II/B-M', 'Ciment portland compose ', 0),
(24, 3, 'CEM III/A', 'Ciment Haut fourneau ', 0),
(25, 3, 'CEM III/B', 'Ciment Haut fourneau ', 0),
(26, 3, 'CEM III/C', 'Ciment Haut fourneau ', 0),
(27, 3, 'CEM III/B-SR', 'Ciment Haut fourneau SR', 1),
(28, 3, 'CEM III/C-SR', 'Ciment Haut fourneau SR', 1),
(29, 4, 'CEM IV/A', 'Ciment Pouzzolanique ', 0),
(30, 4, 'CEM IV/B', 'Ciment Pouzzolanique ', 0),
(31, 4, 'CEM IV/A-SR', 'Ciment Pouzzolanique SR ', 1),
(32, 4, 'CEM IV/B-SR', 'Ciment Pouzzolanique SR ', 1),
(33, 5, 'CEM V/A', 'Ciment Compose ', 0),
(34, 5, 'CEM V/B', 'Ciment Compose ', 0);

-- --------------------------------------------------------

--
-- Structure de la table `types_ciment_classes`
--

CREATE TABLE `types_ciment_classes` (
  `id` int(11) NOT NULL,
  `type_ciment_id` int(11) NOT NULL,
  `classe_resistance_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `types_ciment_classes`
--

INSERT INTO `types_ciment_classes` (`id`, `type_ciment_id`, `classe_resistance_id`) VALUES
(1, 1, 1),
(30, 1, 2),
(59, 1, 3),
(88, 1, 4),
(117, 1, 5),
(146, 1, 6),
(2, 2, 1),
(31, 2, 2),
(60, 2, 3),
(89, 2, 4),
(118, 2, 5),
(147, 2, 6),
(3, 3, 1),
(32, 3, 2),
(61, 3, 3),
(90, 3, 4),
(119, 3, 5),
(148, 3, 6),
(4, 4, 1),
(33, 4, 2),
(62, 4, 3),
(91, 4, 4),
(120, 4, 5),
(149, 4, 6),
(5, 5, 1),
(34, 5, 2),
(63, 5, 3),
(92, 5, 4),
(121, 5, 5),
(150, 5, 6),
(6, 6, 1),
(35, 6, 2),
(64, 6, 3),
(93, 6, 4),
(122, 6, 5),
(151, 6, 6),
(7, 7, 1),
(36, 7, 2),
(65, 7, 3),
(94, 7, 4),
(123, 7, 5),
(152, 7, 6),
(8, 8, 1),
(37, 8, 2),
(66, 8, 3),
(95, 8, 4),
(124, 8, 5),
(153, 8, 6),
(9, 9, 1),
(38, 9, 2),
(67, 9, 3),
(96, 9, 4),
(125, 9, 5),
(154, 9, 6),
(10, 10, 1),
(39, 10, 2),
(68, 10, 3),
(97, 10, 4),
(126, 10, 5),
(155, 10, 6),
(11, 11, 1),
(40, 11, 2),
(69, 11, 3),
(98, 11, 4),
(127, 11, 5),
(156, 11, 6),
(12, 12, 1),
(41, 12, 2),
(70, 12, 3),
(99, 12, 4),
(128, 12, 5),
(157, 12, 6),
(13, 13, 1),
(42, 13, 2),
(71, 13, 3),
(100, 13, 4),
(129, 13, 5),
(158, 13, 6),
(14, 14, 1),
(43, 14, 2),
(72, 14, 3),
(101, 14, 4),
(130, 14, 5),
(159, 14, 6),
(15, 15, 1),
(44, 15, 2),
(73, 15, 3),
(102, 15, 4),
(131, 15, 5),
(160, 15, 6),
(16, 16, 1),
(45, 16, 2),
(74, 16, 3),
(103, 16, 4),
(132, 16, 5),
(161, 16, 6),
(17, 17, 1),
(46, 17, 2),
(75, 17, 3),
(104, 17, 4),
(133, 17, 5),
(162, 17, 6),
(18, 18, 1),
(47, 18, 2),
(76, 18, 3),
(105, 18, 4),
(134, 18, 5),
(163, 18, 6),
(19, 19, 1),
(48, 19, 2),
(77, 19, 3),
(106, 19, 4),
(135, 19, 5),
(164, 19, 6),
(20, 20, 1),
(49, 20, 2),
(78, 20, 3),
(107, 20, 4),
(136, 20, 5),
(165, 20, 6),
(21, 21, 1),
(50, 21, 2),
(79, 21, 3),
(108, 21, 4),
(137, 21, 5),
(166, 21, 6),
(22, 22, 1),
(51, 22, 2),
(80, 22, 3),
(109, 22, 4),
(138, 22, 5),
(167, 22, 6),
(23, 23, 1),
(52, 23, 2),
(81, 23, 3),
(110, 23, 4),
(139, 23, 5),
(168, 23, 6),
(256, 24, 1),
(261, 24, 2),
(266, 24, 3),
(271, 24, 4),
(276, 24, 5),
(281, 24, 6),
(286, 24, 7),
(291, 24, 8),
(296, 24, 9),
(257, 25, 1),
(262, 25, 2),
(267, 25, 3),
(272, 25, 4),
(277, 25, 5),
(282, 25, 6),
(287, 25, 7),
(292, 25, 8),
(297, 25, 9),
(258, 26, 1),
(263, 26, 2),
(268, 26, 3),
(273, 26, 4),
(278, 26, 5),
(283, 26, 6),
(288, 26, 7),
(293, 26, 8),
(298, 26, 9),
(259, 27, 1),
(264, 27, 2),
(269, 27, 3),
(274, 27, 4),
(279, 27, 5),
(284, 27, 6),
(289, 27, 7),
(294, 27, 8),
(299, 27, 9),
(260, 28, 1),
(265, 28, 2),
(270, 28, 3),
(275, 28, 4),
(280, 28, 5),
(285, 28, 6),
(290, 28, 7),
(295, 28, 8),
(300, 28, 9),
(24, 29, 1),
(53, 29, 2),
(82, 29, 3),
(111, 29, 4),
(140, 29, 5),
(169, 29, 6),
(25, 30, 1),
(54, 30, 2),
(83, 30, 3),
(112, 30, 4),
(141, 30, 5),
(170, 30, 6),
(26, 31, 1),
(55, 31, 2),
(84, 31, 3),
(113, 31, 4),
(142, 31, 5),
(171, 31, 6),
(27, 32, 1),
(56, 32, 2),
(85, 32, 3),
(114, 32, 4),
(143, 32, 5),
(172, 32, 6),
(28, 33, 1),
(57, 33, 2),
(86, 33, 3),
(115, 33, 4),
(144, 33, 5),
(173, 33, 6),
(29, 34, 1),
(58, 34, 2),
(87, 34, 3),
(116, 34, 4),
(145, 34, 5),
(174, 34, 6);

-- --------------------------------------------------------


ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `classes_resistance`
--
ALTER TABLE `classes_resistance`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_clients_typecement` (`typecement_id`);

--
-- Index pour la table `client_types_ciment`
--
ALTER TABLE `client_types_ciment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `typecement_id` (`typecement_id`);





--
-- Index pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_client_type_ciment` (`client_type_ciment_id`);

  ADD UNIQUE KEY `unique_sample` (`client_id`,`num_ech`,`date_test`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_produit` (`produit_id`),
  ADD KEY `idx_date` (`date_test`);


--
-- Index pour la table `familles_ciment`
--
ALTER TABLE `familles_ciment`
  ADD PRIMARY KEY (`id`);


--
-- Index pour la table `types_ciment`
--
ALTER TABLE `types_ciment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `famille_id` (`famille_id`);

--
-- Index pour la table `types_ciment_classes`
--
ALTER TABLE `types_ciment_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_ciment_id` (`type_ciment_id`,`classe_resistance_id`),
  ADD KEY `classe_resistance_id` (`classe_resistance_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);



--
-- AUTO_INCREMENT pour la table `classes_resistance`
--
ALTER TABLE `classes_resistance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `client_types_ciment`
--
ALTER TABLE `client_types_ciment`

  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;


--
-- AUTO_INCREMENT pour la table `echantillons`
--
ALTER TABLE `echantillons`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;


--
-- AUTO_INCREMENT pour la table `familles_ciment`
--
ALTER TABLE `familles_ciment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;


--
-- AUTO_INCREMENT pour la table `types_ciment`
--
ALTER TABLE `types_ciment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT pour la table `types_ciment_classes`
--
ALTER TABLE `types_ciment_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=301;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour la table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `fk_clients_typecement` FOREIGN KEY (`typecement_id`) REFERENCES `types_ciment` (`id`);

--
-- Contraintes pour la table `client_types_ciment`
--
ALTER TABLE `client_types_ciment`
  ADD CONSTRAINT `client_types_ciment_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `client_types_ciment_ibfk_2` FOREIGN KEY (`typecement_id`) REFERENCES `types_ciment` (`id`) ON DELETE CASCADE;


-- Contraintes pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD CONSTRAINT `fk_client_type_ciment` FOREIGN KEY (`client_type_ciment_id`) REFERENCES `client_types_ciment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `types_ciment`
--
ALTER TABLE `types_ciment`
  ADD CONSTRAINT `types_ciment_ibfk_1` FOREIGN KEY (`famille_id`) REFERENCES `familles_ciment` (`id`);

--
-- Contraintes pour la table `types_ciment_classes`
--
ALTER TABLE `types_ciment_classes`
  ADD CONSTRAINT `types_ciment_classes_ibfk_1` FOREIGN KEY (`type_ciment_id`) REFERENCES `types_ciment` (`id`),
  ADD CONSTRAINT `types_ciment_classes_ibfk_2` FOREIGN KEY (`classe_resistance_id`) REFERENCES `classes_resistance` (`id`);
COMMIT;
