
UPDATE public.schedules SET time_label = '6:00 PM' WHERE id = '0e3ad06e-52f9-4060-bed5-320cb1951232';
UPDATE public.schedules SET time_label = '8:00 AM y 6:00 PM' WHERE id = 'f0332ac5-ff96-44b7-addf-81608e8ba1fc';
UPDATE public.schedules SET day_label = 'Primer Viernes de cada mes' WHERE id = '12a32040-d83a-4432-a1db-0770559d951c';

INSERT INTO public.ministries (name, description, leader) VALUES
('Señor de los Milagros', 'Hermandad dedicada a la devoción al Señor de los Milagros.', 'Coordinador: Ernesto'),
('Virgen Dolorosa', 'Hermandad de Nuestra Señora de los Dolores, patrona de la parroquia.', 'Coordinador: Luis'),
('Oración de María', 'Grupo de oración mariana al servicio de la comunidad.', 'Coordinadora: María'),
('Acólitos', 'Servidores del altar que acompañan al sacerdote en las celebraciones litúrgicas.', 'Encargados: Rosita y Hilario (sacristán)');
