
/* 1
Especificar en la colección users las siguientes reglas de validación: 
El campo name (requerido) debe ser un string con un máximo de 30 caracteres, 
email (requerido) debe ser un string que matchee con la expresión regular: 
"^(.*)@(.*)\\.(.{2,4})$" , password(requerido) debe ser un string con al menos 
50 caracteres.
*/

db.runCommand(
    {
        collMod: 'users',
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "email", "password"],
                properties: {
                    name: {
                        bsonType: "string",
                        maxLength: 30,
                    },
                    email: {
                        bsonType: "string",
                        pattern: "^(.*)@(.*)\\.(.{2,4})$"
                    },
                    password: {
                        bsonType: "string",
                        minLength: 50
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "error"
    }
)

/* 2
Obtener metadata de la colección users que garantice que las reglas de validación
fueron correctamente aplicadas.
*/

db.users.insertOne(
    {
        name: 'holasasasasasas',
        email: 'holagmail.com',
        password: 'asdddddddddddddddddddddddddddddddddddddd'
    }
)

db.getCollectionsInfos({ name: 'users' })

/* 3
Especificar en la colección theaters las siguientes reglas de validación: El campo
theaterId (requerido) debe ser un int y location (requerido) debe ser un object con:
    a. un campo address (requerido) que sea un object con campos street1, city, state
    y zipcode todos de tipo string y requeridos
    b. un campo geo (no requerido) que sea un object con un campo type, con valores
    posibles “Point” o null y coordinates que debe ser una lista de 2 doubles
    Por último, estas reglas de validación no deben prohibir la inserción o 
    actualización de documentos que no las cumplan sino que solamente deben advertir.
*/

db.runCommand(
    {

        collMod: 'theaters',
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["theaterId", "location"],
                properties: {
                    theaterId: {
                        bsonType: "int",
                    },
                    location: {
                        bsonType: "object",
                        required: ["address"],
                        properties: {
                            address: {
                                bsonType: "object",
                                required: ["street1", "city", "state", "zipcode"],
                                properties: {
                                    street1: {
                                        bsonType: "string",
                                    },
                                    city: {
                                        bsonType: "string",
                                    },
                                    state: {
                                        bsonType: "string",
                                    },
                                    zipcode: {
                                        bsonType: "string",
                                    }
                                }
                            },
                            geo: {
                                bsonType: 'object',
                                required: ['type', 'coordinates'],
                                properties: {
                                    type: {
                                        enum: ['Point', null],
                                    },
                                    coordinates: {
                                        bsonType: ['double'],
                                        maxItems: 2,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        validationLevel: 'strict',
        validationAction: 'warn'
    }
)

/* 4
Especificar en la colección movies las siguientes reglas de validación: El campo title
(requerido) es de tipo string, year (requerido) int con mínimo en 1900 y máximo en 3000,
y que tanto cast, directors, countries, como genres sean arrays de strings sin
duplicados.
a. Hint: Usar el constructor NumberInt() para especificar valores enteros a la hora
de insertar documentos. Recordar que mongo shell es un intérprete javascript y
en javascript los literales numéricos son de tipo Number(double).
*/

db.runCommand(
    {
        collMod: 'movies',
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ['title', 'year'],
                properties: {
                    title: {
                        bsonType: "string",
                    },
                    year: {
                        bsonType: "int",
                        minimum: NumberInt(1900),
                        maximum: NumberInt(3000),
                    },
                    cast: {
                        bsonType: "array",
                        uniqueItems: true,
                    },
                    directors: {
                        bsonType: "array",
                        uniqueItems: true,
                    },
                    countries: {
                        bsonType: "array",
                        uniqueItems: true,
                    },
                    genres: {
                        bsonType: "array",
                        uniqueItems: true,
                    }
                }
            }
        },
        validationLevel: "strict",
        validationAction: "warn"
    }
)

/* 5
Crear una colección userProfiles con las siguientes reglas de validación: Tenga un
campo user_id (requerido) de tipo “objectId”, un campo language (requerido) con alguno
de los siguientes valores [ “English”, “Spanish”, “Portuguese” ] y un campo
favorite_genres (no requerido) que sea un array de strings sin duplicados.
*/

db.createCollection(
    'userProfiles',
    {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ['user_id', 'language'],
                properties: {
                    user_id: {
                        bsonType: "objectId",
                    },
                    language: {
                        enum: ['English', 'Spanish', 'Portuguese'],
                    },
                    favorite_genres: {
                        bsonType: "array",
                        uniqueItems: true,
                    }
                }
            }
        }
    }
)