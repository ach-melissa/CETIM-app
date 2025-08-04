-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : dim. 03 août 2025 à 14:39
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ciment_conformite`
--

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sigle` varchar(50) DEFAULT NULL,
  `nom_raison_sociale` varchar(255) DEFAULT NULL,
  `adresse` text,
  `parametres_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parametres_id` (`parametres_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- --------------------------------------------------------

--
-- Structure de la table `echantillons`
--

DROP TABLE IF EXISTS `echantillons`;
CREATE TABLE IF NOT EXISTS `echantillons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_lot` varchar(50) NOT NULL,
  `date_analyse` date NOT NULL,
  `type_ciment` varchar(50) DEFAULT NULL,
  `nom_laboratoire` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `echantillons`
--

INSERT INTO `echantillons` (`id`, `numero_lot`, `date_analyse`, `type_ciment`, `nom_laboratoire`) VALUES
(1, '2', '1111-11-11', 'CEM I', 'AA'),
(2, '2', '1111-11-11', 'CEM I', 'AA');

-- --------------------------------------------------------

--
-- Structure de la table `parametres_ciment`
--

DROP TABLE IF EXISTS `parametres_ciment`;
CREATE TABLE IF NOT EXISTS `parametres_ciment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_ciment` varchar(100) DEFAULT NULL,
  `produit_ciment` varchar(100) DEFAULT NULL,
  `methode` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `parametres_ciment`
--

INSERT INTO `parametres_ciment` (`id`, `type_ciment`, `produit_ciment`, `methode`) VALUES
(1, 'CEM I 42.5', 'Ciment Portland', 'Méthode A'),
(2, 'CEM II/A-L 42.5', 'Ciment au calcaire', 'Méthode B'),
(3, 'CEM II/B-S 42.5', 'Ciment au laitier', 'Méthode C'),
(4, 'CEM I 42.5', 'Ciment Portland pur', 'Méthode A'),
(5, 'CEM II/A-L 42.5', 'Ciment Portland au calcaire', 'Méthode B'),
(6, 'CEM II/B-S 42.5', 'Ciment Portland au laitier', 'Méthode C'),
(7, 'CEM III/A 42.5', 'Ciment au laitier (36-65%)', 'Méthode D'),
(8, 'CEM IV/B 32.5', 'Ciment pouzzolanique', 'Méthode E');

-- --------------------------------------------------------

--
-- Structure de la table `resultats_essais`
--

DROP TABLE IF EXISTS `resultats_essais`;
CREATE TABLE IF NOT EXISTS `resultats_essais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `echantillon_id` int NOT NULL,
  `date_prelevement` date DEFAULT NULL,
  `heure_prelevement` time DEFAULT NULL,
  `resistance_2j` float DEFAULT NULL,
  `resistance_7j` float DEFAULT NULL,
  `resistance_28j` float DEFAULT NULL,
  `debut_prise` int DEFAULT NULL,
  `stabilite_expansion` float DEFAULT NULL,
  `chaleur_hydratation` float DEFAULT NULL,
  `perte_feu` float DEFAULT NULL,
  `residu_insoluble` float DEFAULT NULL,
  `teneur_sulfate_so3` float DEFAULT NULL,
  `teneur_chlore_cl` float DEFAULT NULL,
  `c3a_clinker` float DEFAULT NULL,
  `ajouts` float DEFAULT NULL,
  `type_ajout` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_echantillon` (`echantillon_id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `resultats_essais`
--

INSERT INTO `resultats_essais` (`id`, `echantillon_id`, `date_prelevement`, `heure_prelevement`, `resistance_2j`, `resistance_7j`, `resistance_28j`, `debut_prise`, `stabilite_expansion`, `chaleur_hydratation`, `perte_feu`, `residu_insoluble`, `teneur_sulfate_so3`, `teneur_chlore_cl`, `c3a_clinker`, `ajouts`, `type_ajout`) VALUES
(25, 1, '9999-09-09', '09:59:00', 9, 10, 15, 10, 20, 20, 10, 10, 10, 5, NULL, 5, 'cem1'),
(26, 1, '9999-09-09', '09:59:00', 9, 10, 15, 10, 20, 20, 10, 10, 10, 5, NULL, 5, 'cem1'),
(27, 2, '8888-08-08', '08:59:00', 8, 8, 998, 8, 88, 8, 8, 8, 8, 8, NULL, 8, 'cem4');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe`, `role`) VALUES
(1, 'admin@cetim.dz', '$2b$10$WSo10LJR.p4F3Vx5E98WSeq5VY7XXATT3gmgqYC12rtMrD8HLUk9y', 'admin'),
(2, 'user@cetim.dz', '$2b$10$txGEp4e7f7gO6UXeeZPe5OXPaDVrpVCr.V2b7i0aLya8yw8NZi19W', 'user');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
