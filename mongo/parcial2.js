/* Parcial 2 BD: Mansilla, Kevin Gaston */

/* 1 
Buscar los clientes que no tengan el campo active y que o bien posean más de 4
cuentas o bien nacieron entre Abril de 1995 y Marzo de 1997 inclusives. Listar el
nombre, email, fecha de nacimiento y cantidad de cuentas. Limitar el resultado 
a los 50 primeros clientes de acuerdo al orden alfabético.
Observación: ordenar alfabéticamente por nombre.
*/

db.customers.find(
    {
        $and: [
            {
                active: { $exists: false }
            },
            {
                $or: [
                    {
                        accounts: { $gt: 4 }
                    },
                    { $and: [
                        { birthdate: { $gte: new Date("1995-04-01") } },
                        { birthdate: { $lte: new Date("1997-03-31") } }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 1,
        email: 1,
        birthdate: 1,
        accounts: { $size: "$accounts" }
    }
).sort({ name: 1 }).limit(50);

/* 2
Actualizar las cuentas que tengan un límite entre 8000 y 9000 inclusives,
agregando un nuevo campo "class" con el valor "A" si la cuenta tiene hasta dos
productos y con el valor "B" si tiene 3 o más productos
*/

db.accounts.updateMany(
    {
        $and: [
            { limit: { $gte: 8000 } },
            { limit: { $lte: 9000 } }
        ]
    },
    [
        {
            $addFields: {
                class: {
                    $cond: {
                        if: { $lte: [{ $size: "$products" }, 2] },
                        then: "A",
                        else: "B"
                    }
                }
            }
        }
    ]
  
);

/* chequeo */
db.accounts.find({ class: "A" })
db.accounts.find({ class: "B" })

/* 3
Buscar las transacciones donde la cantidad de transacciones sea mayor a 94.
Listar id de transacción, id de la cuenta, y solo aquellas transacciones que 
tengan el código de transacción igual a "buy" y con "total" mayor a 500000. 
Mostrar el resultado ordenados por el id de la cuenta en orden decreciente.
HINTS: (i) El operador $filter puede ser de utilidad. (ii) Notar que el valor 
del campo total está en string y requiere conversión.
idea: con pipeline, primero filtro las transacciones que cumplan la condición, 
luego proyecto lo que necesito mostrar (filtro con buy > 500000) y luego ordeno.
notas:tengo que usar $$ para acceder a los campos de la base cuando use filter
*/

db.transactions.aggregate(
    [
        {
            $match: {
                $expr: {
                    $gt: [{ $size: "$transactions" }, 94]
                }
            }
        },
        {
            $project: {
                _id: 0,
                id: "$_id",
                account_id: 1,
                transactions: {
                    $filter: {
                        input: "$transactions",
                        as: "transaction",
                        cond: {
                            $and: [
                                { $eq: ["$$transaction.transaction_code", "buy"] },
                                {
                                    $gt: [{
                                        $convert: {
                                            input: "$$transaction.total",
                                            to: "double"
                                        }
                                    }, 500000]
                                }
                            ]
                        }
                    }
                }
            }
        },
        {
            $sort: {
                account_id: -1
            }
        }
    ]
);

/* 4
Crear la vista "transactionCountByCode" que lista el id de transacción, id de la
cuenta, cantidad de transacciones, cantidad de transacciones de compra
(transacciones con transaction_code igual a buy) y cantidad de transacciones de
venta (transacciones con transaction_code igual a sell). Listar el resultado
ordenados por cantidad de transacciones (orden decreciente).
sintax:
db.createView(
  "<viewName>",
  "<source>",
  [<pipeline>],
  {
    "collation" : { <collation> }
  }
)
*/

db.createView(
    "transactionCountByCode",
    "transactions",
    [
        {
            $project: {
                _id: 0,
                id: "$_id",
                account_id: 1,
                transaction_count: { $size: "$transactions" },
                buy_count: {
                    $size: {
                        $filter: {
                            input: "$transactions",
                            as: "transaction",
                            cond: {
                                $eq: ["$$transaction.transaction_code", "buy"]
                            }
                        }
                    }
                },
                sell_count: {
                    $size: {
                        $filter: {
                            input: "$transactions",
                            as: "transaction",
                            cond: {
                                $eq: ["$$transaction.transaction_code", "sell"]
                            }
                        }
                    }
                }
            }
        },
        {
            $sort: {
                transaction_count: -1
            }
        }
    ]
);

/* 5
Calcular la suma total, suma total de ventas y suma total de compras de las
transacciones realizadas por año y mes. Mostrar el resultado en orden cronológico.
No se debe mostrar resultados anidados en el resultado.
HINT: El operador $cond o $switch puede ser de utilidad.
pipeline, tengo que agrupar los resultados que voy a mostrar.
convertir los datos que estan en strings
*/

db.transactions.aggregate(
    [
        {
            $unwind: "$transactions"
        },
        {
            $project: {
                _id: 0,
                year: { $year: "$transactions.date" },
                month: { $month: "$transactions.date" },
                total: {
                    $convert: {
                        input: "$transactions.total",
                        to: "double"
                    }
                },
                transaction_code: "$transactions.transaction_code"
            }
        },
        {
            $group: {
                _id: {
                    year: "$year",
                    month: "$month"
                },
                total: { $sum: "$total" },
                buy_total: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$transaction_code", "buy"] },
                            then: "$total",
                            else: 0
                        }
                    }
                },
                sell_total: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$transaction_code", "sell"] },
                            then: "$total",
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]
);

/* 6
Especificar reglas de validación en la colección transactions 
(a) usando JSONSchema a los campos: account_id, transaction_count, bucket_start_date,
bucket_end_date y transactions ( y todos sus campos anidados ). Inferir los tipos y
otras restricciones que considere adecuados para especificar las reglas a partir de
los documentos de la colección.
--puse las validaciones en base a los datos que ya estaban en la base.
*/

db.runCommand(
    {
        collMod: 'transactions',
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['account_id', 'transaction_count', 'bucket_start_date', 'bucket_end_date', 'transactions'],
                properties: {
                    account_id: {
                        bsonType: 'objectId'
                    },
                    transaction_count: {
                        bsonType: 'int'
                    },
                    bucket_start_date: {
                        bsonType: 'date'
                    },
                    bucket_end_date: {
                        bsonType: 'date'
                    },
                    transactions: {
                        bsonType: 'array',
                        items: {
                            bsonType: 'object',
                            required: ['date', 'amount', 'transaction_code', 'symbol', 'price', 'total'],
                            properties: {
                                date: {
                                    bsonType: 'date'
                                },
                                amount: {
                                    bsonType: 'int'
                                },
                                transaction_code: {
                                    bsonType: 'string',
                                    enum: ['buy', 'sell']
                                },
                                symbol: {
                                    bsonType: 'string'
                                },
                                price: {
                                    bsonType: 'string'
                                },
                                total: {
                                    bsonType: 'string'
                                }
                            }
                        }
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    }
);


/* b
Luego añadir una regla de validación tal que bucket_start_date debe ser menor 
o igual a bucket_end_date

NO FUNCIONA
*/

db.runCommand(
    {
        collMod: 'transactions',
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['account_id', 'transaction_count', 'bucket_start_date', 'bucket_end_date', 'transactions'],
                properties: {
                    account_id: {
                        bsonType: 'objectId'
                    },
                    transaction_count: {
                        bsonType: 'int'
                    },
                    bucket_end_date: {
                        bsonType: 'date'
                    },
                    bucket_start_date: {
                        bsonType: 'date',
                        minimum: {
                            $dateFromString: {
                                dateString: "$bucket_end_date"
                            }
                        }
                    },
                    transactions: {
                        bsonType: 'array',
                        items: {
                            bsonType: 'object',
                            required: ['date', 'amount', 'transaction_code', 'symbol', 'price', 'total'],
                            properties: {
                                date: {
                                    bsonType: 'date'
                                },
                                amount: {
                                    bsonType: 'int'
                                },
                                transaction_code: {
                                    bsonType: 'string',
                                    enum: ['buy', 'sell']
                                },
                                symbol: {
                                    bsonType: 'string'
                                },
                                price: {
                                    bsonType: 'string'
                                },
                                total: {
                                    bsonType: 'string'
                                }
                            }
                        }
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    }
);

/* c 
Testear la regla de validación generando dos casos de falla en la regla de 
validación y dos casos donde cumple la regla de validación. Aclarar en la 
entrega cuales son los casos que fallan y cuales cumplen la regla de validación. 
Los casos no deben ser triviales. */

//agrega bien
db.transactions.insertOne(
    {
        account_id: ObjectId("5ca4bbc1a2dd94ee58161cb2"),
        transaction_count: 1,
        bucket_start_date: ISODate("2020-10-01T00:00:00.000Z"),
        bucket_end_date: ISODate("2021-10-01T00:00:00.000Z"),
        transactions: [
            {
                date: ISODate("2020-10-01T00:00:00.000Z"),
                amount: 100,
                transaction_code: "buy",
                symbol: "AAPL",
                price: "100",
                total: "10000"
            },
        ]
    }
);

//no funciona xq price y total con int y en las reglas de validación
//fue declarado como string
db.transactions.insertOne(
    {
        account_id: ObjectId("5ca4bbc1a2dd94ee58161cb3"),
        transaction_count: 2,
        bucket_start_date: ISODate("2020-10-01T00:00:00.000Z"),
        bucket_end_date: ISODate("2021-10-01T00:00:00.000Z"),
        transactions: [
            {
                date: ISODate("2020-10-01T00:00:00.000Z"),
                amount: 100,
                transaction_code: "sell",
                symbol: "AAPL",
                price: 100,
                total: 10000
            },
        ]
    }
);