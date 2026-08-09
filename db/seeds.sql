-- Datos Iniciales de Prueba (Seeds) - Plataforma Raíces Vivas
-- Cuentas de demostración iniciales (Contraseña SHA-256 para 'admin123'):
-- 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918

-- 1. Usuarios Demo Registrados (Visitante, Comunidad, Coordinador)
INSERT INTO users (id, full_name, email, password_hash, role, community_name, data_consent, consent_timestamp)
VALUES 
('usr-1', 'Camila Morales', 'viajero@raicesvivas.org', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Visitante', NULL, TRUE, CURRENT_TIMESTAMP),
('usr-2', 'Comunidad Inga de Mocoa', 'comunidad@raicesvivas.org', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Comunidad', 'Asociación Guardianes del Sereno - Mocoa', TRUE, CURRENT_TIMESTAMP),
('usr-3', 'Carlos Mendoza', 'coordinador@raicesvivas.org', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Coordinador', NULL, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- 2. Catálogo Extendido de Experiencias Turísticas Comunitarias (25 Ejemplos de Caquetá y Putumayo)
INSERT INTO experiences (id, title, region, type, duration, price, language, max_capacity, summary, description, includes, host_community, image_url, status, created_by)
VALUES 
('exp-01', 'Sendero del Jaguar y Cascada El Fin del Mundo', 'Mocoa (Putumayo)', 'Senderismo', 'Día completo', 120000.00, 'Español', 10,
 'Camina por la selva alta amazónica entre cascadas cristalinas y avistamiento de fauna nativa liderado por la comunidad Inga.',
 'Una travesía inolvidable por los senderos sagrados del Piedemonte Amazónico en Mocoa. Aprende sobre plantas medicinales, respira aire puro y asciende hasta la mítica Cascada Fin del Mundo con guías indígenas locales capacitados.',
 '["Guianza local bilingüe", "Almuerzo tradicional en hoja de bijao", "Poliza de seguro de accidentes", "Ingreso a la reserva comunitaria"]'::jsonb,
 'Asociación Guardianes del Sereno - Mocoa',
 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-02', 'Ruta de la Chicha Ancestral y Sabiduría Kamëntsá', 'Sibundoy (Putumayo)', 'Gastronomía', 'Medio día', 85000.00, 'Lengua Kamëntsá', 8,
 'Taller participativo de elaboración de bebidas sagradas y gastronomía tradicional con la comunidad Kamëntsá.',
 'Sumérgete en el Valle de Sibundoy. Visita la chagra ancestral, cosecha maíz nativo y conoce la historia detrás de las máscaras de madera y la chicha de maíz fermentado.',
 '["Taller práctico de cocina tradicional", "Degustación de chicha y productos locales", "Muestra de música con flauta y tambor"]'::jsonb,
 'Cabildo Indígena Kamëntsá de Sibundoy',
 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-03', 'Avistamiento de Aves y Canoa por el Río Fragua', 'San José del Fragua (Caquetá)', 'Avistamiento de Aves', '1-3 horas', 95000.00, 'Inglés', 6,
 'Recorrido matutino en canoa artesanal observando tucanes, guacamayas y tángaras en su hábitat natural.',
 'El Piedemonte Caqueteño es un tesoro biodiverso de aves neotropicales. Navega en silencio por el Río Fragua junto a observadores de aves campesinos y fotógrafos de la comunidad.',
 '["Uso de binoculares de alta definición", "Refrigerio de frutas amazónicas", "Navegación en canoa a remo"]'::jsonb,
 'Ecoturismo Campesino del Fragua',
 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-04', 'Taller de Tejido en Cumare y Símbolos Amazónicos', 'Florencia (Caquetá)', 'Artesanías', 'Medio día', 70000.00, 'Español', 12,
 'Aprende a extraer la fibra de la palma de cumare y tejer mochilas ancestrales con mujeres artesanas.',
 'Descubre los saberes femeninos de la Amazonía caqueteña. Extrae la fibra vegetal, aplica tintes naturales elaborados con plantas y llévate tu propia creación tejida a mano.',
 '["Materiales de palma de cumare y tintes", "Kit de tejido artesanal", "Café y amasijos regionales"]'::jsonb,
 'Asociación de Mujeres Artesanas de Florencia',
 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-05', 'Caminata de Medicina Tradicional y Plantas Sagradas', 'Villagarzón (Putumayo)', 'Senderismo', '2+ días', 250000.00, 'Lengua Inga', 5,
 'Inmersión cultural de 2 días en la selva con médicos tradicionales Taitas y botánica medicinal ancestral.',
 'Una experiencia espiritual y botánica profunda. Aprende el uso de la uña de gato, la sangre de drago y comparte círculos de palabra con las autoridades tradicionales de la comunidad Inga.',
 '["Hospedaje ecológico en maloka tradicional", "Alimentación orgánica amazónica", "Guianza por Taita Inga", "Recorrido etnobotánico"]'::jsonb,
 'Maloka Ancestral Yacha Wasi',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-06', 'Cañón del Río Orteguaza y Leyendas Indígenas', 'Florencia (Caquetá)', 'Ecoturismo', 'Día completo', 135000.00, 'Español', 15,
 'Navegación en lancha ecológica por las formaciones rocosas del Orteguaza compartiendo mitos locales.',
 'Contempla imponentes paredes de piedra cubiertas de musgo y selva vírgen. Escucha las leyendas orales contadas por ancianos navegantes del río.',
 '["Transporte fluvial ida y vuelta", "Almuerzo típico en sancocho de pescado", "Chaleco salvavidas", "Guía interpretativo"]'::jsonb,
 'Navegantes Comunitarios del Orteguaza',
 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-07', 'Cascada Hornoyaco y Selva de Niebla', 'Mocoa (Putumayo)', 'Senderismo', 'Día completo', 110000.00, 'Español', 8,
 'Caminata entre la bruma amazónica hasta una impresionante caída de agua de más de 55 metros de altura.',
 'Cruza puentes colgantes de madera y asciende por senderos bordeados de orquídeas silvestres hasta la majestuosa Cascada Hornoyaco.',
 '["Ingreso a reserva natural", "Guía local de montaña", "Snack energético de frutos secos amazónicos"]'::jsonb,
 'Guardianes de la Montaña Mocoa',
 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-08', 'Ruta del Cacao Fino de Aroma y Chocolate Artesanal', 'Belén de los Andaquíes (Caquetá)', 'Gastronomía', 'Medio día', 75000.00, 'Español', 10,
 'Recorrido por parcelas agroforestales de cacao nativo y elaboración de bombones artesanales.',
 'Vive el proceso completo desde la recolección del fruto hasta el tostado, molienda y moldeado de tabletas de chocolate 100% orgánico.',
 '["Cata comentada de chocolates", "Muestra de mazorca de cacao fresco", "Taller interactivo de chocolatería"]'::jsonb,
 'Asociación Agrocacaotera de Belén',
 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-09', 'Taller de Cerámica Ancestral Coreguaje', 'Solano (Caquetá)', 'Artesanías', 'Medio día', 65000.00, 'Español', 8,
 'Moldeo de vasijas tradicionales con arcilla natural teñida con cenizas vegetales sagradas.',
 'Las maestras alfareras del pueblo Coreguaje comparten el arte de amasar la tierra amazónica y moldear vasijas ritulales con acabados naturales.',
 '["Bloque de arcilla y herramientas artesanas", "Cocción tradicional en leña", "Refrigerio de chicha de chontaduro"]'::jsonb,
 'Cabildo Coreguaje de Solano',
 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-10', 'Noche de Fotografía Nocturna y Herpetología', 'Orito (Putumayo)', 'Fotografía', '1-3 horas', 105000.00, 'Inglés', 5,
 'Exploración nocturna en busca de ranas dardo de colores vibrantes e insectos luminiscentes.',
 'Adéntrate en la selva al caer la noche acompañado por biólogos locales y fotógrafos de naturaleza para capturar la vida silvestre nocturna.',
 '["Lámpara frontal de alta potencia", "Asesoría fotográfica en campo", "Seguro médico de actividad nocturna"]'::jsonb,
 'BioFotógrafos del Putumayo',
 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-11', 'Tubing Comunitario por el Río Pescado', 'Belén de los Andaquíes (Caquetá)', 'Ecoturismo', 'Medio día', 80000.00, 'Español', 12,
 'Descenso relajante en neumático flotante apreciando la vegetación de ribera y playas fluviales.',
 'Déjate llevar por las aguas mansas del Río Pescado contemplando monos aulladores en las copas de los árboles y paisajes de piedra pulida.',
 '["Alquiler de neumático y casco", "Chaleco salvavidas normado", "Acompañamiento de socorrista acuático local"]'::jsonb,
 'Ecotubing Belén',
 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-12', 'Saberes del Café de Altura y Selva', 'Santiago (Putumayo)', 'Gastronomía', 'Medio día', 70000.00, 'Español', 10,
 'Cata de café especial cultivado bajo sombra de árboles amazónicos en el Valle de Sibundoy.',
 'Conoce a las familias caficultoras que protegen el agua y la biodiversidad mientras cosechan granos arábigos con notas de miel y frutos rojos.',
 '["Cata guiada de 3 métodos de filtrado", "Bolsa de café en grano de regalo", "Recorrido por el cafetal"]'::jsonb,
 'Caficultores Sostenibles de Santiago',
 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-13', 'Avistamiento de Toninas y Delfines Rosados', 'Puerto Leguízamo (Putumayo)', 'Avistamiento de Aves', 'Día completo', 180000.00, 'Inglés', 8,
 'Expedición en embarcación de bajo impacto hacia la confluencia de los ríos Putumayo y Caquetá.',
 'Observa de cerca a los míticos delfines rosados y grises en su ecosistema natural preservado por las comunidades ribereñas.',
 '["Navegación guiada", "Almuerzo a bordo en hojas de plátano", "Hidratación constante", "Permiso de parque natural"]'::jsonb,
 'Guardianes del Agua Leguízamo',
 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-14', 'Máscaras del Carnaval del Perdón y Talla en Madera', 'Sibundoy (Putumayo)', 'Artesanías', 'Medio día', 90000.00, 'Lengua Kamëntsá', 6,
 'Taller artesanal de esculpido de máscaras ceremoniales de sauce con maestros talladores.',
 'Cada máscara Kamëntsá expresa una emoción o mito del Carnaval del Perdón (Clestrinÿë). Aprende las técnicas de grabado y pulido tradicional.',
 '["Bloque de madera de sauce", "Uso de gubias y herramientas", "Muestra de máscara tallada para llevar"]'::jsonb,
 'Taller de Arte Kamëntsá',
 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-15', 'Reserva Natural El Hacha y Rastreo de Fauna', 'San Vicente del Caguán (Caquetá)', 'Ecoturismo', '2+ días', 220000.00, 'Español', 6,
 'Camping ecológico y cámaras trampa para el avistamiento de dantas, osos de anteojos y tigrillos.',
 'Inmersión profunda en la reserva campesina El Hacha. Revisa huellas de fauna silvestre e instala cámaras trampa nocturnas.',
 '["Carpas y equipo de camping", "Alimentación completa campesina", "Guía biólogo y baquiano de la zona"]'::jsonb,
 'Reserva Campesina El Hacha',
 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-16', 'Cascada La Paja y Baño de Energetización Inga', 'Mocoa (Putumayo)', 'Senderismo', 'Medio día', 65000.00, 'Lengua Inga', 10,
 'Caminata corta por riachuelos helados finalizando con una limpia herbal Inga junto a la cascada.',
 'Renueva tus energías sumergiéndote en las frías aguas de La Paja tras una ceremonia de sahumerio con resinas silvestres de copal.',
 '["Ceremonia de sahumerio herbal", "Guianza nativa Inga", "Té caliente de jengibre y panela"]'::jsonb,
 'Comunidad Inga Rumipamba',
 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-17', 'Ruta del Sacha Inchi y Cosmética Amazónica', 'Morelia (Caquetá)', 'Gastronomía', '1-3 horas', 60000.00, 'Español', 12,
 'Extracción en frío del aceite de la nuez del inca y elaboración de bálsamos corporales naturales.',
 'Descubre los superalimentos de la selva. Prensa semillas de Sacha Inchi ricas en Omega 3, 6 y 9 y prepara cremas hidratantes artesanales.',
 '["Frasco de aceite prensado en vivo", "Demostración de prensado hidráulico", "Degustación de nueces tostadas"]'::jsonb,
 'Productoras Agroecológicas de Morelia',
 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-18', 'Safari Fotográfico en la Laguna del Chairá', 'Cartagena del Chairá (Caquetá)', 'Fotografía', 'Día completo', 160000.00, 'Español', 8,
 'Recorrido en bote al amanecer para fotografiar reflejos de la selva y garzas reales en la quietud del agua.',
 'Un paraíso acuático en el corazón del Caquetá. Captura reflejos espejo del cielo y la selva densa mientras navegas entre lirios de agua.',
 '["Bote con motor ecológico silencioso", "Guía fotográfico de naturaleza", "Desayuno campesino a la orilla de la laguna"]'::jsonb,
 'Ecoproyecto Laguna del Chairá',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-19', 'Taller de Instrumentos Musicales de Bambú y Caña', 'San Francisco (Putumayo)', 'Artesanías', 'Medio día', 75000.00, 'Español', 8,
 'Construcción y afinación de flautas traversas y zampoñas de bambú silvestre.',
 'Fabrica tu propio instrumento musical andino-amazónico partiendo de varas de bambú seco cosechado en menguante según el calendario lunar.',
 '["Varas de bambú e insumos de afinación", "Instrucción básica de ejecución musical", "Instrumento afinado listo"]'::jsonb,
 'Músicos del Valle del Guamuéz',
 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-20', 'Petroglifos de El Encano y Senderismo de la Memoria', 'Albania (Caquetá)', 'Senderismo', 'Medio día', 85000.00, 'Español', 10,
 'Caminata hacia piedras talladas precolombinas rodeadas de campos de regeneración forestal.',
 'Descifra los jeroglíficos y figuras antropomorfas grabadas sobre rocas volcánicas por comunidades milenarias que habitaron el piedemonte.',
 '["Ingreso al sitio arqueológico", "Guía historiador comunitario", "Cartilla ilustrada de petroglifos"]'::jsonb,
 'Asociación Arqueológica de Albania',
 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-21', 'Experiencia Agroecológica y Chagra Biodiversa', 'Puerto Asís (Putumayo)', 'Gastronomía', 'Medio día', 70000.00, 'Español', 10,
 'Cosecha de yuca, chontaduro y piña amazónica seguida de un banquete campesino sin químicos.',
 'Camina por chagras diversificadas donde conviven más de 30 especies de tubérculos, frutas y hortalizas nativas cultivadas sin agroquímicos.',
 '["Cosecha directa de alimentos", "Almuerzo comunitario de la chagra", "Semillas orgánicas para llevar"]'::jsonb,
 'Red Agroecológica de Puerto Asís',
 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-22', 'Avistamiento de Primates y Mariposas Amazónicas', 'Puerto Rico (Caquetá)', 'Avistamiento de Aves', '1-3 horas', 85000.00, 'Inglés', 8,
 'Senderismo suave observando titís de manos amarillas y mariposas Morpho azules.',
 'Visita el mariposario vivo comunitario y recorre senderos arbolados donde habitan pequeñas tropas de monos tití muy curiosos.',
 '["Ingreso al mariposario", "Guía de campo ilustrada de mariposas", "Jugo natural de arazá"]'::jsonb,
 'Asociación Biológica Puerto Rico',
 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-23', 'Expedición al Salto de la India y Cuevas Sagradas', 'Curillo (Caquetá)', 'Senderismo', 'Día completo', 130000.00, 'Español', 8,
 'Caminata de aventura atravesando pequeñas cavernas kársticas y bañales subterráneos.',
 'Una travesía para amantes de la aventura. Explora grutas talladas por corrientes de agua subterráneas y desemboca en una poza esmeralda.',
 '["Casco de montaña con linterna", "Guía especialista en espeleología", "Almuerzo de campamento"]'::jsonb,
 'EspeleoTurismo Curillo',
 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
 'aprobada', 'usr-2'),

('exp-24', 'Recorrido Botánico de Orquídeas y Bromelias', 'Mocoa (Putumayo)', 'Ecoturismo', 'Medio día', 75000.00, 'Español', 10,
 'Visita guiada al jardín etnobotánico comunitario con más de 120 especies de orquídeas autóctonas.',
 'Aprende la clasificación, simbiosis y conservación de las orquídeas epífitas de la Amazonía en un santuario botánico liderado por jóvenes locales.',
 '["Entrada al jardín botánico", "Lupa de campo para detalles de flores", "Folleto explicativo de especies"]'::jsonb,
 'Jardín Botánico del Piedemonte',
 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1000&q=80',
 'pendiente', 'usr-2'),

('exp-25', 'Taller de Mermeladas Amazónicas de Arazá y Copoazú', 'Florencia (Caquetá)', 'Gastronomía', '1-3 horas', 55000.00, 'Español', 12,
 'Transformación artesanal de pulpas de frutas exóticas en mermeladas y jaleas naturales.',
 'Descubre los exóticos sabores del Arazá, Copoazú y Camu Camu. Prepara conservas bajas en azúcar con pulpas cosechadas por campesinos locales.',
 '["Frasco de mermelada recién hecha para llevar", "Recetario impreso", "Degustación con galletas artesanales"]'::jsonb,
 'Mujeres Transformadoras del Caquetá',
 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?auto=format&fit=crop&w=1000&q=80',
 'pendiente', 'usr-2')
ON CONFLICT (id) DO NOTHING;

-- 3. Trazabilidad Inicial en Bitácora (RNF-010)
INSERT INTO bitacora (id, timestamp, entity_id, entity_type, user_identifier, action, details)
VALUES 
('log-01', CURRENT_TIMESTAMP, 'exp-01', 'Experiencia', 'Sistema / Seed', 'INICIALIZACION_SISTEMA', 'Semilla de datos cargada exitosamente con 25 experiencias del Piedemonte Amazónico (Caquetá y Putumayo).')
ON CONFLICT (id) DO NOTHING;
