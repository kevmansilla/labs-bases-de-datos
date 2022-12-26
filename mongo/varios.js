/*Top 5 de los super anfitriones con mayor cantidad de alojamientos ofrecidos en 
USA. Listar el id y nombre del anfitrion junto con un arreglo de subdocumentos de 
id y nombre de sus alojamientos. Mostrar el resultado ordenados por cantidad de 
alojamientos ofrecidos y nombre del super anfitrion en orden alfabético*/

db.listingsAndReviews.aggregate([
  {
    $match: {
      "address.country_code": "US",
      "host.host_is_superhost": true
    }
  },
  {
    $group: {
      _id: "$host.host_id",
      host_name: { $first: "$host.host_name" },
      amount_listings: { $count: {} },
      listings: {
        $push: {
          listing_id: "$_id",
          listing_name: "$name"
        }
      }
    }
  },
  {
    $sort: {
      amount_listings: -1,
      host_name: 1
    }
  },
  {
    $limit: 5
  }
])


/*2 parcial 2021*/
db.listingsAndReviews.aggregate([ 
    {
      $unwind: "$reviews"
    },
    {
      $match: {
        "address.country":"United States",
        beds: 5,
        bedrooms: 3,
        "reviews.date":{$gte: ISODate("2018-11-01"), $lte: ISODate("2019-11-01")}
      }
    },
    {
      $group:     { 
                      _id: {
                      price: "$price",
                      name: "$name" },
                      reviews: {$addToSet: "$reviews"}
                  }
    },
    {
        $project: {
            reviews: 1,
            price: "$_id.price",
            name: "$_id.name",
            _id: 0
                  }
    },
    {
      $sort: {price:1} 
    }
  ])

/*
Listar el título, el precio, el desarrollador, y cantidad de minitos jugados de 
los 10 juegos que más se hayan jugado en las últimas 2 semanas considerando la 
totalidad de los minutos jugados por todos los usuarios
*/

