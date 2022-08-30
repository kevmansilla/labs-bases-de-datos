USE world;

-- Consultas - Parte II
-- Devuelva una lista de los nombres y las regiones a las que pertenece cada país ordenada alfabéticamente.

select Name, Region from country order by Name;

-- Liste el nombre y la población de las 10 ciudades más pobladas del mundo.

select Name, Population from city order by Population limit 10;

-- Liste el nombre, región, superficie y forma de gobierno de los 10 países con menor superficie.

select Name, Region, SurfaceArea, GovernmentForm from country order by SurfaceArea asc limit 10;

-- Liste todos los países que no tienen independencia (hint: ver que define la independencia de un país en la BD).

select Name from country where IndepYear is NULL;

-- Liste el nombre y el porcentaje de hablantes que tienen todos los idiomas declarados oficiales.

select Language, Percentage from countrylanguage where IsOfficial = 'T';

-- Actualizar el valor de porcentaje del idioma inglés en el país con código 'AIA' a 100.0

update countrylanguage set Percentage = 100.0 where CountryCode = 'AIA';

-- Listar las ciudades que pertenecen a Córdoba (District) dentro de Argentina.

select Name from city where District = 'Córdoba' and CountryCode  = 'ARG';

-- Eliminar todas las ciudades que pertenezcan a Córdoba fuera de Argentina.

delete from city where not(CountryCode = 'ARG') and District = 'Córdoba';;

select Name from city where CountryCode  = 'ARG';

-- Listar los países cuyo Jefe de Estado se llame John.
select Name from country where HeadOfState like 'John%';

-- Listar los países cuya población esté entre 35 M y 45 M ordenados por población de forma descendente.
select Name from country where Population between 35000000 and 45000000 order by Population desc;

