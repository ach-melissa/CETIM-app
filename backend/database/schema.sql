-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 04 août 2025 à 19:56
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

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

-- --------------------------------------------------------

--
-- Structure de la table `echantillons`
--

CREATE TABLE `echantillons` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `numero_echantillon` varchar(50) DEFAULT NULL,
  `date_reception` date DEFAULT NULL,
  `type_ciment` varchar(50) DEFAULT NULL,
  `classe_resistance` varchar(10) DEFAULT NULL,
  `resistance_court_terme` char(1) DEFAULT NULL,
  `conforme` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mesures`
--

CREATE TABLE `mesures` (
  `id` int(11) NOT NULL,
  `echantillon_id` int(11) DEFAULT NULL,
  `rc_2j` float DEFAULT NULL,
  `rc_7j` float DEFAULT NULL,
  `rc_28j` float DEFAULT NULL,
  `debut_prise` int(11) DEFAULT NULL,
  `stabilite_mm` float DEFAULT NULL,
  `chaleur_hydratation` float DEFAULT NULL,
  `perte_au_feu` float DEFAULT NULL,
  `residu_insoluble` float DEFAULT NULL,
  `teneur_so3` float DEFAULT NULL,
  `teneur_chlorure` float DEFAULT NULL,
  `c3a` float DEFAULT NULL,
  `pourcentage_ajouts` float DEFAULT NULL,
  `type_ajout` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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

-- --------------------------------------------------------

--
-- Structure de la table `resultats_essais`
--

CREATE TABLE `resultats_essais` (
  `id` int(11) NOT NULL,
  `echantillon_id` int(11) NOT NULL,
  `date_prelevement` date DEFAULT NULL,
  `heure_prelevement` time DEFAULT NULL,
  `resistance_2j` float DEFAULT NULL,
  `resistance_7j` float DEFAULT NULL,
  `resistance_28j` float DEFAULT NULL,
  `debut_prise` int(11) DEFAULT NULL,
  `stabilite_expansion` float DEFAULT NULL,
  `chaleur_hydratation` float DEFAULT NULL,
  `perte_feu` float DEFAULT NULL,
  `residu_insoluble` float DEFAULT NULL,
  `teneur_sulfate_so3` float DEFAULT NULL,
  `teneur_chlore_cl` float DEFAULT NULL,
  `c3a_clinker` float DEFAULT NULL,
  `ajouts` float DEFAULT NULL,
  `type_ajout` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe`, `role`) VALUES
(1, 'admin@cetim.dz', '$2b$10$WSo10LJR.p4F3Vx5E98WSeq5VY7XXATT3gmgqYC12rtMrD8HLUk9y', 'admin'),
(2, 'user@cetim.dz', '$2b$10$txGEp4e7f7gO6UXeeZPe5OXPaDVrpVCr.V2b7i0aLya8yw8NZi19W', 'user');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parametres_id` (`parametres_id`);

--
-- Index pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Index pour la table `mesures`
--
ALTER TABLE `mesures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `echantillon_id` (`echantillon_id`);

--
-- Index pour la table `parametres_ciment`
--
ALTER TABLE `parametres_ciment`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `resultats_essais`
--
ALTER TABLE `resultats_essais`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_echantillon` (`echantillon_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `echantillons`
--
ALTER TABLE `echantillons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `mesures`
--
ALTER TABLE `mesures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `parametres_ciment`
--
ALTER TABLE `parametres_ciment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT pour la table `resultats_essais`
--
ALTER TABLE `resultats_essais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `echantillons`
--
ALTER TABLE `echantillons`
  ADD CONSTRAINT `echantillons_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Contraintes pour la table `mesures`
--
ALTER TABLE `mesures`
  ADD CONSTRAINT `mesures_ibfk_1` FOREIGN KEY (`echantillon_id`) REFERENCES `echantillons` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
