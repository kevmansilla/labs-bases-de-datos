/*comandos previos
    docker ps -a
    docker start mongo-labs
    docker exec -it mongo-labs bash
    mongosh
    show dbs
    use mflix

    cargar datos
    mongorestore --drop --gzip --db mflix mflix/

    cargar docker
    docker run --name mongo-labs -v /home/kevin/MEGA/bd/mongo:/bd -w /bd -d mongo:5
*/


/*  1
    Inserta 5 nuevos usuarios en la colección users
*/

db.users.insertMany([
    {
        'name': 'user1',
        'email': 'user1@gmail.com',
        'password': '$2b$12$URuser1qGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
    },
    {
        'name': 'user2',
        'email': 'user2@gmail.com',
        'password': '$2b$12$URuser1qGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
    },
    {
        'name': 'user3',
        'email': 'user3@gmail.com',
        'password': '$2b$12$URuser1qGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
    },
    {
        'name': 'user4',
        'email': 'user4@gmail.com',
        'password': '$2b$12$URuser1qGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
    },
    {
        'name': 'user5',
        'email': 'user5@gmail.com',
        'password': '$2b$12$URuser1qGNK0LzO0HM/jLhgUCNNIJ9RJAqMUQ74crlJ1Vu'
    },
])

//insertar comentarios en la colección comments
db.comments.insertMany([
    {
        "name" : "user1",
        "email" : "user1@gmail.com",
        "movie_id" : ObjectId("573a1390f29313caabcd418c"),
        "text" : "Muy buena! 1",
        "date" : new Date(),
    },
    {
        "name" : "user2",
        "email" : "user2@gmail.com",
        "movie_id" : ObjectId("573a1390f29313caabcd418c"),
        "text" : "Muy buena! 2",
        "date" : new Date()
    },
    {
        "name" : "user3",
        "email" : "user3@gmail.com",
        "movie_id" : ObjectId("573a1390f29313caabcd418c"),
        "text" : "Muy buena! 3",
        "date" : new Date()
    },
    {
        "name" : "user4",
        "email" : "user4@gmail.com",
        "movie_id" : ObjectId("573a1390f29313caabcd418c"),
        "text" : "Muy buena! 4",
        "date" : new Date(),
    },
    {
        "name" : "user5",
        "email" : "user5gmail.com",
        "movie_id" : ObjectId("573a1390f29313caabcd418c"),
        "text" : "Muy buena! 5",
        "date" : new Date(),
    }
])

/*  2
    Listar el título, año, actores(cast), directores y rating de las 10 películas 
    con mayorrating(“imdb.rating”) de la década del 90. ¿Cuál es el valor del 
    rating de la película que tiene mayor rating ? (Hint: Chequear que el valor 
    de “imdb.rating” sea de tipo “double”).
*/

db.movies.find(
    {
        "imdb.rating": { $type: "double" },
        "year": { $gte: 1990, $lt: 2000 }
    },
    {
        "title": 1,
        "year": 1,
        "cast": 1,
        "directors": 1,
        "imdb.rating": 1
    }
).sort({ "imdb.rating": -1 }).limit(10)

/*  3
    Listar el nombre, email, texto y fecha de los comentarios que la película con id
    (movie_id) ObjectId("573a1399f29313caabcee886") recibió entre los años 2014 y 2016
    inclusive. Listar ordenados por fecha. Escribir una nueva consulta (modificando la
    anterior) para responder ¿Cuántos comentarios recibió?
*/

db.comments.find(
    {
        'movie_id': ObjectId('573a1399f29313caabcee886'),
        'date': { $gte: new Date('2014-01-01'), $lt: new Date('2016-12-31') }
    },
    {
        'name': 1,
        'email': 1,
        'text': 1,
        'date': 1
    }
).sort({ 'date': 1 })

db.comments.find(
    {
        'movie_id': ObjectId("573a1399f29313caabcee886"),
        'date': { $gte: new Date('2014-01-01'), $lt: new Date('2016-12-31') }
    },
    {
        'name': 1,
        'email': 1,
        'text': 1,
        'date': 1
    }
).sort({ 'date': 1 }).count()

/*  4
    Listar el nombre, id de la película, texto y fecha de los 3 comentarios 
    más recientes realizados por el usuario con 
    email patricia_good @fakegmail.com.
*/

db.comments.find(
    {
        'email': 'patricia_good@fakegmail.com',
        'date': { $gte: new Date('2014-01-01'), $lt: new Date('2016-12-31') }
    },
    {
        name: 1,
        movie_id: 1,
        text: 1,
        date: 1
    }
).sort({ 'date': -1 }).limit(3)

/*  5
    Listar el título, idiomas(languages), géneros, fecha de lanzamiento(released) 
    y número de votos(“imdb.votes”) de las películas de géneros Drama y Action
    (la película puede tener otros géneros adicionales), que solo están 
    disponibles en un único idioma y por último tengan un rating(“imdb.rating”) 
    mayor a 9 o bien tengan una duración(runtime) de al menos 180 minutos. 
    Listar ordenados por fecha de lanzamiento y número de votos.
*/

db.movies.find(
    {
        genres: { $all: ['Drama', 'Action'] },
        languages: { $size: 1 },
        $or: [{ 'imdb.rating': { $gt: 9 } }, { runtime: { $gte: 180 } }]
    },
    {
        title: 1,
        languages: 1,
        genres: 1,
        released: 1,
        'imdb.votes': 1
    }
).sort({ released: -1, 'imdb.votes': 1 })

/*  6
    Listar el id del teatro (theaterId), estado (“location.address.state”), ciudad
    (“location.address.city”), y coordenadas(“location.geo.coordinates”) de los 
    teatros que se encuentran en algunos de los estados "CA", "NY", "TX" y el 
    nombre de la ciudades comienza con una ‘F’. Listar ordenados por estado 
    y ciudad.
*/

db.theaters.find(
    {
        'location.address.state': { $in: ['CA', 'NY', 'TX'] },
        'location.address.city': /^F/
    },
    {
        theaterId: 1,
        'location.address.state': 1,
        'location.address.city': 1,
        'location.geo.coordinates': 1
    }
).sort({ 'location.address.state': 1, 'location.address.city': 1 })

/*  7
    Actualizar los valores de los campos texto(text) y fecha(date) del 
    comentario cuyo id es ObjectId("5b72236520a3277c015b3b73") a
    "mi mejor comentario" y fecha actual respectivamente.
*/

db.comments.updateOne(
    {
        _id: ObjectId('5b72236520a3277c015b3b73')
    },
    {
        $set: { text: 'mi mejor comentario ' },
        $currentDate: { date: true }
    }
)

/*  8
    Actualizar el valor de la contraseña del usuario cuyo email es
    joel.macdonel@fakegmail.com a "some password". La misma consulta debe poder
    insertar un nuevo usuario en caso que el usuario no exista.Ejecute la 
    consulta dos veces. ¿Qué operación se realiza en cada caso? (Hint: usar upserts).
*/

db.users.updateOne(
    {
        email: 'joel.macdonel@fakegmail.com'
    },
    {
        $set: { password: 'some password' },
        $currentDate: { date: true }
    },
    {
        upsert: true
    }
)

/*  9
    Remover todos los comentarios realizados por el usuario cuyo email es
    victor_patel@fakegmail.com durante el año 1980.
*/

db.comments.deleteMany(
    {
        email: 'victor_patel@fakegmail.com',
        date: { $gte: new Date('1980-01-01'), $lt: new Date('1980-12-31') }
    },
    {
        $currentDate: { date: true }
    }
)

/*Parte II (Restauranrd)
    cargar base
    mongoimport - d restaurantdb - c restaurants--drop--file restaurantdb / restaurants.json
*/

/*  10
    Listar el id del restaurante (restaurant_id) y las calificaciones de los restaurantes donde
    al menos una de sus calificaciones haya sido realizada entre 2014 y 2015 inclusive, y
    que tenga una puntuación (score) mayor a 70 y menor o igual a 90.
*/

db.restaurants.find(
    {
        grades: {
            $elemMatch: {
                date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-31') },
                score: { $gt: 70, $lte: 90 }
            }
        }
    },
    {
        restaurant_id: 1,
        grades: 1
    }
)

/*11
    Agregar dos nuevas calificaciones al restaurante cuyo id es "50018608". 
    A continuación se especifican las calificaciones a agregar en una 
    sola consulta.
*/

db.restaurants.updateOne(
    {
        restaurant_id: '50018608'
    },
    {
        $push: {
            grades: {
                $each: [
                    {
                        'date' : ISODate('2019-10-10T00:00:00Z'),
                        'grade' : 'A',
                        'score' : 18
                    },
                    {
                        'date' : ISODate('2020-02-25T00:00:00Z'),
                        'grade' : 'A',
                        'score' : 21
                    }
                ]
            }
        }
    }
)
