-- Grupos y ministerios de las capillas filiales de la parroquia.

-- Capilla María de la Merced
INSERT INTO public.ministries (name, description, leader, location) VALUES
('Catequistas — Jóvenes con Cristo', 'Grupo de catequesis para la formación cristiana de niños y jóvenes de la capilla.', 'Hna. Milagros', 'Capilla María de la Merced'),
('Coro — Sangre Viva', 'Coro parroquial que anima musicalmente las celebraciones litúrgicas de la capilla.', 'Hno. Wilmer', 'Capilla María de la Merced'),
('Coro — Talita Kumy', 'Coro parroquial dedicado al canto litúrgico en las misas de la capilla.', 'Hno. Daniel', 'Capilla María de la Merced');

-- Capilla Virgen del Carmen
INSERT INTO public.ministries (name, description, leader, location) VALUES
('Hermandad del Señor de los Milagros', 'Hermandad dedicada a la devoción al Señor de los Milagros en la Capilla Virgen del Carmen.', 'Hno. Ernesto', 'Capilla Virgen del Carmen'),
('Cofradía Virgen del Carmen', 'Cofradía mariana dedicada a la devoción de la Virgen del Carmen.', 'Hna. Sara', 'Capilla Virgen del Carmen');

-- Capilla Virgen de Fátima (sin grupo con nombre propio; se registra la coordinación general de la capilla)
INSERT INTO public.ministries (name, description, leader, location) VALUES
('Comunidad Parroquial — Capilla Virgen de Fátima', 'Comunidad de fieles que anima la vida pastoral de la Capilla Virgen de Fátima.', 'Hno. Gilvert', 'Capilla Virgen de Fátima');
