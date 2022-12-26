/*
  Tested on MongoDB versions: 
    - 4.4 (version of the instance on the Virtual Machine)
    - 5.0
    - 6.0
 */

/*
1. Buscar los clientes que no tengan el campo active y que o bien posean más de 4 cuentas 
   o bien nacieron entre Abril de 1995 y Marzo de 1997 inclusives. Listar el nombre, email, 
   fecha de nacimiento y cantidad de cuentas. Limitar el resultado a los 50 primeros clientes 
   de acuerdo al orden alfabético.
 */

db.customers.find(
  {
    active: { $exists: false },
    $or: [
      { $expr: { $gt: [ { $size: "$accounts" }, 4 ] } },
      { birthdate: { $gte: ISODate('1995-04-01'), $lte: ISODate('1997-03-31') } }
    ]
  },
  {
    name: 1,
    email: 1,
    birthdate: 1,
    account_count: { $size: "$accounts" },
    _id: 0
  }
).sort( { name: 1 } ).limit(50)

/*
2. Actualizar las cuentas que tengan un limite entre 8000 y 9000 inclusives, 
   agregando un nuevo campo "class" con el valor "A" si la cuenta tiene hasta dos productos y 
   con el valor "B" si tiene 3 o más productos.
 */

db.accounts.updateMany(
  {
    limit: { $gte: 8000, $lte: 9000 }
  },
  [
    {
      $set: {
        class: { 
          $switch: {
            branches: [
              { case: { $lte: [ { $size: "$products" }, 2 ] }, then: "A" },
              { case: { $gte: [ { $size: "$products" }, 3 ] }, then: "B" }
            ]
          } 
        } 
      }
    }
  ]
)

/*
3. Buscar las transacciones donde la cantidad de transacciones sea mayor a 94. 
   Listar id de transacción, id de la cuenta, y solo aquellas transacciones que tengan el código 
   de transacción igual a "buy" y con "total" mayor a 500000.
   Mostrar el resultado ordenados por el id de la cuenta en orden decreciente.
   HINTS: (i) El operador $filter puede ser de utilidad. (ii) Notar que total está en string y requiere conversión.
 */

db.transactions.find(
  {
    transaction_count: { $gt: 94 }
  },
  {
    account_id: 1,
    buy_transactions: {
      $filter: {
        input: "$transactions",
        as: "transaction",
        cond: {
          $and: [
            { $eq: [ "$$transaction.transaction_code", "buy" ] },
            { $gt: [ { $toDouble: "$$transaction.total" }, 500000 ] } 
          ]
        }
      }
    }
  }
).sort( { account_id: -1 } )

/*
4. Crear la vista "transactionCountByCode" que lista el id de transacción, id de la cuenta, 
   cantidad de transacciones, cantidad de transacciones de compra (transacciones con transaction_code igual a buy) 
   y cantidad de transacciones de venta (transacciones con transaction_code igual a sell). 
   Listar el resultado ordenados por cantidad de transacciones (orden decreciente).
 */

pipeline = [
  {
    $project: {
      account_id: 1,
      transaction_count: 1,
      buy_transaction_count: {
        $size: { 
          $filter: {
            input: "$transactions",
            as: "transaction",
            cond: {
              $eq: [ "$$transaction.transaction_code", "buy" ]  
            }
          }
        }
      },
      sell_transaction_count: {
        $size: { 
          $filter: {
            input: "$transactions",
            as: "transaction",
            cond: {
              $eq: [ "$$transaction.transaction_code", "sell" ]  
            }
          }
        }
      }    
    }
  },
  {
    $sort: { transaction_count: -1 }
  }
]

db.createView("transactionCountByCode", transactions, pipeline)

db.transactionCountByCode.find()

/*
5. Calcular la suma total, suma total de ventas y suma total de compras de las transacciones realizadas 
   por año y mes. Mostrar el resultado en orden cronológico. No se debe mostrar resultados anidados en 
   el resultado. 
   HINT: El operador $cond puede ser de utilidad.
 */

db.transactions.aggregate( [
  {
    $unwind: "$transactions"
  },
  {
    $group: {
      _id: {
        year: { $year: "$transactions.date" },
        month: { $month: "$transactions.date" }
      },
      total_sum: { 
        $sum: { $toDouble:"$transactions.total" } 
      },
      sell_total_sum: { 
        $sum : {
          $cond: [
            { '$eq': ["$transactions.transaction_code", "sell"] }, 
            { $toDouble:"$transactions.total" }, 
            0
          ] 
        } 
      },
      buy_total_sum: { 
        $sum : {
          $cond: [
            { '$eq': ["$transactions.transaction_code", "buy"] }, 
            { $toDouble:"$transactions.total" }, 
            0
          ] 
        } 
      }
    }
  },
  {
    $project: {
      year: "$_id.year",
      month: "$_id.month",
      total_sum: 1,
      sell_total_sum: 1,
      buy_total_sum: 1,
      _id:0
    }
  },
  {
    $sort: { year: 1, month: 1 }
  }
] )

/*
6. Especificar reglas de validación en la colección transactions 
   (a) usando JSON Schema a los campos: account_id, transaction_count, bucket_start_date, 
   bucket_end_date y transactions ( y todos sus campos anidados ). Inferir los tipos y otras 
   restricciones que considere adecuados para especificar las reglas a partir de los documentos de la colección. 
   (b) Luego añadir una regla de validación tal que bucket_start_date debe ser menor o igual a bucket_end_date. 
   (c) Testear la regla de validación generando dos casos de falla en la regla de validación y 
   dos casos donde cumple la regla de validación. Aclarar en la entrega cuales son los casos que fallan 
   y cuales cumplen la regla de validación. Los casos no deben ser triviales.
*/

// (a)
db.runCommand( {
  "collMod": "transactions",
  "validator": {
    $jsonSchema: {
      bsonType: "object",
      required: [ 
        "account_id", 
        "transaction_count", 
        "bucket_start_date", 
        "bucket_end_date", 
        "transactions"
      ],
      properties: {
        account_id: {
          bsonType: "int",
          description: "'account_id' is a required int"
        },
        transaction_count: {
          bsonType: "int",
          description: "'transaction_count' is a required int"
        },
        bucket_start_date: {
          bsonType: "date",
          description: "'bucket_start_date' is a required date"
        },
        bucket_end_date: {
          bsonType: "date",
          description: "'bucket_end_date' is a required date"
        },
        transactions: {
          bsonType: "array",
          minItems: 1, 
          uniqueItems: true,
          items: {
            bsonType: "object",
            required: [ 
              "amount", 
              "date", 
              "price", 
              "symbol", 
              "total", 
              "transaction_code" 
            ],
            additionalProperties: false,
            description: "'items' must contain the stated fields.",
            properties: {
              amount: {
                bsonType: "int",
                description: "'amount' is a required field of type int"
              },              
              date: {
                bsonType: "date",
                description: "'date' is a required field of type date"
              },
              price: {
                bsonType: "string",
                description: "'price' is a required field of type string"
              },
              symbol: {
                bsonType: "string",
                description: "'symbol' is a required field of type string"
              },
              total: {
                bsonType: "string",
                description: "'total' is a required field of type string"
              },
              transaction_code: {
                enum: [ "buy", "sell" ],
                description: "'transaction_code' is required and can only be one of the given enum values"
              }
            }
          }
        }
      }
    },
// (b)
    $expr: {
      $lte:[ "$bucket_start_date", "$bucket_end_date" ]
    },
  }
} )

// (c)

// Casos de fallas en la validación

// transaction_code = 'buy-sell'

db.transactions.insertOne( {
  account_id: 443178,
  transaction_count: 2,
  bucket_start_date: ISODate("1969-02-04T00:00:00.000Z"),
  bucket_end_date: ISODate("2017-01-03T00:00:00.000Z"),
  transactions: [
    {
      date: ISODate("2003-09-09T00:00:00.000Z"),
      amount: 7514,
      transaction_code: 'buy-sell',
      symbol: 'adbe',
      price: '19.1072802650074180519368383102118968963623046875',
      total: '143572.1039112657392422534031'
    },
    {
      date: ISODate("2016-06-14T00:00:00.000Z"),
      amount: 9240,
      transaction_code: 'buy',
      symbol: 'team',
      price: '24.1525632387771480580340721644461154937744140625',
      total: '223169.6843263008480562348268'
    }
  ]
} )

// bucket_start_date > bucket_end_date

db.transactions.insertOne( {
  account_id: 443178,
  transaction_count: 2,
  bucket_start_date: ISODate("2019-02-04T00:00:00.000Z"),
  bucket_end_date: ISODate("2017-01-03T00:00:00.000Z"),
  transactions: [
    {
      date: ISODate("2003-09-09T00:00:00.000Z"),
      amount: 7514,
      transaction_code: 'buy',
      symbol: 'adbe',
      price: '19.1072802650074180519368383102118968963623046875',
      total: '143572.1039112657392422534031'
    },
    {
      date: ISODate("2016-06-14T00:00:00.000Z"),
      amount: 9240,
      transaction_code: 'buy',
      symbol: 'team',
      price: '24.1525632387771480580340721644461154937744140625',
      total: '223169.6843263008480562348268'
    }
  ]
} )

// Casos que pasan la validación

db.transactions.insertOne( {
  account_id: 4431788,
  transaction_count: 2,
  bucket_start_date: ISODate("1969-02-04T00:00:00.000Z"),
  bucket_end_date: ISODate("2017-01-03T00:00:00.000Z"),
  transactions: [
    {
      date: ISODate("2003-09-09T00:00:00.000Z"),
      amount: 7514,
      transaction_code: 'buy',
      symbol: 'adbe',
      price: '19.1072802650074180519368383102118968963623046875',
      total: '143572.1039112657392422534031'
    },
    {
      date: ISODate("2016-06-14T00:00:00.000Z"),
      amount: 9240,
      transaction_code: 'sell',
      symbol: 'team',
      price: '24.1525632387771480580340721644461154937744140625',
      total: '223169.6843263008480562348268'
    }
  ]
} )

db.transactions.insertOne( {
  account_id: 4431789,
  transaction_count: 2,
  bucket_start_date: ISODate("1969-02-04T00:00:00.000Z"),
  bucket_end_date: ISODate("2017-01-03T00:00:00.000Z"),
  transactions: [
    {
      date: ISODate("2003-09-09T00:00:00.000Z"),
      amount: 7514,
      transaction_code: 'buy',
      symbol: 'adbe',
      price: '19.1072802650074180519368383102118968963623046875',
      total: '143572.1039112657392422534031'
    }
  ]
} )

/*

7. Listar el username del cliente, cuentas y sus transacciones más recientes de cada cuenta asociada. 
   Se puede asumir que el campo transactions está ordenado.
   Listar el resultado en orden alfabético.
   HINT: El operador $map puede ser de utilidad.
   Extra: Este ejercicio suma hasta 1 punto, pero no resta.
*/

db.customers.aggregate( [
  {
    $lookup: {
      from: "transactions",
      localField: "accounts",
      foreignField: "account_id",
      pipeline: [
        {
          $project: {
            most_recent_transaction: {
              $reduce: {
                input: "$transactions",
                initialValue: { $first: "$transactions" },
                in: {
                  $cond: [ 
                    { $gte: ["$$this.date", "$$value.date"] }, 
                    "$$this", 
                    "$$value" 
                  ]
                }
              }
            },
            _id:0
          }
        }, 
        {
          $replaceRoot: { newRoot: "$most_recent_transaction"}
        }
      ],
      as: "most_recent_transactions"
    }
  },
  {
    $project: {
      username: 1,
      accounts: 1,
      most_recent_transactions: 1,
      _id: 0
    }    
  },
  {
    $sort: { username: 1 }
  }
] )

