// Mock Store for local fallback development (Rediseño Editorial)
import { Noticia, Fuente, Informe, Categoria } from '@/types';

const initialNoticias: Noticia[] = [
  {
    id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    categoria: 'ia',
    importancia: 'Alta',
    titulo: 'La Era del Razonamiento Autónomo: OpenAI y la Carrera por la Inferencia Compleja Multimodal',
    subtitulo: 'Los principales laboratorios de inteligencia artificial presentan sistemas con razonamiento estructurado nativo que reducen las alucinaciones factuales en tareas científicas y de programación.',
    hecho_principal: `En las últimas semanas, los laboratorios de OpenAI y Google DeepMind han hecho públicas las especificaciones de sus respectivas arquitecturas de nueva generación, orientadas al razonamiento lógico complejo y la inferencia de múltiples pasos. OpenAI ha presentado detalles de la infraestructura técnica de "GPT-5-Reasoning" (denominado comercialmente en fases previas como o3), revelando que integra un mecanismo de cadena de pensamiento oculto con ejecución de código y validación interactiva de hipótesis en tiempo real. Por su parte, Google DeepMind ha publicado los resultados oficiales de su modelo Gemini 2.0 Ultra en pruebas complejas de matemáticas avanzadas, consolidando la transición de la industria desde el paradigma tradicional de modelos autorregresivos instantáneos hacia sistemas de cómputo en tiempo de inferencia.`,
    desarrollo: `El desarrollo de este ciclo de actualizaciones se inició con la filtración en la plataforma académica arXiv de un pre-print sobre la arquitectura de OpenAI el 12 de junio de 2026. Dos días después, el 14 de junio, la compañía oficializó las características técnicas en su blog de investigación. El 16 de junio, Google DeepMind aceleró la publicación de sus benchmarks de Gemini 2.0 Ultra en el portal de investigación de Stanford. El 18 de junio, Anthropic anunció la integración de su módulo de pensamiento extendido configurable para usuarios de su API en sectores médicos y jurídicos.`,
    actores: `Los actores principales involucrados en este avance son OpenAI, bajo la dirección ejecutiva de Sam Altman; Google DeepMind, liderado por Demis Hassabis; Anthropic, que desarrolla la línea de modelos Claude; y Meta AI, que mantiene una línea paralela de código abierto a través de sus modelos LLaMA 4. Asimismo, intervienen comités de auditoría de seguridad independientes y el consorcio FrontierMath, responsable de las pruebas de evaluación matemática de nivel de investigación.`,
    contexto: `Desde la introducción de la arquitectura Transformer en 2017 por parte de investigadores de Google, el avance de la inteligencia artificial se ha regido por las "leyes de escala" (scaling laws), que vinculan la mejora del rendimiento directamente con el incremento de los parámetros del modelo, los datos de entrenamiento y la capacidad de cómputo pre-training. Sin embargo, en 2024 y 2025, el sector comenzó a encontrar rendimientos decrecientes debido a la escasez de nuevos datos de texto público de alta calidad en internet (con proyecciones de agotamiento entre 2026 y 2028). Esto obligó a los laboratorios a reorientar sus esfuerzos hacia el escalado en tiempo de inferencia (System 2 thinking), donde el modelo emplea recursos informáticos adicionales para procesar, verificar y corregir su respuesta antes de entregarla al usuario.`,
    datos_verificables: `El modelo Gemini 2.0 Ultra alcanzó una puntuación de 89.4% en el benchmark multimodal universitario MMMU-Pro, superando el 75.4% de los modelos de la generación anterior. En FrontierMath, una prueba con problemas matemáticos complejos sin solución previa publicada, Gemini 2.0 Ultra resolvió el 25.3% de las propuestas, en comparación con el 2% de los modelos evaluados en 2024. Los datos oficiales de OpenAI señalan que el mecanismo de validación interactiva de código de GPT-5 redujo la tasa de alucinaciones matemáticas y lógicas en un 73% respecto a GPT-4o.`,
    estado_actual: `En el momento de la publicación, ambos modelos se encuentran en fase de despliegue restringido para socios académicos y desarrolladores empresariales seleccionados. Los despliegues comerciales masivos están sujetos a las auditorías técnicas de la Oficina de IA de la Comisión Europea en el marco de la entrada en vigor de la Ley de IA de la UE, y a los comités de seguridad nacional de los Estados Unidos bajo las directivas ejecutivas federales vigentes.`,
    declaraciones: `Sam Altman, Director Ejecutivo de OpenAI: "Hemos cruzado el umbral de la mera predicción estadística hacia el razonamiento guiado por objetivos. El cómputo en inferencia es nuestro nuevo camino de escalado."

Demis Hassabis, Director Ejecutivo de Google DeepMind: "Los resultados de Gemini en FrontierMath demuestran que los sistemas de IA están empezando a abordar problemas que desafían a matemáticos humanos profesionales, basándose en la exploración sistemática de hipótesis."`,
    consecuencias: `🔮 **Proyecciones a futuro:** A corto plazo, el escalado en tiempo de inferencia incrementará la demanda de chips optimizados para computación secuencial en los centros de datos, consolidando el dominio de las grandes empresas capaces de asumir este coste. A medio plazo, veremos la automatización de procesos de decisión científica complejos (descubrimiento de fármacos y validación química).
📚 **Precedentes Históricos:** Este cambio emula la transición en la computación clásica de los años 80 desde procesadores secuenciales básicos hacia arquitecturas integradas con coprocesadores matemáticos dedicados, lo que permitió expandir exponencialmente el software de diseño industrial.
🌀 **Efecto Dominó:** El coste prohibitivo del cómputo de razonamiento forzará fusiones en el sector tecnológico, presionando los precios de la energía eléctrica a nivel regional debido al consumo masivo de los centros de datos y redefiniendo las alianzas geopolíticas por el control de la cadena de suministro de energía limpia.`,
    fecha_actualizacion: new Date('2026-06-18T10:00:00Z').toISOString()
  },
  {
    id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    categoria: 'tecnologia',
    importancia: 'Alta',
    titulo: 'El Cuello de Botella de los 2nm: TSMC, Intel y Samsung Afrontan Retrasos en la Transición a GAA',
    subtitulo: 'Problemas en las tasas de rendimiento de obleas lógicas avanzadas amenazan los planes de desarrollo de chips de próxima generación para 2026 y 2027.',
    hecho_principal: `Las líneas de producción piloto destinadas a la fabricación de semiconductores en el nodo de 2 nanómetros están registrando tasas de rendimiento (yield rates) sustancialmente inferiores a las previstas para su viabilidad comercial. TSMC ha reportado que su proceso de fabricación de transistores de nanoplanas Gate-All-Around (GAA) en las fundiciones de Hsinchu y Kaohsiung se sitúa en un rendimiento inferior al 47%, cuando el mínimo para la rentabilidad industrial es del 70%. Al mismo tiempo, Intel ha pospuesto el calendario de producción masiva de su nodo 18A por un período de seis meses, mientras que Samsung Foundry registra pérdidas operativas debido a problemas de estabilidad en su proceso de deposición atómica.`,
    desarrollo: `Samsung fue la primera fundición en implementar transistores GAA en su nodo comercial de 3 nanómetros en el año 2022. TSMC programó el inicio de su producción piloto del nodo N2 (2nm) para finales de 2025. El 10 de junio de 2026, ASML entregó el informe trimestral indicando retrasos en la calibración de las ópticas de sus sistemas High-NA EUV en territorio taiwanés. El 15 de junio, un memorando interno filtrado de Intel reveló problemas de resistencia eléctrica en el módulo de contactos metálicos (Ruthenium Metal Gate), lo que motivó la posterior declaración de aplazamiento de su nodo 18A al segundo semestre de 2026.`,
    actores: `Los actores principales son Taiwan Semiconductor Manufacturing Company (TSMC), bajo la dirección ejecutiva de C.C. Wei; Intel Corporation, liderada por Pat Gelsinger; Samsung Foundry; ASML Holding N.V., único proveedor global de sistemas de litografía ultravioleta extrema (EUV); y los diseñadores de chips sin fábrica (fabless) como Apple, Nvidia y AMD.`,
    contexto: `El diseño tradicional de transistores FinFET, utilizado de manera generalizada durante la última década, presenta pérdidas críticas de corriente por tunelamiento cuántico cuando el canal de conducción se reduce por debajo de los 3 nanómetros (espesor de apenas unos 10 átomos de silicio). Para superar este límite físico, la industria inició la transición hacia la arquitectura Gate-All-Around (GAA), en la que la puerta de control envuelve el canal por los cuatro lados. Sin embargo, la deposición uniforme de materiales conductores a nivel molecular requiere de una precisión nanométrica en los espejos y lentes de difracción de las máquinas de ASML, cuyos costes superan los 300 millones de dólares por unidad.`,
    datos_verificables: `El rendimiento actual de TSMC en oblea limpia para el nodo N2 se sitúa entre el 40% y el 47%. El precio de las máquinas de litografía de nueva generación High-NA EUV (modelo Twinscan EXE) de ASML oscila entre 300 y 350 millones de dólares. El CHIPS Act de Estados Unidos contempla un presupuesto de subsidios de 52.000 millones de dólares, mientras que el equivalente europeo cuenta con 43.000 millones de euros en fondos públicos.`,
    estado_actual: `Los equipos de ingeniería de procesos de TSMC están modificando las composiciones químicas de las capas de sacrificio de silicio-germanio en las fundiciones de prueba de Taiwán. Debido a los rendimientos actuales, los diseñadores de hardware están revisando sus hojas de ruta: Apple empleará chips fabricados con un nodo de 3nm optimizado (N3P) para sus dispositivos de finales de 2026, y Nvidia evalúa el empaquetado 3D (CoWoS) para compensar la falta de densidad de transistores en la arquitectura Rubin.`,
    declaraciones: `C.C. Wei, Director Ejecutivo de TSMC: "La física en el nodo de 2 nanómetros es implacable. Estamos progresando en la estabilización de los transistores de nanoplanas, pero la viabilidad comercial requiere optimizaciones adicionales en los procesos de deposición."

Pat Gelsinger, Director Ejecutivo de Intel: "Nuestra hoja de ruta para el nodo 18A sigue siendo la base de nuestra estrategia de fundición externa. Los reajustes temporales aseguran que el volumen de producción cumpla con los estándares de calidad de nuestros clientes."`,
    consecuencias: `🔮 **Proyecciones a futuro:** Los retrasos en los nodos de 2nm forzarán a los diseñadores de hardware a exprimir al máximo las arquitecturas actuales de 3nm y a depender de técnicas de empaquetado avanzado 3D. Esto retrasará la llegada de procesadores de consumo con saltos del 30% en eficiencia energética hasta finales de 2027.
📚 **Precedentes Históricos:** Al igual que la crisis de los semiconductores de 2020-2022 evidenció los cuellos de botella geográficos de la fabricación de chips, esta transición a GAA muestra los límites de la física clásica en la litografía de silicio, similar a cuando la industria tuvo que migrar del silicio plano a FinFET en 2011.
🌀 **Efecto Dominó:** Los retrasos en hardware ralentizarán la amortización de inversiones de capital en IA y forzarán a los gobiernos a subsidiar de manera más agresiva las fundiciones nacionales (CHIPS Act) para asegurar la soberanía tecnológica frente a la inestabilidad en el Estrecho de Taiwán.`,
    fecha_actualizacion: new Date('2026-06-18T12:00:00Z').toISOString()
  },
  {
    id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    categoria: 'economia',
    importancia: 'Alta',
    titulo: 'Pausa Monetaria Global: Fed y BCE Mantienen Tipos Ante Presiones Inflacionarias Estructurales',
    subtitulo: 'La Reserva Federal y el Banco Central Europeo detienen los recortes de tipos tras constatar que factores de desglobalización y transición energética sostienen la inflación subyacente.',
    hecho_principal: `La Reserva Federal de los Estados Unidos y el Banco Central Europeo han acordado congelar de forma temporal sus respectivos planes de flexibilización monetaria. El Comité Federal de Mercado Abierto (FOMC) ha mantenido la tasa de fondos federales en el rango del 4.75%-5.00%, mientras que el Consejo de Gobierno del BCE ha estabilizado su tasa de depósito en el 4.00%. Ambas instituciones han justificado su decisión señalando el repunte en la inflación de servicios y la persistencia de costes de producción estructurales que limitan la efectividad de las subidas y bajadas de tipos de interés tradicionales.`,
    desarrollo: `Tras un agresivo ciclo de endurecimiento monetario entre 2022 y 2023, los bancos centrales comenzaron a reducir los tipos en la primera mitad de 2025. El 12 de mayo de 2026, la Oficina de Estadísticas Laborales de EE.UU. publicó el dato de inflación subyacente. El 15 de mayo, Eurostat hizo lo propio para la Eurozona. El 18 de junio, en sus reuniones ordinarias de política monetaria, la Fed votó 10 a 2 mantener los tipos, y el BCE adoptó la misma medida por unanimidad, interrumpiendo la tendencia de flexibilización que los mercados financieros esperaban para la segunda mitad del año.`,
    actores: `Los actores principales son la Reserva Federal de EE.UU., presidida por Jerome Powell; el Banco Central Europeo, dirigido por Christine Lagarde; el Banco de Japón, que mantiene un endurecimiento monetario moderado bajo Kazuo Ueda; y el Banco de Pagos Internacionales (BIS), que actúa como coordinador de las directrices de estabilidad financiera.`,
    contexto: `A diferencia de la inflación cíclica, provocada por un exceso temporal de la demanda y que responde con rapidez a los cambios en el coste del crédito, la inflación actual presenta componentes estructurales de oferta. Entre ellos destaca el proceso de desglobalización o relocalización de cadenas de suministro ("nearshoring" y "friendshoring"), que sustituye la producción de bajo coste de China por alternativas geográficamente más cercanas pero más caras. Asimismo, influye el coste de capital necesario para la transición hacia energías renovables y la escasez de mano de obra en las economías avanzadas provocada por el envejecimiento demográfico.`,
    datos_verificables: `La inflación subyacente interanual registrada en mayo se situó en el 3.4% en los Estados Unidos y en el 2.9% en la Eurozona, lejos del objetivo del 2% fijado por ambos bancos centrales. El coste de los servicios en EE.UU. creció a un ritmo del 5.3% interanual. Por su parte, el Banco de Japón aumentó sus tipos oficiales de interés de referencia en 25 puntos básicos, situándolos en el 0.75%.`,
    estado_actual: `La política monetaria global se mantiene en territorio restrictivo. Los mercados de renta fija y los contratos de futuros sobre tipos de interés han retrasado sus previsiones de nuevos recortes de tasas hasta el primer trimestre de 2027. Esto ha provocado presiones de liquidez y salidas de capitales en las economías emergentes debido al fortalecimiento del dólar estadounidense.`,
    declaraciones: `Jerome Powell, Presidente de la Reserva Federal: "La inflación subyacente nos obliga a mantener una postura restrictiva. No reduciremos las tasas hasta que tengamos la certeza de que el repunte no representa una tendencia de largo plazo."

Christine Lagarde, Presidenta del BCE: "Las presiones sobre los costes derivadas de las cadenas de suministro locales y la transición energética sugieren que la inflación de servicios es persistente. El Consejo actuará con prudencia y paciencia."`,
    consecuencias: `🔮 **Proyecciones a futuro:** Los tipos de interés de referencia permanecerán en niveles elevados durante un periodo más prolongado del esperado, incrementando la presión sobre los refinanciamientos de deuda corporativa y limitando la actividad del sector inmobiliario comercial a medio plazo.
📚 **Precedentes Históricos:** Este escenario recuerda a la estanflación de finales de la década de 1970, cuando la Reserva Federal, bajo Paul Volcker, tuvo que mantener tasas elevadas de forma persistente para desanclar las expectativas de inflación frente a shocks de oferta estructurales.
🌀 **Efecto Dominó:** El mantenimiento de tipos altos en el hemisferio norte encarecerá el coste del capital global, acelerando la fuga de capitales de mercados emergentes hacia activos de renta fija estadounidense y tensando las balanzas de pagos de los países en desarrollo.`,
    fecha_actualizacion: new Date('2026-06-18T14:30:00Z').toISOString()
  },
  {
    id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    categoria: 'politica',
    importancia: 'Alta',
    titulo: 'El Tratado de Seguridad del Mar del Norte: La Alianza Anglo-Nórdica para la Defensa de Infraestructura Submarina',
    subtitulo: 'Reino Unido, Noruega, Suecia y Finlandia crean un comando conjunto y una red de vigilancia acústica para proteger cables de datos e interconexión eléctrica.',
    hecho_principal: `Los gobiernos del Reino Unido, Noruega, Suecia y Finlandia han firmado de forma conjunta el Tratado de Seguridad de Infraestructuras del Mar del Norte y el Báltico. Este acuerdo formaliza la creación de una fuerza de respuesta rápida y un centro de coordinación de inteligencia marítima para vigilar y proteger las redes submarinas de cables de datos, gasoductos e interconectores eléctricos, estableciendo por primera vez un protocolo de defensa conjunta ante incidentes de sabotaje en aguas internacionales.`,
    desarrollo: `Las negociaciones técnicas para la redacción del tratado se desarrollaron de forma confidencial durante dieciocho meses. La firma formal tuvo lugar en la Lancaster House de Londres el 18 de junio de 2026. Los hitos que motivaron el pacto comenzaron en enero de 2025 con la rotura de dos cables de telecomunicaciones submarinos entre Noruega y el Reino Unido, seguida en marzo de 2025 de la detección de un vehículo submarino no tripulado de características industriales en las cercanías del gasoducto Baltic Connector.`,
    actores: `Los actores firmantes son el Primer Ministro de Noruega, Jonas Gahr Støre; el Primer Ministro del Reino Unido, Keir Starmer; el Primer Ministro de Suecia, Ulf Kristersson; y el Presidente de Finlandia, Alexander Stubb. La coordinación operativa se delega en el Mando Marítimo Aliado de la OTAN (MARCOM) y las marinas nacionales de defensa correspondientes.`,
    contexto: `El lecho marino del Atlántico Norte y el Mar del Norte contiene cables de fibra óptica que canalizan más del 95% del tráfico de internet transatlántico, además de la infraestructura de transporte de gas natural que abastece al norte de Europa. La legislación internacional marítima vigente (UNCLOS de 1982) otorga libertad de tendido y no tipifica el daño accidental a cables en aguas internacionales como un acto hostil, lo que ha sido aprovechado por flotas militares de diversos países para realizar actividades de reconocimiento y mapeo con cobertura de buques pesqueros o de investigación civil. El precedente del sabotaje de los gasoductos Nord Stream 1 y 2 en septiembre de 2022 evidenció la vulnerabilidad física de estos activos críticos.`,
    datos_verificables: `El tratado comprende 847 páginas en sus anexos de clasificación de seguridad y 124 páginas en su publicación oficial abierta. Noruega ha anunciado una asignación presupuestaria extraordinaria de 4.200 millones de coronas noruegas para la adquisición de sensores acústicos activos fijos. El Baltic Connector, donde se registró el incidente de intrusión de drones en 2025, opera a una profundidad media de 400 metros.`,
    estado_actual: `A partir del momento de la firma, queda constituido el Centro de Coordinación de Seguridad de Infraestructuras (ISCC) con sede en Stavanger (Noruega), iniciando operaciones de patrullaje marítimo coordinado 24/7. Las armadas de los cuatro países han comenzado a desplegar de forma conjunta los primeros sistemas de hidrófonos de profundidad en el canal del Skagerrak.`,
    declaraciones: `Jonas Gahr Støre, Primer Ministro de Noruega: "La seguridad del lecho marino no es un asunto secundario; es la columna vertebral de nuestra soberanía energética y de datos. Este tratado nos permite responder en tiempo real."

John Healey, Secretario de Defensa del Reino Unido: "La infraestructura crítica bajo el mar está expuesta a tácticas de guerra híbrida que desafían la legalidad internacional. Actuaremos de forma coordinada con nuestros socios nórdicos para disuadir y proteger."`,
    consecuencias: `🔮 **Proyecciones a futuro:** A corto plazo, aumentará la presencia de patrullas militares conjuntas y la monitorización constante de buques civiles "sospechosos" en el Mar del Norte y el Báltico. A medio plazo, se estandarizarán los sistemas de sensores acústicos automatizados en los nuevos proyectos de cableado submarino.
📚 **Precedentes Históricos:** La creación de este comando de defensa marítima regional se asemeja a las patrullas conjuntas de escolta de petroleros en el Golfo Pérsico durante la década de 1980 ("guerra de las lanchas"), destinadas a asegurar el flujo de recursos energéticos frente a agresiones híbridas estatales.
🌀 **Efecto Dominó:** El blindaje militar de las infraestructuras de interconexión aumentará las primas de seguro de transporte marítimo en el Atlántico Norte y acelerará la inversión en satélites de baja órbita como redundancia de datos ante la vulnerabilidad física de la fibra submarina.`,
    fecha_actualizacion: new Date('2026-06-18T16:00:00Z').toISOString()
  }
];

const initialFuentes: Fuente[] = [
  // ─── IA ───────────────────────────────────────────────────────
  {
    id: 'f1',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'Bloomberg Technology',
    tipo: 'Medio de comunicación',
    url: 'https://bloomberg.com/technology',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-17'
  },
  {
    id: 'f2',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'arXiv — AI Research (cs.AI)',
    tipo: 'Paper científico',
    url: 'https://arxiv.org/list/cs.AI/recent',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-15'
  },
  {
    id: 'f3',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'OpenAI Technical Blog',
    tipo: 'Comunicado de prensa',
    url: 'https://openai.com/research',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-14'
  },
  {
    id: 'f4',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'Google DeepMind — Research Publications',
    tipo: 'Paper científico',
    url: 'https://deepmind.google/research',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-16'
  },
  {
    id: 'f5',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'MIT Technology Review',
    tipo: 'Medio de comunicación',
    url: 'https://technologyreview.com',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  },
  {
    id: 'f6',
    noticia_id: 'a0e82930-1c3f-4e11-893f-7e9b28014881',
    nombre: 'Anthropic — System Card Claude 3.7',
    tipo: 'Documento oficial',
    url: 'https://anthropic.com/research',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-13'
  },
  // ─── TECNOLOGÍA ───────────────────────────────────────────────
  {
    id: 'f7',
    noticia_id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    nombre: 'Nikkei Asia — Semiconductors',
    tipo: 'Medio de comunicación',
    url: 'https://asia.nikkei.com/Business/Tech/Semiconductors',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-17'
  },
  {
    id: 'f8',
    noticia_id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    nombre: 'ASML — Investor Day Presentation',
    tipo: 'Documento oficial',
    url: 'https://asml.com/investor-relations',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-10'
  },
  {
    id: 'f9',
    noticia_id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    nombre: 'Financial Times — Chips Report',
    tipo: 'Medio de comunicación',
    url: 'https://ft.com/semiconductors',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-16'
  },
  {
    id: 'f10',
    noticia_id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    nombre: 'IEEE Spectrum — Process Technology',
    tipo: 'Paper científico',
    url: 'https://spectrum.ieee.org/semiconductors',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-12'
  },
  {
    id: 'f11',
    noticia_id: 'b0e82930-2c3f-4e11-893f-7e9b28014882',
    nombre: 'Samsung Foundry — Q2 Earnings Call',
    tipo: 'Documento oficial',
    url: 'https://samsung.com/global/ir',
    relevancia: 'Media',
    fecha_publicacion: '2026-06-14'
  },
  // ─── ECONOMÍA ─────────────────────────────────────────────────
  {
    id: 'f12',
    noticia_id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    nombre: 'Federal Reserve — FOMC Statement',
    tipo: 'Documento oficial',
    url: 'https://federalreserve.gov/monetarypolicy/fomccalendars.htm',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  },
  {
    id: 'f13',
    noticia_id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    nombre: 'ECB — Monetary Policy Press Conference',
    tipo: 'Documento oficial',
    url: 'https://ecb.europa.eu/press/pressconf',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  },
  {
    id: 'f14',
    noticia_id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    nombre: 'U.S. Bureau of Labor Statistics — CPI Report',
    tipo: 'Documento oficial',
    url: 'https://bls.gov/cpi',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-12'
  },
  {
    id: 'f15',
    noticia_id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    nombre: 'Bank for International Settlements — Quarterly Review',
    tipo: 'Documento oficial',
    url: 'https://bis.org/publ/quarterly.htm',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-08'
  },
  {
    id: 'f16',
    noticia_id: 'c0e82930-3c3f-4e11-893f-7e9b28014883',
    nombre: 'Morgan Stanley — Global Economic Outlook',
    tipo: 'Medio de comunicación',
    url: 'https://morganstanley.com/ideas/global-economic-outlook',
    relevancia: 'Media',
    fecha_publicacion: '2026-06-15'
  },
  // ─── POLÍTICA ─────────────────────────────────────────────────
  {
    id: 'f17',
    noticia_id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    nombre: 'Reuters — Security & Defence',
    tipo: 'Medio de comunicación',
    url: 'https://reuters.com/world/europe/defence',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  },
  {
    id: 'f18',
    noticia_id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    nombre: 'UK Ministry of Defence — Joint Statement',
    tipo: 'Documento oficial',
    url: 'https://gov.uk/government/organisations/ministry-of-defence',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  },
  {
    id: 'f19',
    noticia_id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    nombre: 'Financial Times — Defence & Security',
    tipo: 'Medio de comunicación',
    url: 'https://ft.com/defence',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-17'
  },
  {
    id: 'f20',
    noticia_id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    nombre: 'NATO Strategic Communications Centre — Hybrid Warfare Report',
    tipo: 'Documento oficial',
    url: 'https://stratcomcoe.org/publications',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-05'
  },
  {
    id: 'f21',
    noticia_id: 'd0e82930-4c3f-4e11-893f-7e9b28014884',
    nombre: 'Norwegian Ministry of Defence',
    tipo: 'Documento oficial',
    url: 'https://regjeringen.no/en/dep/fd',
    relevancia: 'Alta',
    fecha_publicacion: '2026-06-18'
  }
];

const initialInformes: Informe[] = [
  {
    id: 'i1',
    categoria: 'ia',
    contenido: `## Síntesis Ejecutiva: Inteligencia Artificial — 18 de junio de 2026

El ciclo actual de la IA está definido por una transición de paradigma que los laboratorios líderes confirman de forma convergente: el escalado clásico (más parámetros, más datos) está cediendo protagonismo al razonamiento en inferencia.

* **Ruptura generacional:** GPT-5, Gemini 2.0 Ultra y Claude 3.7 representan una nueva clase de sistemas que razonan, verifican y corrigen sus propias hipótesis antes de responder.
* **Benchmark FrontierMath:** Gemini 2.0 Ultra alcanza el 25.3% en problemas matemáticos que en 2024 ningún modelo podía resolver. Señal de capacidades emergentes en resolución de problemas complejos.
* **Open Source vs. Propietario:** La decisión de Meta de publicar LLaMA 4 en abierto divide el sector en dos filosofías respecto a la seguridad de la información y el acceso comercial.
* **Comoditización acelerada:** La convergencia de rendimiento entre modelos reduce la diferenciación técnica y desplaza el valor competitivo hacia aplicaciones verticales de la industria.
* **Regulación bajo presión:** La AI Act europea muestra lagunas de cobertura para los modelos de nueva generación con razonamiento interno, superando el ritmo legislativo tradicional.`,
    fecha_generacion: new Date('2026-06-18T18:00:00Z').toISOString()
  },
  {
    id: 'i2',
    categoria: 'tecnologia',
    contenido: `## Síntesis Ejecutiva: Tecnología y Semiconductores — 18 de junio de 2026

La miniaturización de chips registra dificultades técnicas en el nodo de 2 nanómetros. Los tres grandes fabricantes globales (TSMC, Intel, Samsung) registran demoras en la calibración y el rendimiento comercial de sus transistores.

* **TSMC yield crisis:** Los yield rates del nodo N2 se sitúan entre el 40% y el 47% en producción piloto, por debajo del umbral del 70% necesario para la viabilidad comercial.
* **Intel 18A pospuesto:** El proceso industrial acumuló seis meses de retraso debido a problemas de resistencia eléctrica en el módulo de contactos metálicos (Ruthenium Metal Gate).
* **Samsung Foundry:** Qualcomm y Nvidia reducen parte de sus pedidos de desarrollo tras las dificultades de tasa de rendimiento registradas en los nodos iniciales de 3nm GAA.
* **Dependencia geopolítica:** Taiwán concentra el 92% de la fabricación de chips por debajo de los 5nm. Las leyes CHIPS de EE.UU. y Europa avanzan en la cofinanciación de fundiciones locales.
* **Alternativas técnicas:** El sector explora soluciones de empaquetado en chiplets, apilamiento en 3D y el estudio de materiales como disulfuro de molibdeno (MoS₂) como alternativas al silicio.`,
    fecha_generacion: new Date('2026-06-18T18:00:00Z').toISOString()
  },
  {
    id: 'i3',
    categoria: 'economia',
    contenido: `## Síntesis Ejecutiva: Economía Global — 18 de junio de 2026

Los bancos centrales de las principales economías de mercado han pausado el ciclo de bajada de tipos de interés ante el repunte de la inflación en el sector servicios y factores de coste estructurales.

* **Pausa monetaria confirmada:** La Reserva Federal mantiene tipos al 4.75%-5.00% y el BCE al 4.00%, deteniendo la flexibilización de tasas ante la evolución de la inflación subyacente.
* **Factores estructurales:** El "nearshoring", el coste de financiación para la transición energética y el envejecimiento demográfico en países desarrollados presionan al alza los precios.
* **Divergencia en el Banco de Japón:** Sube la tasa de interés de referencia en 25 puntos básicos al 0.75%, fortaleciendo el yen y afectando a las operaciones de carry trade financiero.
* **Trampa de la deuda:** Informes del BIS señalan que los niveles de deuda soberana acumulada complican el mantenimiento indefinido de tipos altos por el incremento del servicio de la deuda.
* **Flujos emergentes:** La combinación de un dólar fuerte y altos rendimientos en renta fija estadounidense restringe las opciones de financiación y genera presión cambiaria en mercados en desarrollo.`,
    fecha_generacion: new Date('2026-06-18T18:00:00Z').toISOString()
  },
  {
    id: 'i4',
    categoria: 'politica',
    contenido: `## Síntesis Ejecutiva: Política Internacional — 18 de junio de 2026

La firma del Tratado Anglo-Nórdico de Infraestructuras establece un marco de coordinación de seguridad para el Mar del Norte y el Báltico, operando al margen de las estructuras de toma de decisiones de la OTAN.

* **Comando conjunto:** El ISCC en Stavanger asume funciones de monitorización 24/7 con capacidad de coordinar respuestas operativas ante incidentes bajo criterios de gravedad unificados.
* **Incidentes documentados:** El tratado responde a la rotura de dos cables de fibra en enero de 2025 y a la detección de drones industriales submarinos en las inmediaciones del Baltic Connector en marzo de 2025.
* **Atribución de amenazas:** El acuerdo asume el término legal de "actores estatales con intenciones adversas" para enfocar las contramedidas ante operaciones de guerra híbrida submarina.
* **Ampliación de la alianza:** Países Bajos, Dinamarca e Islandia mantienen conversaciones para incorporarse a esta arquitectura de seguridad regional.
* **Tecnología de vigilancia:** La monitorización marítima incorpora sistemas automatizados de detección acústica y algoritmos de seguimiento de naves AIS para alertar de anomalías.`,
    fecha_generacion: new Date('2026-06-18T18:00:00Z').toISOString()
  }
];

const globalForStore = globalThis as unknown as {
  noticias: Noticia[];
  fuentes: Fuente[];
  informes: Informe[];
};

if (!globalForStore.noticias) {
  globalForStore.noticias = initialNoticias;
}
if (!globalForStore.fuentes) {
  globalForStore.fuentes = initialFuentes;
}
if (!globalForStore.informes) {
  globalForStore.informes = initialInformes;
}

export const mockStore = {
  getNoticias(categoria?: Categoria): Noticia[] {
    const list = globalForStore.noticias;
    const sorted = [...list].sort((a, b) => new Date(b.fecha_actualizacion).getTime() - new Date(a.fecha_actualizacion).getTime());
    if (categoria) {
      return sorted.filter((n) => n.categoria === categoria);
    }
    return sorted;
  },

  getNoticiaById(id: string): Noticia | undefined {
    const noticia = globalForStore.noticias.find((n) => n.id === id);
    if (noticia) {
      return {
        ...noticia,
        fuentes: this.getFuentes(noticia.id)
      };
    }
    return undefined;
  },

  getFuentes(noticiaId: string): Fuente[] {
    return globalForStore.fuentes.filter((f) => f.noticia_id === noticiaId);
  },

  getInformes(categoria?: Categoria): Informe[] {
    const list = globalForStore.informes;
    const sorted = [...list].sort((a, b) => new Date(b.fecha_generacion).getTime() - new Date(a.fecha_generacion).getTime());
    if (categoria) {
      return sorted.filter((i) => i.categoria === categoria);
    }
    return sorted;
  },

  addNoticia(noticiaData: Omit<Noticia, 'id' | 'fecha_actualizacion'> & { id?: string }): Noticia {
    const newNoticia: Noticia = {
      ...noticiaData,
      id: noticiaData.id || crypto.randomUUID(),
      fecha_actualizacion: new Date().toISOString()
    };
    globalForStore.noticias.push(newNoticia);
    return newNoticia;
  },

  addFuentes(fuenteItems: Omit<Fuente, 'id'>[]): Fuente[] {
    const added: Fuente[] = [];
    for (const item of fuenteItems) {
      const newFuente: Fuente = {
        ...item,
        id: crypto.randomUUID()
      };
      globalForStore.fuentes.push(newFuente);
      added.push(newFuente);
    }
    return added;
  },

  addInforme(informeData: Omit<Informe, 'id' | 'fecha_generacion'>): Informe {
    const newInforme: Informe = {
      ...informeData,
      id: crypto.randomUUID(),
      fecha_generacion: new Date().toISOString()
    };
    globalForStore.informes.push(newInforme);
    return newInforme;
  },

  clearNoticiasByCategoria(categoria: Categoria) {
    const idsToRemove = globalForStore.noticias
      .filter((n) => n.categoria === categoria)
      .map((n) => n.id);

    globalForStore.noticias = globalForStore.noticias.filter((n) => n.categoria !== categoria);
    globalForStore.fuentes = globalForStore.fuentes.filter((f) => !idsToRemove.includes(f.noticia_id));
  },

  clearInformesByCategoria(categoria: Categoria) {
    globalForStore.informes = globalForStore.informes.filter((i) => i.categoria !== categoria);
  }
};
