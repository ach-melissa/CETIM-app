<<<<<<< Updated upstream


=======
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 19 sep. 2025 à 13:39
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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



/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ciment_conformite`
--

-- --------------------------------------------------------

=======
>>>>>>> Stashed changes
--
-- Structure de la table `categories`
--

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
<<<<<<< Updated upstream
(64, 18, 34),
(72, 18, 32),
(73, 18, 20),
(74, 18, 16),
(75, 20, 24);
=======
(64, 18, 34);
>>>>>>> Stashed changes

-- --------------------------------------------------------

--
-- Structure de la table `coefficients_k`
--

CREATE TABLE `coefficients_k` (
  `id` int(11) NOT NULL,
  `n_min` int(11) NOT NULL,
  `n_max` int(11) NOT NULL,
  `n_range` varchar(20) NOT NULL,
  `k_pk5` decimal(4,2) NOT NULL,
  `k_pk10` decimal(4,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `coefficients_k`
--

INSERT INTO `coefficients_k` (`id`, `n_min`, `n_max`, `n_range`, `k_pk5`, `k_pk10`) VALUES
(1, 20, 21, '20 à 21', 2.40, 1.93),
(2, 22, 23, '22 à 23', 2.35, 1.89),
(3, 24, 25, '24 à 25', 2.31, 1.85),
(4, 26, 27, '26 à 27', 2.27, 1.82),
(5, 28, 29, '28 à 29', 2.24, 1.80),
(6, 30, 34, '30 à 34', 2.22, 1.78),
(7, 35, 39, '35 à 39', 2.17, 1.73),
(8, 40, 44, '40 à 44', 2.13, 1.70),
(9, 45, 49, '45 à 49', 2.09, 1.67),
(10, 50, 59, '50 à 59', 2.07, 1.65),
(11, 60, 69, '60 à 69', 2.02, 1.61),
(12, 70, 79, '70 à 79', 1.99, 1.58),
(13, 80, 89, '80 à 89', 1.97, 1.56),
(14, 90, 99, '90 à 99', 1.94, 1.54),
(15, 100, 149, '100 à 149', 1.93, 1.53),
(16, 150, 199, '150 à 199', 1.87, 1.48),
(17, 200, 299, '200 à 299', 1.84, 1.45),
(18, 300, 399, '300 à 399', 1.80, 1.42),
(19, 401, 1000000, '> 400', 1.78, 1.40);

-- --------------------------------------------------------

--
-- Structure de la table `conditions_statistiques`
--

CREATE TABLE `conditions_statistiques` (
  `id` int(11) NOT NULL,
  `n_min` int(11) NOT NULL,
  `n_max` int(11) NOT NULL,
  `pk_percentile` decimal(4,2) NOT NULL,
  `ca_probabilite` decimal(4,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `conditions_statistiques`
--

INSERT INTO `conditions_statistiques` (`id`, `n_min`, `n_max`, `pk_percentile`, `ca_probabilite`) VALUES
(1, 20, 39, 10.00, 0.00),
(2, 40, 54, 10.00, 1.00),
(3, 40, 54, 10.00, 2.00),
(4, 40, 54, 10.00, 3.00),
(5, 40, 54, 10.00, 4.00),
(6, 40, 54, 10.00, 5.00),
(7, 40, 54, 10.00, 6.00),
(8, 40, 54, 10.00, 7.00);

-- --------------------------------------------------------

--
-- Structure de la table `controles_conformite`
--

CREATE TABLE `controles_conformite` (
  `id` int(11) NOT NULL,
  `parametre` varchar(255) NOT NULL,
  `type_controle` enum('mesure','attribut') NOT NULL,
  `methode_reference` varchar(100) DEFAULT NULL,
  `categorie` varchar(100) DEFAULT NULL,
  `ciment_soumis` varchar(255) DEFAULT NULL,
  `frequence_courante` varchar(50) DEFAULT NULL,
  `frequence_admission` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `controles_conformite`
--

INSERT INTO `controles_conformite` (`id`, `parametre`, `type_controle`, `methode_reference`, `categorie`, `ciment_soumis`, `frequence_courante`, `frequence_admission`) VALUES
(1, 'Résistance  à 2 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
(2, 'Résistance  à 7 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
(3, 'Résistance à 28 jours', 'mesure', 'EN 196-1', 'mécanique', 'Tous', '2/semaine', '4/semaine'),
(4, 'Temps debut de prise', 'attribut', 'EN 196-3', 'physique', 'Tous', '2/semaine', '4/semaine'),
(5, 'Stabilité (expansion)', 'attribut', 'EN 196-3', 'physique', 'Tous', '1/semaine', '4/semaine'),
(6, 'Perte au feu', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
(7, 'Résidu insoluble', 'attribut', 'EN 196-2', 'chimique', 'CEM I, CEM III', '2/mois', '1/semaine'),
(8, 'Teneur en sulfate', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/semaine', '4/semaine'),
(9, 'Teneur en chlorure', 'attribut', 'EN 196-2', 'chimique', 'Tous', '2/mois', '1/semaine'),
(10, 'C3A dans le clinker', 'attribut', 'EN 196-2 (calc)', 'chimique', 'CEM I-SR 0, CEM I-SR 3, CEM I-SR 5, CEM II/A-SR, CEM IV/B-SR', '2/mois', '1/semaine'),
(11, 'C3A dans le clinker', '', 'EN 196-2 (calc)', 'chimique', 'CEM II/A-SR, CEM IV/B-SR', NULL, NULL),
(12, 'Pouzzolanicité', 'attribut', 'EN 196-5', 'chimique', 'CEM IV', '2/mois', '1/semaine'),
(13, 'Chaleur d’hydratation', 'attribut', 'EN 196-8 ou EN 196-9', 'physique', 'Ciments courants à faible chaleur d’hydratation', '1/mois', '1/semaine'),
(14, 'Composition', 'attribut', NULL, 'chimique', 'Tous', '1/mois', '1/semaine');

-- --------------------------------------------------------

--
-- Structure de la table `echantillons`
--

CREATE TABLE `echantillons` (
  `id` bigint(20) NOT NULL,
<<<<<<< Updated upstream
  `client_type_ciment_id` int(11) NOT NULL,
=======
  `client_id` int(11) NOT NULL,
  `produit_id` int(11) DEFAULT NULL,
>>>>>>> Stashed changes
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

--
-- Déchargement des données de la table `echantillons`
--

<<<<<<< Updated upstream
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
=======
INSERT INTO `echantillons` (`id`, `client_id`, `produit_id`, `phase`, `num_ech`, `date_test`, `rc2j`, `rc7j`, `rc28j`, `prise`, `stabilite`, `hydratation`, `pfeu`, `r_insoluble`, `so3`, `chlorure`, `c3a`, `ajout_percent`, `type_ajout`, `source`, `date_import`) VALUES
(1, 18, 1, 'fabrication', 'CETIM-001', '2023-01-15', 15.200, 28.500, 42.300, 2.150, 0.500, 250.000, 2.100, 0.800, 3.200, 0.050, 8.500, 15.000, 'Laitier', 'Laboratoire', '2025-09-18 23:27:13'),
(2, 18, 1, 'fabrication', 'CETIM-002', '2023-01-16', 16.800, 30.100, 45.200, 2.100, 0.400, 255.000, 2.000, 0.700, 3.100, 0.040, 8.200, 16.000, 'Laitier', 'Laboratoire', '2025-09-18 23:27:13'),
(3, 19, 5, 'livraison', 'ENPC-101', '2023-02-01', 14.500, 27.800, 40.900, 2.200, 0.600, 248.000, 2.200, 0.900, 3.300, 0.060, 8.700, 14.000, 'Pouzzolane', 'Site client', '2025-09-18 23:27:19'),
(4, 20, 24, 'fabrication', 'SONACIM-201', '2023-03-05', 17.100, 31.000, 46.500, 2.050, 0.500, 260.000, 1.900, 0.600, 3.000, 0.030, 8.000, 12.000, 'Pouzzolane', 'Laboratoire', '2025-09-18 23:27:24'),
(5, 21, 29, 'fabrication', 'LAFARGE-301', '2023-04-12', 18.000, 32.000, 50.000, 2.100, 0.400, 270.000, 1.800, 0.700, 3.200, 0.040, 8.300, 18.000, 'Cendres volantes', 'Laboratoire', '2025-09-18 23:27:30'),
(6, 22, 33, 'livraison', 'HOLCIM-401', '2023-05-20', 19.500, 34.200, 52.800, 2.080, 0.450, 280.000, 2.200, 0.750, 3.400, 0.050, 8.900, 20.000, 'Laitier', 'Site client', '2025-09-18 23:27:34'),
(7, 18, 1, 'fabrication', 'CETIM-003', '2023-01-20', 15.700, 29.000, 43.100, 2.120, 0.480, 252.000, 2.050, 0.750, 3.150, 0.045, 8.400, 15.500, 'Laitier', 'Laboratoire', '2025-09-18 23:46:03'),
(8, 18, 1, 'fabrication', 'CETIM-004', '2023-01-25', 16.200, 29.800, 44.000, 2.180, 0.500, 254.000, 2.150, 0.820, 3.250, 0.055, 8.600, 16.200, 'Laitier', 'Laboratoire', '2025-09-18 23:46:03'),
(9, 19, 5, 'livraison', 'ENPC-102', '2023-02-05', 14.800, 28.200, 41.500, 2.230, 0.620, 249.000, 2.300, 0.910, 3.350, 0.065, 8.800, 14.300, 'Pouzzolane', 'Site client', '2025-09-18 23:46:03'),
(10, 19, 5, 'livraison', 'ENPC-103', '2023-02-12', 15.300, 28.900, 42.400, 2.190, 0.600, 251.000, 2.250, 0.860, 3.200, 0.050, 8.500, 15.000, 'Pouzzolane', 'Site client', '2025-09-18 23:46:03'),
(11, 20, 24, 'fabrication', 'SONACIM-202', '2023-03-10', 17.400, 31.500, 47.200, 2.060, 0.490, 262.000, 1.850, 0.650, 2.950, 0.035, 7.900, 12.500, 'Pouzzolane', 'Laboratoire', '2025-09-18 23:46:03'),
(12, 20, 24, 'fabrication', 'SONACIM-203', '2023-03-15', 17.900, 32.000, 48.000, 2.040, 0.470, 265.000, 1.920, 0.700, 3.050, 0.040, 8.100, 13.000, 'Pouzzolane', 'Laboratoire', '2025-09-18 23:46:03'),
(13, 21, 29, 'fabrication', 'LAFARGE-302', '2023-04-15', 18.200, 32.500, 50.500, 2.110, 0.420, 272.000, 1.850, 0.680, 3.250, 0.042, 8.200, 18.200, 'Cendres volantes', 'Laboratoire', '2025-09-18 23:46:03'),
(14, 21, 29, 'fabrication', 'LAFARGE-303', '2023-04-20', 18.600, 33.000, 51.200, 2.090, 0.430, 274.000, 1.820, 0.720, 3.300, 0.048, 8.500, 18.600, 'Cendres volantes', 'Laboratoire', '2025-09-18 23:46:03'),
(15, 22, 33, 'livraison', 'HOLCIM-402', '2023-05-25', 19.800, 34.800, 53.200, 2.100, 0.470, 281.000, 2.250, 0.770, 3.450, 0.055, 9.000, 20.500, 'Laitier', 'Site client', '2025-09-18 23:46:03'),
(16, 22, 33, 'livraison', 'HOLCIM-403', '2023-05-28', 20.000, 35.200, 54.000, 2.070, 0.460, 285.000, 2.180, 0.790, 3.500, 0.050, 9.100, 21.000, 'Laitier', 'Site client', '2025-09-18 23:46:03'),
(17, 18, 2, 'fabrication', 'CETIM-005', '2023-06-01', 16.500, 30.000, 45.000, 2.140, 0.510, 258.000, 2.000, 0.800, 3.200, 0.052, 8.300, 17.000, 'Laitier', 'Laboratoire', '2025-09-18 23:46:03'),
(18, 18, 2, 'fabrication', 'CETIM-006', '2023-06-05', 16.900, 30.500, 45.800, 2.160, 0.490, 260.000, 2.050, 0.780, 3.250, 0.048, 8.400, 17.500, 'Laitier', 'Laboratoire', '2025-09-18 23:46:03'),
(19, 19, 6, 'livraison', 'ENPC-104', '2023-06-10', 15.800, 29.500, 43.200, 2.200, 0.600, 253.000, 2.300, 0.850, 3.300, 0.055, 8.600, 15.800, 'Pouzzolane', 'Site client', '2025-09-18 23:46:03'),
(20, 19, 6, 'livraison', 'ENPC-105', '2023-06-15', 16.200, 30.100, 44.000, 2.180, 0.590, 256.000, 2.250, 0.830, 3.250, 0.050, 8.700, 16.200, 'Pouzzolane', 'Site client', '2025-09-18 23:46:03'),
(21, 20, 25, 'fabrication', 'SONACIM-204', '2023-06-18', 18.200, 32.800, 49.000, 2.050, 0.480, 268.000, 1.950, 0.690, 3.100, 0.038, 8.200, 14.000, 'Pouzzolane', 'Laboratoire', '2025-09-18 23:46:03'),
(22, 20, 25, 'fabrication', 'SONACIM-205', '2023-06-20', 18.700, 33.200, 49.800, 2.030, 0.470, 270.000, 1.900, 0.710, 3.200, 0.040, 8.300, 14.500, 'Pouzzolane', 'Laboratoire', '2025-09-18 23:46:03'),
(23, 21, 30, 'fabrication', 'LAFARGE-304', '2023-06-22', 19.000, 33.500, 50.500, 2.100, 0.450, 275.000, 1.850, 0.680, 3.250, 0.042, 8.400, 18.500, 'Cendres volantes', 'Laboratoire', '2025-09-18 23:46:03'),
(24, 21, 30, 'fabrication', 'LAFARGE-305', '2023-06-25', 19.200, 34.000, 51.000, 2.080, 0.460, 278.000, 1.900, 0.700, 3.300, 0.045, 8.500, 19.000, 'Cendres volantes', 'Laboratoire', '2025-09-18 23:46:03'),
(25, 22, 34, 'livraison', 'HOLCIM-404', '2023-06-28', 20.200, 35.500, 54.500, 2.100, 0.480, 288.000, 2.250, 0.760, 3.600, 0.055, 9.200, 21.500, 'Laitier', 'Site client', '2025-09-18 23:46:03');
>>>>>>> Stashed changes

-- --------------------------------------------------------

--
-- Structure de la table `familles_ciment`
--

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

CREATE TABLE `proprietes_chimiques` (
  `id` int(11) NOT NULL,
  `categorie` enum('pert_au_feu','residu_insoluble','teneur_chlour','pouzzolanicite','SO3','SO3_supp','pouzzolanicite_supp','C3A') NOT NULL,
  `famille_ciment_id` int(11) DEFAULT NULL,
  `classe_resistance_id` int(11) DEFAULT NULL,
  `type_court_terme` enum('N','R','L') DEFAULT NULL,
  `limit_inf` decimal(5,2) DEFAULT NULL,
  `limit_sup` decimal(5,2) DEFAULT NULL,
  `limit_garanti` decimal(5,2) DEFAULT NULL,
  `description_garanti` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `proprietes_chimiques`
--

INSERT INTO `proprietes_chimiques` (`id`, `categorie`, `famille_ciment_id`, `classe_resistance_id`, `type_court_terme`, `limit_inf`, `limit_sup`, `limit_garanti`, `description_garanti`) VALUES
(1, 'pert_au_feu', 1, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
(2, 'pert_au_feu', 2, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
(3, 'residu_insoluble', 1, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
(4, 'residu_insoluble', 3, NULL, NULL, NULL, 5.00, 5.00, 'Limit sup = 5%'),
(5, 'teneur_chlour', NULL, NULL, NULL, NULL, 0.10, 0.10, 'Limit sup = 0.10%'),
(6, 'pouzzolanicite', 4, NULL, 'N', NULL, NULL, NULL, 'Satisfait à l essai - Positive après 15 jours'),
(7, 'pouzzolanicite', 4, NULL, 'R', NULL, NULL, NULL, 'Satisfait à l essai - Positive après 15 jours'),
(8, 'SO3', 1, 1, NULL, NULL, 3.50, 4.00, NULL),
(9, 'SO3', 1, 2, NULL, NULL, 3.50, 4.00, NULL),
(10, 'SO3', 1, 3, NULL, NULL, 3.50, 4.00, NULL),
(11, 'SO3', 1, 4, NULL, NULL, 4.00, 4.50, NULL),
(12, 'SO3', 1, 5, NULL, NULL, 4.00, 4.50, NULL),
(13, 'SO3', 1, 6, NULL, NULL, 4.00, 4.50, NULL),
(14, 'SO3', 2, 1, NULL, NULL, 3.50, 4.00, NULL),
(15, 'SO3', 2, 2, NULL, NULL, 3.50, 4.00, NULL),
(16, 'SO3', 2, 3, NULL, NULL, 3.50, 4.00, NULL),
(17, 'SO3', 2, 4, NULL, NULL, 4.00, 4.50, NULL),
(18, 'SO3', 2, 5, NULL, NULL, 4.00, 4.50, NULL),
(19, 'SO3', 2, 6, NULL, NULL, 4.00, 4.50, NULL),
(20, 'SO3', 4, 1, NULL, NULL, 3.50, 4.00, NULL),
(21, 'SO3', 4, 2, NULL, NULL, 3.50, 4.00, NULL),
(22, 'SO3', 4, 3, NULL, NULL, 3.50, 4.00, NULL),
(23, 'SO3', 4, 4, NULL, NULL, 4.00, 4.50, NULL),
(24, 'SO3', 4, 5, NULL, NULL, 4.00, 4.50, NULL),
(25, 'SO3', 4, 6, NULL, NULL, 4.00, 4.50, NULL),
(26, 'SO3', 5, 1, NULL, NULL, 3.50, 4.00, NULL),
(27, 'SO3', 5, 2, NULL, NULL, 3.50, 4.00, NULL),
(28, 'SO3', 5, 3, NULL, NULL, 3.50, 4.00, NULL),
(29, 'SO3', 5, 4, NULL, NULL, 4.00, 4.50, NULL),
(30, 'SO3', 5, 5, NULL, NULL, 4.00, 4.50, NULL),
(31, 'SO3', 5, 6, NULL, NULL, 4.00, 4.50, NULL),
(32, 'SO3', 3, NULL, NULL, NULL, 4.00, 4.50, 'For CEM III/A and CEM III/B'),
(33, 'SO3', 3, NULL, NULL, NULL, 4.00, 5.00, 'For CEM III/C'),
(34, 'SO3_supp', 1, 1, NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5N'),
(35, 'SO3_supp', 1, 2, NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5R'),
(36, 'SO3_supp', 1, 3, NULL, NULL, 3.00, 3.00, 'For SR cements: 42.5N'),
(37, 'SO3_supp', 1, 4, NULL, NULL, 3.50, 3.50, 'For SR cements: 42.5R'),
(38, 'SO3_supp', 1, 5, NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5N'),
(39, 'SO3_supp', 1, 6, NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5R'),
(40, 'SO3_supp', 4, 1, NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5N'),
(41, 'SO3_supp', 4, 2, NULL, NULL, 3.00, 3.00, 'For SR cements: 32.5R'),
(42, 'SO3_supp', 4, 3, NULL, NULL, 3.00, 3.00, 'For SR cements: 42.5N'),
(43, 'SO3_supp', 4, 4, NULL, NULL, 3.50, 3.50, 'For SR cements: 42.5R'),
(44, 'SO3_supp', 4, 5, NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5N'),
(45, 'SO3_supp', 4, 6, NULL, NULL, 3.50, 3.50, 'For SR cements: 52.5R'),
(46, 'pouzzolanicite_supp', 4, NULL, 'N', NULL, NULL, NULL, 'Résultat doit être positif à 8 jours'),
(47, 'pouzzolanicite_supp', 4, NULL, 'R', NULL, NULL, NULL, 'Résultat doit être positif à 8 jours'),
(48, 'C3A', 1, NULL, NULL, NULL, 0.00, 2.00, 'C3A limit for I-SR0: max 0%, garanty 2%'),
(49, 'C3A', 1, NULL, NULL, NULL, 3.00, 4.00, 'C3A limit for I-SR3: max 3%, garanty 4%'),
(50, 'C3A', 1, NULL, NULL, NULL, 5.00, 6.00, 'C3A limit for I-SR5: max 5%, garanty 6%'),
(51, 'C3A', 4, NULL, NULL, NULL, 9.00, 10.00, 'C3A limit for IV/A-SR: max 9%, garanty 10%'),
(52, 'C3A', 4, NULL, NULL, NULL, 9.00, 10.00, 'C3A limit for IV/B-SR: max 9%, garanty 10%');

-- --------------------------------------------------------

--
-- Structure de la table `proprietes_mecaniques`
--

CREATE TABLE `proprietes_mecaniques` (
  `id` int(11) NOT NULL,
  `classe_resistance_id` int(11) NOT NULL,
  `resistance_2j_min` decimal(5,1) DEFAULT NULL,
  `resistance_2j_sup` decimal(5,1) DEFAULT NULL,
  `garantie_2j` decimal(5,1) DEFAULT NULL,
  `resistance_7j_min` decimal(5,1) DEFAULT NULL,
  `resistance_7j_sup` decimal(5,1) DEFAULT NULL,
  `garantie_7j` decimal(5,1) DEFAULT NULL,
  `resistance_28j_min` decimal(5,1) NOT NULL,
  `resistance_28j_sup` decimal(5,1) DEFAULT NULL,
  `garantie_28j` decimal(5,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `proprietes_mecaniques`
--

INSERT INTO `proprietes_mecaniques` (`id`, `classe_resistance_id`, `resistance_2j_min`, `resistance_2j_sup`, `garantie_2j`, `resistance_7j_min`, `resistance_7j_sup`, `garantie_7j`, `resistance_28j_min`, `resistance_28j_sup`, `garantie_28j`) VALUES
(1, 7, NULL, NULL, NULL, 12.0, NULL, 10.0, 32.5, 52.5, 30.0),
(2, 1, NULL, NULL, NULL, 16.0, NULL, 14.0, 32.5, 52.5, 30.0),
(3, 2, 10.0, NULL, 8.0, NULL, NULL, NULL, 32.5, 52.5, 30.0),
(4, 8, NULL, NULL, NULL, 16.0, NULL, 14.0, 42.5, 62.5, 40.0),
(5, 3, 10.0, NULL, 8.0, NULL, NULL, NULL, 42.5, 62.5, 40.0),
(6, 4, 20.0, NULL, 18.0, NULL, NULL, NULL, 42.5, 62.5, 40.0),
(7, 9, 10.0, NULL, 8.0, NULL, NULL, NULL, 52.5, NULL, 50.0),
(8, 5, 20.0, NULL, 18.0, NULL, NULL, NULL, 52.5, NULL, 50.0),
(9, 6, 30.0, NULL, 28.0, NULL, NULL, NULL, 52.5, NULL, 50.0);

-- --------------------------------------------------------

--
-- Structure de la table `proprietes_physiques`
--

CREATE TABLE `proprietes_physiques` (
  `id` int(11) NOT NULL,
  `categorie` enum('temps_debut_prise','stabilite','chaleur_hydratation') NOT NULL,
  `classe_resistance_id` int(11) DEFAULT NULL,
  `famille_ciment_id` int(11) DEFAULT NULL,
  `temps_debut_prise_min` int(11) DEFAULT NULL,
  `temps_debut_prise_sup` int(11) DEFAULT NULL,
  `temps_debut_prise_garanti` int(11) DEFAULT NULL,
  `stabilite_min` int(11) DEFAULT NULL,
  `stabilite_sup` int(11) DEFAULT NULL,
  `stabilite_garanti` int(11) DEFAULT NULL,
  `chaleur_hydratation_min` int(11) DEFAULT NULL,
  `chaleur_hydratation_sup` int(11) DEFAULT NULL,
  `chaleur_hydratation_garanty` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `proprietes_physiques`
--

INSERT INTO `proprietes_physiques` (`id`, `categorie`, `classe_resistance_id`, `famille_ciment_id`, `temps_debut_prise_min`, `temps_debut_prise_sup`, `temps_debut_prise_garanti`, `stabilite_min`, `stabilite_sup`, `stabilite_garanti`, `chaleur_hydratation_min`, `chaleur_hydratation_sup`, `chaleur_hydratation_garanty`) VALUES
(1, 'temps_debut_prise', 1, NULL, 75, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'temps_debut_prise', 2, NULL, 75, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'temps_debut_prise', 7, NULL, 75, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'temps_debut_prise', 3, NULL, 60, NULL, 50, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'temps_debut_prise', 4, NULL, 60, NULL, 50, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'temps_debut_prise', 8, NULL, 60, NULL, 50, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'temps_debut_prise', 5, NULL, 45, NULL, 40, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'temps_debut_prise', 6, NULL, 45, NULL, 40, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'temps_debut_prise', 9, NULL, 45, NULL, 40, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'stabilite', NULL, NULL, NULL, NULL, NULL, NULL, 10, 10, NULL, NULL, NULL),
(11, 'chaleur_hydratation', NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 270, 300);

-- --------------------------------------------------------

--
-- Structure de la table `types_ciment`
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
<<<<<<< Updated upstream
(2, 1, 'CEM I-SR 0', 'Ciment Portland SR ', 1),
(3, 1, 'CEM I-SR 3', 'Ciment Portland SR ', 1),
(4, 1, 'CEM I-SR 5', 'Ciment Portland SR ', 1),
(5, 2, 'CEM II/A-S', 'Portland au laitier ', 0),
(6, 2, 'CEM II/B-S', 'Portland au laitier ', 0),
(7, 2, 'CEM II/A-D', 'Ciment portland ? la fum?e de silice ', 0),
(8, 2, 'CEM II/A-P', 'Ciment portland ? la pouzzolane ', 0),
(9, 2, 'CEM II/B-P', 'Ciment portland ? la pouzzolane ', 0),
(10, 2, 'CEM II/A-Q', 'Ciment portland ? la pouzzolane ', 0),
(11, 2, 'CEM II/B-Q', 'Ciment portland ? la pouzzolane ', 0),
(12, 2, 'CEM II/A-V', 'Ciment portland aux cendres volantes ', 0),
(13, 2, 'CEM II/B-V', 'Ciment portland aux cendres volantes ', 0),
(14, 2, 'CEM II/A-W', 'Ciment portland aux cendres volantes ', 0),
(15, 2, 'CEM II/B-W', 'Ciment portland aux cendres volantes ', 0),
(16, 2, 'CEM II/A-T', 'Ciment portland aux schistes calcin?s ', 0),
(17, 2, 'CEM II/B-T', 'Ciment portland aux schistes calcin?s ', 0),
(18, 2, 'CEM II/A-L', 'Ciment portland au calcaire ', 0),
(19, 2, 'CEM II/B-L', 'Ciment portland au calcaire ', 0),
(20, 2, 'CEM II/A-LL', 'Ciment portland au calcaire ', 0),
(21, 2, 'CEM II/B-LL', 'Ciment portland au calcaire ', 0),
(22, 2, 'CEM II/A-M', 'Ciment portland compos? ', 0),
(23, 2, 'CEM II/B-M', 'Ciment portland compos? ', 0),
(24, 3, 'CEM III/A', 'Haut fourneau ', 0),
(25, 3, 'CEM III/B', 'Haut fourneau ', 0),
(26, 3, 'CEM III/C', 'Haut fourneau ', 0),
(27, 3, 'CEM III/B-SR', 'Haut fourneau SR', 1),
(28, 3, 'CEM III/C-SR', 'Haut fourneau SR', 1),
(29, 4, 'CEM IV/A', 'Pouzzolanique ', 0),
(30, 4, 'CEM IV/B', 'Pouzzolanique ', 0),
(31, 4, 'CEM IV/A-SR', 'Pouzzolanique SR ', 1),
(32, 4, 'CEM IV/B-SR', 'Pouzzolanique SR ', 1),
(33, 5, 'CEM V/A', 'Compos? ', 0),
(34, 5, 'CEM V/B', 'Compos? ', 0);
=======
(2, 1, 'CEM I-SR 0', 'Ciment Portland SR (C3A = 0%)', 1),
(3, 1, 'CEM I-SR 3', 'Ciment Portland SR (C3A ≤ 3%)', 1),
(4, 1, 'CEM I-SR 5', 'Ciment Portland SR (C3A ≤ 5%)', 1),
(5, 2, 'CEM II/A-S', 'Portland au laitier 6–20% S', 0),
(6, 2, 'CEM II/B-S', 'Portland au laitier 21–35% S', 0),
(7, 2, 'CEM II/A-D', 'Ciment portland à la fumée de silice 6–10% D', 0),
(8, 2, 'CEM II/A-P', 'Ciment portland à la pouzzolane 6–20% P', 0),
(9, 2, 'CEM II/B-P', 'Ciment portland à la pouzzolane 21–35% P', 0),
(10, 2, 'CEM II/A-Q', 'Ciment portland à la pouzzolane 6–20% Q', 0),
(11, 2, 'CEM II/B-Q', 'Ciment portland à la pouzzolane 21–35% Q', 0),
(12, 2, 'CEM II/A-V', 'Ciment portland aux cendres volantes 6–20% V', 0),
(13, 2, 'CEM II/B-V', 'Ciment portland aux cendres volantes 21–35% V', 0),
(14, 2, 'CEM II/A-W', 'Ciment portland aux cendres volantes 6–20% W', 0),
(15, 2, 'CEM II/B-W', 'Ciment portland aux cendres volantes 21–35% W', 0),
(16, 2, 'CEM II/A-T', 'Ciment portland aux schistes calcinés 6–20% T', 0),
(17, 2, 'CEM II/B-T', 'Ciment portland aux schistes calcinés 21–35% T', 0),
(18, 2, 'CEM II/A-L', 'Ciment portland au calcaire 6–20% L', 0),
(19, 2, 'CEM II/B-L', 'Ciment portland au calcaire 21–35% L', 0),
(20, 2, 'CEM II/A-LL', 'Ciment portland au calcaire 6–20% LL', 0),
(21, 2, 'CEM II/B-LL', 'Ciment portland au calcaire 21–35% LL', 0),
(22, 2, 'CEM II/A-M', 'Ciment portland composé 12–20% S D P Q V W T L LL', 0),
(23, 2, 'CEM II/B-M', 'Ciment portland composé 21–35% S D P Q V W T L LL', 0),
(24, 3, 'CEM III/A', 'Haut fourneau (36–65% S)', 0),
(25, 3, 'CEM III/B', 'Haut fourneau (66–80% S)', 0),
(26, 3, 'CEM III/C', 'Haut fourneau (81–95% S)', 0),
(27, 3, 'CEM III/B-SR', 'Haut fourneau SR', 1),
(28, 3, 'CEM III/C-SR', 'Haut fourneau SR', 1),
(29, 4, 'CEM IV/A', 'Pouzzolanique (11–35% D P Q V W)', 0),
(30, 4, 'CEM IV/B', 'Pouzzolanique (36–55% D P Q V W)', 0),
(31, 4, 'CEM IV/A-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1),
(32, 4, 'CEM IV/B-SR', 'Pouzzolanique SR (C3A ≤ 9%)', 1),
(33, 5, 'CEM V/A', 'Composé (18–30% laitier + 18–30% P Q V )', 0),
(34, 5, 'CEM V/B', 'Composé (31–49% laitier + 31–49% P Q V )', 0);
>>>>>>> Stashed changes

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

--
<<<<<<< Updated upstream
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe`, `role`) VALUES
(1, 'infomely@gmail.com', '$2b$10$ENHY9KndaY4T.EWjsX7ageTJcUBjyfbXG4xQGnK.7Ics/gjAe2dO6', 'admin'),
(2, 'info@gmail.com', '$2b$10$roOad22HTp7cxho/oX9p5uhJqFxtA1t5GeO2ulqSoi2duVfWKc9e.', 'user');

-- --------------------------------------------------------

--
=======
>>>>>>> Stashed changes
-- Structure de la table `valeurs_statistiques`
--

CREATE TABLE `valeurs_statistiques` (
  `id` int(11) NOT NULL,
  `categorie` varchar(100) NOT NULL,
  `sous_type` varchar(100) DEFAULT NULL,
  `percentile_pk` decimal(5,2) NOT NULL,
  `prob_acceptation_cr` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `valeurs_statistiques`
--

INSERT INTO `valeurs_statistiques` (`id`, `categorie`, `sous_type`, `percentile_pk`, `prob_acceptation_cr`) VALUES
(1, 'mecanique', 'limite_inferieure', 5.00, 5.00),
(2, 'mecanique', 'limite_superieure', 10.00, 5.00),
(3, 'physique', NULL, 10.00, 5.00),
(4, 'chimique', NULL, 10.00, 5.00);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_proprietes_chimiques`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_proprietes_chimiques` (
`famille_code` varchar(10)
,`famille_nom` varchar(255)
,`type_code` varchar(20)
,`type_description` text
,`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`categorie` enum('pert_au_feu','residu_insoluble','teneur_chlour','pouzzolanicite','SO3','SO3_supp','pouzzolanicite_supp','C3A')
,`limit_inf` decimal(5,2)
,`limit_sup` decimal(5,2)
,`limit_garanti` decimal(5,2)
,`description_garanti` text
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_proprietes_mecaniques_complet`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_proprietes_mecaniques_complet` (
`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`resistance_2j_min` decimal(5,1)
,`resistance_2j_sup` decimal(5,1)
,`garantie_2j` decimal(5,1)
,`resistance_7j_min` decimal(5,1)
,`resistance_7j_sup` decimal(5,1)
,`garantie_7j` decimal(5,1)
,`resistance_28j_min` decimal(5,1)
,`resistance_28j_sup` decimal(5,1)
,`garantie_28j` decimal(5,1)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_proprietes_physiques`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_proprietes_physiques` (
`famille_code` varchar(10)
,`famille_nom` varchar(255)
,`type_code` varchar(20)
,`type_description` text
,`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`temps_debut_prise_min` int(11)
,`temps_debut_prise_sup` int(11)
,`temps_debut_prise_garanti` int(11)
,`stabilite_min` int(11)
,`stabilite_sup` int(11)
,`stabilite_garanti` int(11)
,`chaleur_hydratation_min` int(11)
,`chaleur_hydratation_sup` int(11)
,`chaleur_hydratation_garanty` int(11)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_temps_debut_prise`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_temps_debut_prise` (
`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`temps_debut_prise_min` int(11)
,`temps_debut_prise_sup` int(11)
,`temps_debut_prise_garanti` int(11)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_tous_ciments_proprietes`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_tous_ciments_proprietes` (
`famille_code` varchar(10)
,`famille_nom` varchar(255)
,`type_code` varchar(20)
,`type_description` text
,`sulfate_resistant` tinyint(1)
,`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`resistance_2j_min` decimal(5,1)
,`resistance_2j_sup` decimal(5,1)
,`garantie_2j` decimal(5,1)
,`resistance_7j_min` decimal(5,1)
,`resistance_7j_sup` decimal(5,1)
,`garantie_7j` decimal(5,1)
,`resistance_28j_min` decimal(5,1)
,`resistance_28j_sup` decimal(5,1)
,`garantie_28j` decimal(5,1)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_tous_ciments_proprietes_complet`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_tous_ciments_proprietes_complet` (
`famille_code` varchar(10)
,`famille_nom` varchar(255)
,`type_code` varchar(20)
,`type_description` text
,`sulfate_resistant` tinyint(1)
,`classe` varchar(10)
,`type_court_terme` enum('N','R','L')
,`resistance_2j_min` decimal(5,1)
,`resistance_2j_sup` decimal(5,1)
,`garantie_2j` decimal(5,1)
,`resistance_7j_min` decimal(5,1)
,`resistance_7j_sup` decimal(5,1)
,`garantie_7j` decimal(5,1)
,`resistance_28j_min` decimal(5,1)
,`resistance_28j_sup` decimal(5,1)
,`garantie_28j` decimal(5,1)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_proprietes_chimiques`
--
DROP TABLE IF EXISTS `vue_proprietes_chimiques`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_proprietes_chimiques`  AS SELECT `fc`.`code` AS `famille_code`, `fc`.`nom` AS `famille_nom`, `tc`.`code` AS `type_code`, `tc`.`description` AS `type_description`, `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pc`.`categorie` AS `categorie`, `pc`.`limit_inf` AS `limit_inf`, `pc`.`limit_sup` AS `limit_sup`, `pc`.`limit_garanti` AS `limit_garanti`, `pc`.`description_garanti` AS `description_garanti` FROM (((`proprietes_chimiques` `pc` left join `familles_ciment` `fc` on(`pc`.`famille_ciment_id` = `fc`.`id`)) left join `types_ciment` `tc` on(`tc`.`famille_id` = `fc`.`id`)) left join `classes_resistance` `cr` on(`pc`.`classe_resistance_id` = `cr`.`id`)) ORDER BY `fc`.`code` ASC, `tc`.`code` ASC, `pc`.`categorie` ASC, `cr`.`classe` ASC, `cr`.`type_court_terme` ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_proprietes_mecaniques_complet`
--
DROP TABLE IF EXISTS `vue_proprietes_mecaniques_complet`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_proprietes_mecaniques_complet`  AS SELECT `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pm`.`resistance_2j_min` AS `resistance_2j_min`, `pm`.`resistance_2j_sup` AS `resistance_2j_sup`, `pm`.`garantie_2j` AS `garantie_2j`, `pm`.`resistance_7j_min` AS `resistance_7j_min`, `pm`.`resistance_7j_sup` AS `resistance_7j_sup`, `pm`.`garantie_7j` AS `garantie_7j`, `pm`.`resistance_28j_min` AS `resistance_28j_min`, `pm`.`resistance_28j_sup` AS `resistance_28j_sup`, `pm`.`garantie_28j` AS `garantie_28j` FROM (`proprietes_mecaniques` `pm` join `classes_resistance` `cr` on(`pm`.`classe_resistance_id` = `cr`.`id`)) ORDER BY cast(substring_index(`cr`.`classe`,'.',1) as unsigned) ASC, CASE `cr`.`type_court_terme` WHEN 'L' THEN 1 WHEN 'N' THEN 2 WHEN 'R' THEN 3 END ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_proprietes_physiques`
--
DROP TABLE IF EXISTS `vue_proprietes_physiques`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_proprietes_physiques`  AS SELECT `fc`.`code` AS `famille_code`, `fc`.`nom` AS `famille_nom`, `tc`.`code` AS `type_code`, `tc`.`description` AS `type_description`, `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pp`.`temps_debut_prise_min` AS `temps_debut_prise_min`, `pp`.`temps_debut_prise_sup` AS `temps_debut_prise_sup`, `pp`.`temps_debut_prise_garanti` AS `temps_debut_prise_garanti`, `pp`.`stabilite_min` AS `stabilite_min`, `pp`.`stabilite_sup` AS `stabilite_sup`, `pp`.`stabilite_garanti` AS `stabilite_garanti`, `pp`.`chaleur_hydratation_min` AS `chaleur_hydratation_min`, `pp`.`chaleur_hydratation_sup` AS `chaleur_hydratation_sup`, `pp`.`chaleur_hydratation_garanty` AS `chaleur_hydratation_garanty` FROM ((((`types_ciment_classes` `tcc` join `types_ciment` `tc` on(`tcc`.`type_ciment_id` = `tc`.`id`)) join `familles_ciment` `fc` on(`tc`.`famille_id` = `fc`.`id`)) join `classes_resistance` `cr` on(`tcc`.`classe_resistance_id` = `cr`.`id`)) left join `proprietes_physiques` `pp` on(`pp`.`classe_resistance_id` = `cr`.`id` and `pp`.`categorie` = 'temps_debut_prise' or `pp`.`classe_resistance_id` is null and `pp`.`famille_ciment_id` is null and `pp`.`categorie` = 'stabilite' or `pp`.`famille_ciment_id` = `fc`.`id` and `pp`.`categorie` = 'chaleur_hydratation')) ORDER BY `fc`.`code` ASC, `tc`.`code` ASC, cast(substring_index(`cr`.`classe`,'.',1) as unsigned) ASC, CASE `cr`.`type_court_terme` WHEN 'L' THEN 1 WHEN 'N' THEN 2 WHEN 'R' THEN 3 END ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_temps_debut_prise`
--
DROP TABLE IF EXISTS `vue_temps_debut_prise`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_temps_debut_prise`  AS SELECT `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pp`.`temps_debut_prise_min` AS `temps_debut_prise_min`, `pp`.`temps_debut_prise_sup` AS `temps_debut_prise_sup`, `pp`.`temps_debut_prise_garanti` AS `temps_debut_prise_garanti` FROM (`proprietes_physiques` `pp` join `classes_resistance` `cr` on(`pp`.`classe_resistance_id` = `cr`.`id`)) WHERE `pp`.`categorie` = 'temps_debut_prise' ORDER BY cast(substring_index(`cr`.`classe`,'.',1) as unsigned) ASC, CASE `cr`.`type_court_terme` WHEN 'L' THEN 1 WHEN 'N' THEN 2 WHEN 'R' THEN 3 END ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_tous_ciments_proprietes`
--
DROP TABLE IF EXISTS `vue_tous_ciments_proprietes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_tous_ciments_proprietes`  AS SELECT `fc`.`code` AS `famille_code`, `fc`.`nom` AS `famille_nom`, `tc`.`code` AS `type_code`, `tc`.`description` AS `type_description`, `tc`.`sr` AS `sulfate_resistant`, `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pm`.`resistance_2j_min` AS `resistance_2j_min`, `pm`.`resistance_2j_sup` AS `resistance_2j_sup`, `pm`.`garantie_2j` AS `garantie_2j`, `pm`.`resistance_7j_min` AS `resistance_7j_min`, `pm`.`resistance_7j_sup` AS `resistance_7j_sup`, `pm`.`garantie_7j` AS `garantie_7j`, `pm`.`resistance_28j_min` AS `resistance_28j_min`, `pm`.`resistance_28j_sup` AS `resistance_28j_sup`, `pm`.`garantie_28j` AS `garantie_28j` FROM ((((`types_ciment_classes` `tcc` join `types_ciment` `tc` on(`tcc`.`type_ciment_id` = `tc`.`id`)) join `familles_ciment` `fc` on(`tc`.`famille_id` = `fc`.`id`)) join `classes_resistance` `cr` on(`tcc`.`classe_resistance_id` = `cr`.`id`)) join `proprietes_mecaniques` `pm` on(`cr`.`id` = `pm`.`classe_resistance_id`)) ORDER BY `fc`.`code` ASC, `tc`.`code` ASC, cast(substring_index(`cr`.`classe`,'.',1) as unsigned) ASC, CASE `cr`.`type_court_terme` WHEN 'L' THEN 1 WHEN 'N' THEN 2 WHEN 'R' THEN 3 END ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_tous_ciments_proprietes_complet`
--
DROP TABLE IF EXISTS `vue_tous_ciments_proprietes_complet`;

CREATE ALGORITHM=UNDEFINED DEFINER=`cetim_user`@`localhost` SQL SECURITY DEFINER VIEW `vue_tous_ciments_proprietes_complet`  AS SELECT `fc`.`code` AS `famille_code`, `fc`.`nom` AS `famille_nom`, `tc`.`code` AS `type_code`, `tc`.`description` AS `type_description`, `tc`.`sr` AS `sulfate_resistant`, `cr`.`classe` AS `classe`, `cr`.`type_court_terme` AS `type_court_terme`, `pm`.`resistance_2j_min` AS `resistance_2j_min`, `pm`.`resistance_2j_sup` AS `resistance_2j_sup`, `pm`.`garantie_2j` AS `garantie_2j`, `pm`.`resistance_7j_min` AS `resistance_7j_min`, `pm`.`resistance_7j_sup` AS `resistance_7j_sup`, `pm`.`garantie_7j` AS `garantie_7j`, `pm`.`resistance_28j_min` AS `resistance_28j_min`, `pm`.`resistance_28j_sup` AS `resistance_28j_sup`, `pm`.`garantie_28j` AS `garantie_28j` FROM (((`types_ciment` `tc` join `familles_ciment` `fc` on(`tc`.`famille_id` = `fc`.`id`)) join `classes_resistance` `cr`) left join `proprietes_mecaniques` `pm` on(`cr`.`id` = `pm`.`classe_resistance_id`)) ORDER BY `fc`.`code` ASC, `tc`.`code` ASC, cast(substring_index(`cr`.`classe`,'.',1) as unsigned) ASC, CASE `cr`.`type_court_terme` WHEN 'L' THEN 1 WHEN 'N' THEN 2 WHEN 'R' THEN 3 END ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
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
-- Index pour la table `coefficients_k`
--
ALTER TABLE `coefficients_k`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `conditions_statistiques`
--
ALTER TABLE `conditions_statistiques`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `controles_conformite`
--
ALTER TABLE `controles_conformite`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD PRIMARY KEY (`id`),
<<<<<<< Updated upstream
  ADD KEY `fk_client_type_ciment` (`client_type_ciment_id`);
=======
  ADD UNIQUE KEY `unique_sample` (`client_id`,`num_ech`,`date_test`),
  ADD KEY `idx_client` (`client_id`),
  ADD KEY `idx_produit` (`produit_id`),
  ADD KEY `idx_date` (`date_test`);
>>>>>>> Stashed changes

--
-- Index pour la table `familles_ciment`
--
ALTER TABLE `familles_ciment`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `proprietes_chimiques`
--
ALTER TABLE `proprietes_chimiques`
  ADD PRIMARY KEY (`id`),
  ADD KEY `famille_ciment_id` (`famille_ciment_id`),
  ADD KEY `classe_resistance_id` (`classe_resistance_id`);

--
-- Index pour la table `proprietes_mecaniques`
--
ALTER TABLE `proprietes_mecaniques`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classe_resistance_id` (`classe_resistance_id`);

--
-- Index pour la table `proprietes_physiques`
--
ALTER TABLE `proprietes_physiques`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classe_resistance_id` (`classe_resistance_id`),
  ADD KEY `famille_ciment_id` (`famille_ciment_id`);

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
-- Index pour la table `valeurs_statistiques`
--
ALTER TABLE `valeurs_statistiques`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
<<<<<<< Updated upstream
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;
=======
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;
>>>>>>> Stashed changes

--
-- AUTO_INCREMENT pour la table `coefficients_k`
--
ALTER TABLE `coefficients_k`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `conditions_statistiques`
--
ALTER TABLE `conditions_statistiques`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `controles_conformite`
--
ALTER TABLE `controles_conformite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `echantillons`
--
ALTER TABLE `echantillons`
<<<<<<< Updated upstream
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;
=======
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;
>>>>>>> Stashed changes

--
-- AUTO_INCREMENT pour la table `familles_ciment`
--
ALTER TABLE `familles_ciment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `proprietes_chimiques`
--
ALTER TABLE `proprietes_chimiques`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT pour la table `proprietes_mecaniques`
--
ALTER TABLE `proprietes_mecaniques`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `proprietes_physiques`
--
ALTER TABLE `proprietes_physiques`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
-- AUTO_INCREMENT pour la table `valeurs_statistiques`
--
ALTER TABLE `valeurs_statistiques`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

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

--
<<<<<<< Updated upstream
-- Contraintes pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD CONSTRAINT `fk_client_type_ciment` FOREIGN KEY (`client_type_ciment_id`) REFERENCES `client_types_ciment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
=======
>>>>>>> Stashed changes
-- Contraintes pour la table `proprietes_chimiques`
--
ALTER TABLE `proprietes_chimiques`
  ADD CONSTRAINT `proprietes_chimiques_ibfk_1` FOREIGN KEY (`famille_ciment_id`) REFERENCES `familles_ciment` (`id`),
  ADD CONSTRAINT `proprietes_chimiques_ibfk_2` FOREIGN KEY (`classe_resistance_id`) REFERENCES `classes_resistance` (`id`);

--
-- Contraintes pour la table `proprietes_mecaniques`
--
ALTER TABLE `proprietes_mecaniques`
  ADD CONSTRAINT `proprietes_mecaniques_ibfk_1` FOREIGN KEY (`classe_resistance_id`) REFERENCES `classes_resistance` (`id`);

--
-- Contraintes pour la table `proprietes_physiques`
--
ALTER TABLE `proprietes_physiques`
  ADD CONSTRAINT `proprietes_physiques_ibfk_1` FOREIGN KEY (`classe_resistance_id`) REFERENCES `classes_resistance` (`id`),
  ADD CONSTRAINT `proprietes_physiques_ibfk_2` FOREIGN KEY (`famille_ciment_id`) REFERENCES `familles_ciment` (`id`);

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;