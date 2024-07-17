


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

// Es generarme un objeto para gestionar el enrutamiento y otros aspectos de la aplicación
const app = express();

// Añadimos el middleware de morgan para loguear todas las peticiones que haga un cliente
app.use(logger('dev'));

// nos gustaría que también gestionaras los datos de tipo JSON (entre ellos los POST que nos lleguen)
app.use(express.urlencoded({ extended: true }));  // Middleware para parsear datos de formularios


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.get('/api/check-date', (req, res) => {

    // 1. Tenemos que informar al endpoint de tipo GET de una fecha en concreto. usaremos una query string para proveer de esta info
    // ¿Que aspecto va a tener una consulta para el 17 de mayo de 2024?

    // /api/check-date?date=2024-05-17

    // 2. Capturar/extraer el valor del parámetro 'date' 
    const date = req.query.date;
    console.log(date)

    // 3. Buscar a ver si hay sorteo para la fecha 'date' en el lottery.json (cargar el JSON) require, readFileSync
    const lottery = require('./data/lottery.json');

    // 4. ¿Qué método de array vaís a usar para la busqueda? .find
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

    // 5. Suponemos de momento que siempre nos pasan una fecha que existe. 2020-09-25 . Tenemos que devolver un JSON con este formato


});

// /api/get-computed-results?date=2024-06-18&playedNumbers=23 20 33 44 50 02 04
app.get('/api/get-computed-results', (req, res) => {

    // Extraer los valores de date y playNumbers
    const { date, playedNumbers } = req.query

    // Tengo un string separado por espacios y quiero convertirlo en un array
    playedNumbers.split(" ")

    // .find() para encontrar el sorteo según la fecha
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

        // Calcular premio obtenido según prizes.json
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

