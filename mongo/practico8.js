/*  1
    Cantidad de cines (theaters) por estado.
*/

db.theaters.aggregate(
    {
        $group: {
            _id: '$location.address.state',
            count: { $sum: 1 }
        }
    }
)

/*  2
    Cantidad de estados con al menos dos cines (theaters) registrados
*/

db.theaters.aggregate(
    {
        $group: {
            _id: '$location.address.state',
            count: { $sum: 1 }
        },
    },
    {
        $match: {
            count: { $gte: 2 }
        }
    },
    {
        $count: 'amount_theathers'
    }
)

/*  3
    Cantidad de películas dirigidas por "Louis Lumière".Se puede responder sin 
    pipeline de agregación, realizar ambas queries.
*/

//sin pipeline
db.movies.countDocuments(
    {
        directors: 'Louis Lumière'
    }
)

//con pipeline
db.movies.aggregate(
    {
        $unwind: '$directors'
    },
    {
        $group: {
            _id: '$directors',
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            _id: 'Louis Lumière'
        }
    }
)

/*  4
    Cantidad de películas estrenadas en los años 50(desde 1950 hasta 1959). 
    Se puede responder sin pipeline de agregación, realizar ambas queries.
*/

//sin pipeline
db.movies.countDocuments(
    {
        year: { $gte: 1950, $lte: 1959 }
    }
)

//con pipeline
db.movies.aggregate(
    {
        $match: {
            year: { $gte: 1950, $lte: 1959 }
        }
    },
    {
        $count: 'amount_movies'
    }
)

/*  5
    Listar los 10 géneros con mayor cantidad de películas(tener en cuenta que 
    las películas pueden tener más de un género).Devolver el género y la cantidad 
    de películas.Hint: unwind puede ser de utilidad
*/

db.movies.aggregate(
    {
        $unwind: '$genres'
    },
    {
        $group: {
            _id: '$genres',
            count: { $sum: 1 }
        }
    },
    {
        $addFields: {
            genre: { $first: '$genres' }
        }
    },
    {
        $project: {
            _id: 0,
            count: 1,
            genre: '$_id'
        }
    },
    {
        $sort: {
            count: -1
        }
    },
    {
        $limit: 10
    }
)

/*  6
    Top 10 de usuarios con mayor cantidad de comentarios, mostrando
    Nombre, Email y Cantidad de Comentarios.
*/

db.comments.aggregate(
    {
        $group: {
        _id: { name: "$name",email: "$email" },
        count: {$sum: 1}
        }
    },
    {
        $project: {
            name: "$_id.name",
            email: "$_id.email",
            comment: 1,
            count: 1,
            _id: 0
        }
    },
    {
        $sort: {
            count: -1
        }
    },
    {
        $limit: 10
    }
)

/*  7
    Ratings de IMDB promedio, mínimo y máximo por año de las películas estrenadas 
    en los años 80 (desde 1980 hasta 1989), ordenados de mayor a menor por promedio 
    del año.
*/

db.movies.aggregate(
    {
        $match: {
            year: { $gte: 1980, $lte: 1989 }
        }
    },
    {
        $group: {
            _id: '$year',
            avg: { $avg: '$imdb.rating' },
            min: { $min: '$imdb.rating' },
            max: { $max: '$imdb.rating' }
        }
    },
    {
        $sort: {
            avg: -1
        }
    }
)

/*  8
    Título, año y cantidad de comentarios de las 10 películas con más comentarios.
*/

db.comments.aggregate(
    {
        $group: {
            _id: '$movie_id',
            count: { $sum: 1 }
        }
    },
    {
        $sort: { count: -1 }
    },
    {
        $limit: 10
    },
    {
        $lookup: {
            from: 'movies',
            localField: '_id',
            foreignField: '_id',
            as: 'movie'
        }
    },
    {
        $addFields: {
            movie: { $first: '$movie' }
        }
    },
    {
        $project: {
            title: '$movie.title',
            year: '$movie.year',
            count: 1,
            _id: 0
        }
    }
)


/*  9
    Crear una vista con los 5 géneros con mayor cantidad de comentarios, junto con la
    cantidad de comentarios
*/

pipeline = [
    {
        $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'movie_id',
            as: 'comments'
        }
    },
    {
        $match: {
            $expr: {
                $gt: [ { $size: '$comments' }, 0 ]
            }
        }
    },
    {
        $project: {
            genres: 1,
            comments_count: { $size: '$comments' },
            _id: 0
        }
    },
    {
        $unwind: '$genres'
    },
    {
        $group: {
            _id: '$genres',
            comment_total_count : { $sum: '$comments_count' }
        }
    },
    {
        $sort: { comment_total_count: -1 }
    },
    {
        $limit: 5
    },
    {
        $project: { _id: 0, genre: '$_id', comment_total_count: 1 }
    }
]

db.createView('top5_genres', 'movies', pipeline)
db.top5_genres.find({}).pretty()

/*10
    Listar los actores(cast) que trabajaron en 2 o más películas dirigidas por
    "Jules Bass".Devolver el nombre de estos actores junto con la lista de
    películas(solo título y año) dirigidas por “Jules Bass” en las que trabajaron.
        a. Hint1: addToSet
        b. Hint2: {'name.2': {$exists: true}} permite filtrar arrays con al menos 2
            elementos, entender por qué.
        c. Hint3: Puede que tu solución no use Hint1 ni Hint2 e igualmente sea correcta
*/

db.movies.aggregate(
    {
        $match: {
            directors: 'Jules Bass'
        }
    },
    {
        $unwind: '$cast'
    },
    {
        $group: {
            _id: '$cast',
            movies: { $addToSet: { title: '$title', year: '$year' } }
        }
    },
    {
        $match: {
            $expr: { $gte: [{ $size: "$movies" }, 2 ]}
        }
    },
    {
        $project: {
            _id: 0,
            actor: '$_id',
            movies: 1
        }
    }
)

/*  11
    Listar los usuarios que realizaron comentarios durante el mismo mes de 
    lanzamiento de la película comentada, mostrando Nombre, Email, fecha del 
    comentario, título de la película, fecha de lanzamiento. 
    HINT: usar $lookup con multiple condiciones
*/
db.comments.aggregate([ 
    { 
        $lookup: { 
            from: 'movies', 
            localField: 'movie_id', 
            foreignField: '_id', 
            let: { comment_date: "$date" }, 
        pipeline: [ 
            { $match: {'released': {$exists: true}}}, 
            { $match: { $expr: { $eq: [{ $month: "$$comment_date" }, { $month: "$released" }]}}}, 
            { $project: { _id: 1, released: 1, title: 1 } } 
            ], 
        as: "moviedata" 
        }
    },
    {
        $unwind: '$moviedata' 
    },
    {
        $project: {
            name: 1,
            email: 1,
            date: 1,
            movie_date: '$moviedata.released',
            movie_title: '$moviedata.title',
            _id: 0
        } 
    }
])

// db.comment.aggregate(
//     [
//         $lookup: {
//             from: 'movies',
//             let: { movie_id: '$movie_id', comment_date: '$date' },
//             pipeline: [{
//                 $match: {
//                     $expr: {
//                         $and: [
//                             { $eq: ['$$movie_id', '$_id'] },
//                             { $eq: [{ $year: '$$comment_date' }, { $year: '$released' }] },
//                             { $eq: [{ $month: '$$comment_date' }, { $month: '$released' }] }
//                         ]
//                     }
//                 }
//             }],
//             as: 'movies'
//         }
//     },
//     {
//         $match: {
//             $expr: {
//                 $gt: [ { $size: '$movies' }, 0 ]
//             }
//         }
//     },
//     {
//         $addFields: {
//             movie: { $first: '$movies' }
//         }
//     },
//     {
//         $project: {
//             name: 1,
//             email: 1,
//             date: 1,
//             movie_title: '$movie.title',
//             movie_date: '$movie.released',
//             _id: 0
//         }
//     }
//     ]
// )

/*  12
    Listar el id y nombre de los restaurantes junto con su puntuación máxima, mínima y
    total. Se puede asumir que el restaurant_id es único.
        a.Resolver con $group y accumulators.
        b.Resolver con expresiones sobre arreglos (por ejemplo, $sum) pero sin 
            $group.
        c.Resolver como en el punto b) pero usar $reduce para calcular la puntuación
            total.
        d.Resolver con find.
*/

db.restaurants.aggregate([
    {
        $group: {
            _id: '$restaurant_id',
            name: { $first: '$name' },
            max_score: { $max: '$grades.score' },
            min_score: { $min: '$grades.score' },
            total_score: { $sum: '$grades.score' }
        }
    },
    {
        $project: {
            _id: 0,
            restaurant_id: '$_id',
            name: 1,
            max_score: 1,
            min_score: 1,
            total_score: 1
        }
    }
])

db.restaurants.aggregate([
    {
        $project: {
            restaurant_id: 1,
            name: 1,
            max_score: { $max: "$grades.score" },
            min_score: { $min: "$grades.score" },
            total_score: { $sum: "$grades.score" }
        }
    }
])

db.restaurants.aggregate([
    {
        $project: {
            restaurant_id: 1,
            name: 1,
            max_score: { $max: "$grades.score" },
            min_score: { $min: "$grades.score" },
            total_score: {
                $reduce: {
                    input: "$grades.score",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this"] }
                }
            }
        }
    }
])

db.restaurants.find(
    { },
    {
        restaurant_id: 1,
        name: 1,
        max_score: { $max: "$grades.score" },
        min_score: { $min: "$grades.score" },
        total_score: {
            $reduce: {
                input: "$grades.score",
                initialValue: 0,
                in: { $add: ["$$value", "$$this"] }
            }
        }
    }
)

/*  13
    Actualizar los datos de los restaurantes añadiendo dos campos nuevos.
        a."average_score": con la puntuación promedio
        b."grade": con "A" si "average_score" está entre 0 y 13,
            con "B" si "average_score" está entre 14 y 27
            con "C" si "average_score" es mayor o igual a 28
    Se debe actualizar con una sola query.
        a.HINT1. Se puede usar pipeline de agregación con la operación update
        b.HINT2. El operador $switch o $cond pueden ser de ayuda.
*/

db.restaurants.updateMany(
    {},
    [
        {
            $addFields: {
                average_score: { $avg: '$grades.score' },
                grade: {
                    $switch: {
                        branches: [
                            { case: { $and: [{ $gte: ['$average_score', 0] }, { $lte: ['$average_score', 13] }] }, then: 'A' },
                            { case: { $and: [{ $gte: ['$average_score', 14] }, { $lte: ['$average_score', 27] }] }, then: 'B' },
                            { case: { $gte: ['$average_score', 28] }, then: 'C' }
                        ],
                        default: 'N/A'
                    }
                }
            }
        }
    ]
)