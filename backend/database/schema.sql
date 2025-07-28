CREATE DATABASE IF NOT EXISTS ciment_conformite;
USE ciment_conformite;

CREATE TABLE echantillons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero_lot VARCHAR(50) NOT NULL,
  date_analyse DATE NOT NULL,
  type_ciment VARCHAR(50),
  nom_laboratoire VARCHAR(100)
);
CREATE TABLE resultats_essais (
  id INT PRIMARY KEY AUTO_INCREMENT,
  echantillon_id INT NOT NULL,
  date_prelevement DATE,
  heure_prelevement TIME,
  resistance_2j FLOAT,
  resistance_7j FLOAT,
  resistance_28j FLOAT,
  debut_prise INT,
  stabilite_expansion FLOAT,
  chaleur_hydratation FLOAT,
  perte_feu FLOAT,
  residu_insoluble FLOAT,
  teneur_sulfate_so3 FLOAT,
  teneur_chlore_cl FLOAT,

  CONSTRAINT fk_echantillon
    FOREIGN KEY (echantillon_id)
    REFERENCES echantillons(id)
    ON DELETE CASCADE
);

