CREATE DATABASE campaign_builder;

\c campaign_builder;

-- Tabla D1: Usuario
CREATE TABLE Usuario (
    usu_id SERIAL PRIMARY KEY,
    usu_nombre VARCHAR(50) NOT NULL,
    usu_email VARCHAR(50) UNIQUE NOT NULL,
    usu_password VARCHAR(100) NOT NULL,
    usu_rol CHAR(1) DEFAULT 'N' CHECK (usu_rol IN ('N', 'A'))
);

-- Tabla D2: Campaña
CREATE TABLE Campaña (
    camp_id SERIAL PRIMARY KEY,
    camp_nombre VARCHAR(60) NOT NULL,
    camp_objetivo VARCHAR(30) NOT NULL,
    camp_presupuesto NUMERIC DEFAULT 0,
    camp_estado CHAR(1) DEFAULT 'B' CHECK (camp_estado IN ('B', 'G')),
    camp_usu_id_fk INTEGER REFERENCES Usuario(usu_id) ON DELETE CASCADE
);