
-- DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS ciment_conformite;
USE ciment_conformite;

-- LOGIN PAGE 
-- TABLE utilisateurs
-- =========================

 CREATE TABLE utilisateurs (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(191) DEFAULT NULL,
  email varchar(191) NOT NULL,
  mot_de_passe varchar(255) NOT NULL,
  role enum('admin','user') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY email (`email`),
  UNIQUE KEY username (`username`)
); 

INSERT INTO utilisateurs (id, username, email, mot_de_passe, role)
VALUES
(1, 'hamza', 'hamza@gmail.com', '$2b$10$F3FA6fqsU.frW57BEeLt1uEEcUBGWTlOS3PFfUMB3IEeV8kTjt.xO', 'admin'),
(2, 'zakia', 'zakia@gmail.com', '$2b$10$pWSWUNgJcxahPXT9L/QN/uW/Ztps6g8uJ0tIUZfu66ZKLVMHSoo6W', 'user');

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
(439, 3),
(44, 20, 4),
(45, 20, 5),
(48, 22, 2),
(49, 22, 3),
(50, 22, 4),
(51, 23, 5),
(59, 21),
(60, 21, 6),
(618),
(628, 4),
(638, 33),
(648, 34),
(728, 32),
(738, 20),
(7486),
(75, 20, 24);
(648, 34);


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


CREATE TABLE `types_ciment` (
  `id` int(11) NOT NULL,
  `famille_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL
);

--
-- Déchargement des données de la table `types_ciment`
--

INSERT INTO `types_ciment` (`id`, `famille_id`, `code`, `description`) VALUES
(1, 'CEM I', 'Ciment Portland'),
(2, 'CEM I-SR 0', 'Ciment Portland SR '),
(3, 'CEM I-SR 3', 'Ciment Portland SR '),
(4, 'CEM I-SR 5', 'Ciment Portland SR '),
(5, 2, 'CEM II/A-S', 'Portland au laitier '),
(6, 2, 'CEM II/B-S', 'Portland au laitier '),
(7, 2, 'CEM II/A-D', 'Ciment portland a la fumee de silice '),
(8, 2, 'CEM II/A-P', 'Ciment portland a la pouzzolane naturelle'),
(9, 2, 'CEM II/B-P', 'Ciment portland a la pouzzolane naturelle'),
(10, 2, 'CEM II/A-Q', 'Ciment portland a la pouzzolane naturelle calcinee'),
(11, 2, 'CEM II/B-Q', 'Ciment portland a la pouzzolane naturelle calcinee'),
(12, 2, 'CEM II/A-V', 'Ciment portland aux cendres volantes '),
(13, 2, 'CEM II/B-V', 'Ciment portland aux cendres volantes '),
(14, 2, 'CEM II/A-W', 'Ciment portland aux cendres volantes '),
(15, 2, 'CEM II/B-W', 'Ciment portland aux cendres volantes '),
(16, 2, 'CEM II/A-T', 'Ciment portland aux schistes calcine '),
(17, 2, 'CEM II/B-T', 'Ciment portland aux schistes calcine '),
(18, 2, 'CEM II/A-L', 'Ciment portland au calcaire '),
(19, 2, 'CEM II/B-L', 'Ciment portland au calcaire '),
(20, 2, 'CEM II/A-LL', 'Ciment portland au calcaire '),
(21, 2, 'CEM II/B-LL', 'Ciment portland au calcaire '),
(22, 2, 'CEM II/A-M', 'Ciment portland compose '),
(23, 2, 'CEM II/B-M', 'Ciment portland compose '),
(24, 3, 'CEM III/A', 'Ciment Haut fourneau '),
(25, 3, 'CEM III/B', 'Ciment Haut fourneau '),
(26, 3, 'CEM III/C', 'Ciment Haut fourneau '),
(27, 3, 'CEM III/B-SR', 'Ciment Haut fourneau SR'),
(28, 3, 'CEM III/C-SR', 'Ciment Haut fourneau SR'),
(29, 4, 'CEM IV/A', 'Ciment Pouzzolanique '),
(30, 4, 'CEM IV/B', 'Ciment Pouzzolanique '),
(31, 4, 'CEM IV/A-SR', 'Ciment Pouzzolanique SR '),
(32, 4, 'CEM IV/B-SR', 'Ciment Pouzzolanique SR '),
(33, 5, 'CEM V/A', 'Ciment Compose '),
(34, 5, 'CEM V/B', 'Ciment Compose ');


-- --------------------------------------------------------
CREATE TABLE permissions ( 
 id int(11) NOT NULL AUTO_INCREMENT, 
 user_id int(11) NOT NULL, 
 parnorm tinyint(1) DEFAULT 0, 
 parametre_ciment tinyint(1) DEFAULT 0, 
 parametre_clients tinyint(1) DEFAULT 0, 
 traitement_donnees tinyint(1) DEFAULT 0, 
 historique tinyint(1) DEFAULT 0, 
 parametre_ciment_read tinyint(1) DEFAULT 0, 
 parametre_ciment_create tinyint(1) DEFAULT 0, 
 parametre_ciment_update tinyint(1) DEFAULT 0, 
 parametre_ciment_delete tinyint(1) DEFAULT 0, 
 parametre_entreprise_read tinyint(1) DEFAULT 0, 
 parametre_entreprise_create tinyint(1) DEFAULT 0, 
 parametre_entreprise_update tinyint(1) DEFAULT 0, 
 parametre_entreprise_delete tinyint(1) DEFAULT 0, 
 parnorm_read tinyint(1) DEFAULT 0, 
 parnorm_create tinyint(1) DEFAULT 0, 
 parnorm_update tinyint(1) DEFAULT 0, 
 parnorm_delete tinyint(1) DEFAULT 0, 
 PRIMARY KEY (`id`), 
 UNIQUE KEY uq_permissions_user (`user_id`), 
 CONSTRAINT permissions_ibfk_1 FOREIGN KEY (`user_id`) REFERENCES utilisateurs (`id`) ON DELETE CASCADE);
 
 CREATE TABLE pdf_exports (
  id int(11) NOT NULL AUTO_INCREMENT,
  client_types_ciment_id int(11) NOT NULL,
  phase enum('situation_courante','nouveau_type_produit') NOT NULL,
  folder_path varchar(255) NOT NULL,
  description varchar(255) DEFAULT NULL,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  export_date datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY fk_client_types_ciment (`client_types_ciment_id`),
  CONSTRAINT fk_client_types_ciment FOREIGN KEY (`client_types_ciment_id`) REFERENCES client_types_ciment (`id`) ON DELETE CASCADE
) ;


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
