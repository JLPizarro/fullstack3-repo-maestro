-- Tabla de Personal para el MS de RRHH
CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nombre2 VARCHAR(100),
    apellido1 VARCHAR(100) NOT NULL,
    apellido2 VARCHAR(100),
    cargo VARCHAR(100) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    base VARCHAR(100) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice de rendimiento
CREATE INDEX idx_rut_personal ON personal(rut);

-- Tabla de Histórico de Personal (snapshot diario)
CREATE TABLE IF NOT EXISTS personal_historico (
    id SERIAL PRIMARY KEY,
    personal_id INT NOT NULL,
    nombre VARCHAR(100),
    nombre2 VARCHAR(100),
    apellido1 VARCHAR(100),
    apellido2 VARCHAR(100),
    cargo VARCHAR(100),
    rut VARCHAR(20),
    base VARCHAR(100),
    estado BOOLEAN,
    motivo TEXT,
    fecha_snapshot DATE NOT NULL
);

-- Índices de rendimiento
CREATE INDEX idx_historico_personal_id ON personal_historico(personal_id);
CREATE INDEX idx_historico_fecha ON personal_historico(fecha_snapshot);

-- Función: snapshot diario del personal a personal_historico
CREATE OR REPLACE FUNCTION snapshot_personal_diario()
RETURNS void AS $$
BEGIN
    INSERT INTO personal_historico
        (personal_id, nombre, nombre2, apellido1, apellido2,
         cargo, rut, base, estado, motivo, fecha_snapshot)
    SELECT
        id, nombre, nombre2, apellido1, apellido2,
        cargo, rut, base, estado, motivo, CURRENT_DATE
    FROM personal;
END;
$$ LANGUAGE plpgsql;

-- pg_cron: programar snapshot a las 23:59 todos los días
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'snapshot-personal-diario',
    '59 23 * * *',
    'SELECT snapshot_personal_diario()'
);

-- Población de datos para Personal
INSERT INTO personal (nombre, apellido1, cargo, rut, base) VALUES 
('Juan', 'Perez', 'Chofer', '11111111-1', 'Lampa'),
('Maria', 'Gomez', 'Administrativo', '22222222-2', 'Santiago'),
('Carlos', 'Lopez', 'Mecanico', '33333333-3', 'Lampa'),
('Ana', 'Martinez', 'Prevencionista', '44444444-4', 'Santiago')
ON CONFLICT (rut) DO NOTHING;

-- TABLAS Y POBLACIÓN DE DATOS PARA OTROS MÓDULOS

-- Bodega: Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio FLOAT NOT NULL,
    stock INT DEFAULT 0 NOT NULL
);

INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Aceite Motor 10W40', 'Tambor 200L', 250000, 10),
('Neumatico 295/80R22.5', 'Direccional', 180000, 24),
('Filtro de Aire', 'Para camion Scania', 45000, 50),
('Pastillas de Freno', 'Kit completo', 80000, 15)
ON CONFLICT DO NOTHING;

-- Bodega: Ingresos de Bodega
CREATE TABLE IF NOT EXISTS ingresos_bodega (
    id SERIAL PRIMARY KEY,
    usuario_entrega VARCHAR(150),
    usuario_recepcion VARCHAR(150),
    tipo_doc_origen VARCHAR(100),
    tipo_doc_recepcion VARCHAR(100),
    n_documento VARCHAR(100),
    fecha_requerimiento DATE,
    descripcion VARCHAR(500),
    n_oc VARCHAR(100),
    n_salida VARCHAR(100)
);

INSERT INTO ingresos_bodega (usuario_entrega, usuario_recepcion, tipo_doc_origen, tipo_doc_recepcion, n_documento, fecha_requerimiento, descripcion, n_oc) VALUES
('Proveedor XYZ', 'Vicente Parada', 'Orden de Compra', 'Guia de Despacho', 'GD-1001', '2026-04-20', 'Ingreso de repuestos varios', 'OC-5001'),
('Ferreteria Industrial', 'Luciano Quintanilla', 'Factura', 'Guia de Despacho Interna', 'F-8899', '2026-04-25', 'Herramientas menores', 'OC-5002'),
('Distribuidora Neumaticos', 'Vicente Parada', 'Orden de Compra', 'Guia de Despacho', 'GD-1050', '2026-04-28', 'Set de neumaticos nuevos', 'OC-5003')
ON CONFLICT DO NOTHING;

-- Facturación: Facturas
CREATE TABLE IF NOT EXISTS facturas (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(100) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total FLOAT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Emitida'
);

INSERT INTO facturas (cliente, total, estado) VALUES
('Minera Los Andes', 1500000, 'Pagada'),
('Constructora del Sur', 850000, 'Emitida'),
('Agricola Central', 420000, 'Vencida'),
('Transportes Unidos', 2100000, 'Emitida')
ON CONFLICT DO NOTHING;

-- Prevención: Incidentes
CREATE TABLE IF NOT EXISTS incidentes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    nivel_gravedad VARCHAR(50) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO incidentes (titulo, descripcion, nivel_gravedad) VALUES
('Derrame de aceite', 'Derrame menor en taller de Lampa', 'Baja'),
('Casi colision en ruta', 'Camion esquivo vehiculo particular cerca de peaje', 'Alta'),
('Corte en mano', 'Mecanico se corto con pieza metalica', 'Media'),
('Extintor vencido', 'Se detecto extintor vencido en bodega principal', 'Baja')
ON CONFLICT DO NOTHING;