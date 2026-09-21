// TypeScript Type Definitions for Centro Personal de Inteligencia (Rediseño Editorial)

export type Categoria   = 'ia' | 'tecnologia' | 'economia' | 'politica';
export type Importancia = 'Alta' | 'Media' | 'Baja';

export interface Noticia {
  id: string;
  categoria: Categoria;
  importancia: Importancia;
  titulo: string;
  subtitulo: string;          // SUBTÍTULO
  hecho_principal: string;    // 1. Hecho principal
  desarrollo: string;         // 2. Desarrollo del evento
  actores: string;            // 3. Actores implicados
  contexto: string;           // 4. Contexto
  datos_verificables: string; // 5. Datos verificables
  estado_actual: string;      // 6. Estado actual
  declaraciones: string;      // SECCIÓN DE DECLARACIONES
  consecuencias: string;      // POSIBLES CONSECUENCIAS (Proyecciones, Precedentes, Efecto Dominó)
  contrastacion_fuentes?: string; // Análisis cruzado y contrastación de fuentes
  meta_description?: string;   // Síntesis corta optimizada para SEO (< 150 caracteres)
  fecha_actualizacion: string;
  fuentes?: Fuente[];
  // AdSense improvement fields
  tipo_articulo?: 'factual' | 'analisis' | 'debate' | 'comparativa';
  perspectiva_a_favor?: string;
  perspectiva_en_contra?: string;
  implicaciones?: string;
  imagen_url?: string;
  author_name?: string;
}

export interface Fuente {
  id: string;
  noticia_id: string;
  nombre: string;
  tipo: string;
  url: string | null;
  relevancia: 'Alta' | 'Media' | 'Baja';
  fecha_publicacion?: string;
}

export interface Informe {
  id: string;
  categoria: Categoria;
  contenido: string; // Síntesis ejecutiva diaria en Markdown
  fecha_generacion: string;
}

export interface AgentLog {
  timestamp: string;
  agent: 'Coordinador' | 'Agente IA' | 'Agente Tecnologia' | 'Agente Economia' | 'Agente Politica' | 'Verificador' | 'Redactor' | 'Buscador' | 'Sistema';
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface CarouselSlide {
  id: string;
  noticia_id: string | null;
  categoria: Categoria;
  slide_order: number;
  image_url: string;
  created_at: string;
}

