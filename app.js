
// Importar el paquete de terceros que acabamos de instalar. Fijaos que como se encuentra en la carpeta node_modules NO hace falta especificar ninguna ruta (al igual que pasa con los built-in modules)
const express = require('express');
const logger = require('morgan');

// intersectArrays devuelve un array que contiene todos los elementos que están presentes tanto en arr1 como en arr2
function intersectArrays(arr1, arr2){
    return arr1.filter(v => arr2.includes(v))
}

function getAllWinningNumbers(item){
    return `${item.winning_numbers} ${item.supplemental_numbers} ${item.super_ball}`
}

// Objeto para gestionar el enrutamiento y otros aspectos de la aplicación
const app = express();

// Añadimos el middleware de morgan para loguear todas las peticiones que haga un cliente
app.use(logger('dev'));

// Gestionar los datos de tipo JSON (entre ellos los POST que nos lleguen)
app.use(express.urlencoded({ extended: true }));  // Middleware para parsear datos de formularios


// PETICIONES

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

// COMPROBAR NÚMEROS PREMIADOS A TRAVÉS DE LA FECHA

 // /api/check-date?date=2024-05-17
app.get('/api/check-date', (req, res) => {

    // Tenemos que informar al endpoint de tipo GET de una fecha en concreto. usaremos una query string para proveer de esta info

    // Obtener la fecha a comprobar de la query string
    const date = req.query.date;

    // Cargar los datos del json
    const lottery = require('./data/lottery.json');

    // Buscar en el array a través de la fecha, el boleto premiado
    const item = lottery.find(raffle => raffle.draw_date.includes(date));

    if (item) {
        /**
         * {
         *    "message" : "Draw found",
         *    "winningNumbers": "20 36 37 48 67 16 02"
         * }
         */
        res.send({
            message: "Draw found",
            winningNumbers: getAllWinningNumbers(item)
        });
    } else {
        res.status(404).send({
            message: "Draw not found for the given date"
        });
    }


});

// COMPROBAR SI TUS NÚMEROS SON PREMIADOS, A TRAVÉS DE LA FECHA Y LOS NÚMEROS

// /api/get-computed-results?date=2024-06-18&playedNumbers=23 20 33 44 50 02 04
app.get('/api/get-computed-results', (req, res) => {

    // Obtener la fecha y los números jugados desde la query string
    const { date, playedNumbers } = req.query

    // Como playedNumbers es un string separado por espacios, necesito convertirlo en un array
    playedNumbers.split(" ")

    // Obtengo los sorteos del json y utilizo .find() para encontrar el sorteo según la fecha
    const lottery = require('./data/lottery.json');
    const item = lottery.find(raffle => raffle.draw_date.includes(date));

    // Condicional para ver si el sorteo existe
    if(item) {
        // Obtener todos los números ganadores y también convertirlos en un array
        const winningNumbers = getAllWinningNumbers(item).split(" ")
        console.log("🚀 ~ app.get ~ winningNumbers:", winningNumbers)

        // Encontrar cuantas coincidencias hay entre playNumbers y winningNumbers
        const matchedNumbers = intersectArrays(winningNumbers, playedNumbers)
        console.log("🚀 ~ app.get ~ matchedNumbers:", matchedNumbers)

        // Calcular premio obtenido según la info de prizes.json y las coincidencias
        const prizes = require('./data/prizes.json')
        const prize = prizes[matchedNumbers.length].prize

        // Enviar un .send con numeroCoincidencias y dinero ganado
        res.send({
            message: "Draw found",
            matchedNumbers: matchedNumbers.length,
            prize: prize
        })

    } else {
        res.status(404).send({
            message: `Draw not found for the given date: ${date}` 
        });
    }
   
})

// Levantar el servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en el puerto 3000.");
});

