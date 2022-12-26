--- Practico III
-- Parte I: Consultas

USE world;

-- Lista el nombre de la ciudad, nombre del país, región y forma de gobierno 
-- de las 10 ciudades más pobladas del mundo

SELECT 
    city.Name, country .Name,
    country.Region, country.GovernmentForm
FROM
    country JOIN
    city ON city.CountryCode = country.Code
ORDER BY city.Population DESC
LIMIT 10;

-- Listar los 10 países con menor población del mundo, junto a sus ciudades capitales
-- (Hint: puede que uno de estos países no tenga ciudad capital asignada, en este caso
-- deberá mostrar "NULL").

SELECT 
    country.Name, city.Name
FROM
    city INNER JOIN
    country ON city.id = country.capital
ORDER BY country.population ASC
LIMIT 10;

-- Listar el nombre, continente y todos los lenguajes oficiales de cada país. (Hint: habrá
-- más de una fila por país si tiene varios idiomas oficiales).

SELECT
	country.Continent, country.Name, countrylanguage.Language
FROM 
	country INNER JOIN
	countrylanguage ON countrylanguage.CountryCode = country.Code;

-- Listar el nombre del país y nombre de capital, de los 20 países con mayor superficie
-- del mundo

SELECT 
    country.Name, city.Name
FROM
    country
        JOIN
    city ON country.Capital = city.ID
ORDER BY country.SurfaceArea DESC
LIMIT 20;

-- Listar las ciudades junto a sus idiomas oficiales (ordenado por la población de la
-- ciudad) y el porcentaje de hablantes del idioma.

SELECT 
    city.Name, countrylanguage.Language, countrylanguage.Percentage
FROM
    city INNER JOIN
    countrylanguage ON countrylanguage.CountryCode = city.CountryCode
WHERE
    countrylanguage.IsOfficial = 'T'
ORDER BY city.Population DESC;

-- Listar los 10 países con mayor población y los 10 países con menor población (que
-- tengan al menos 100 habitantes) en la misma consulta.

(SELECT
	country.Name, country.Population
FROM
	country
ORDER BY country.Population DESC LIMIT 10) UNION (SELECT
	country.Name, country.Population
FROM
	country
ORDER BY country.Population ASC 
LIMIT 10);

-- Listar aquellos países cuyos lenguajes oficiales son el Inglés y el Francés (hint: no
-- debería haber filas duplicadas). ---falta chequear de acá par abajo

SELECT 
    co.Name
FROM
    country AS co
        INNER JOIN
    countrylanguage AS cl ON cl.CountryCode = co.Code
WHERE
    cl.IsOfficial = 'T'
        AND cl.Language = 'English'
        AND EXISTS( SELECT 
            cl2.Language
        FROM
            countrylanguage AS cl2
        WHERE
            cl.countrycode = cl2.countrycode
                AND cl2.IsOfficial = 'T'
                AND cl2.Language = 'French');

-- Listar aquellos países que tengan hablantes del Inglés pero no del Español en su
-- población.

SELECT 
    co.Name
FROM
    country co
        INNER JOIN
    countrylanguage cl ON cl.CountryCode = co.Code
WHERE
    cl.Language = 'English'
        AND NOT EXISTS( SELECT 
            cl2.Language
        FROM
            countrylanguage AS cl2
        WHERE
            cl.countrycode = cl2.countrycode
                AND (cl2.Language = 'Spanish'));

-- Parte II: Preguntas

-- ¿Devuelven los mismos valores las siguientes consultas? ¿Por qué?

SELECT city.Name, country.Name
FROM city
INNER JOIN country ON city.CountryCode = country.Code AND country.Name =
'Argentina';
SELECT city.Name, country.Name
FROM city
INNER JOIN country ON city.CountryCode = country.Code
WHERE country.Name = 'Argentina';
               
-- Si, devuelven lo mismo la intersección del INNER JOIN las restricción que pide la querie
-- se aplica sobre la intersección de la tabla. Pero la consulta se hace en distinto orden
               
               
-- ¿Y si en vez de INNER JOIN fuera un LEFT JOIN?

SELECT city.Name, country.Name
FROM city
LEFT JOIN country ON city.CountryCode = country.Code AND country.Name =
'Argentina';
 
-- Primero se hace el join y luego se aplican las restricciones quedan valores con NULL.
  
SELECT city.Name, country.Name
FROM city
LEFT JOIN country ON city.CountryCode = country.Code
WHERE country.Name = 'Argentina';

-- Primero se aplican las restricciones y luego se hace el JOIN. Entonces se puede
-- decir que no dan lo mismo.
