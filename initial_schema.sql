-- Schema inicial para la tabla de noticias (news)

-- Habilitar la extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla 'news'
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL,
    source_links TEXT[] DEFAULT '{}'::TEXT[], -- Array de enlaces para las fuentes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security (RLS) para mayor seguridad
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir la lectura pública de las noticias
CREATE POLICY "Permitir lectura pública de noticias" 
ON news FOR SELECT 
USING (true);

-- Crear política para permitir la inserción/edición utilizando service_role o rol autenticado (opcional, ajusta según necesites)
CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON news FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Permitir modificación a usuarios autenticados" 
ON news FOR UPDATE 
TO authenticated 
USING (true);
