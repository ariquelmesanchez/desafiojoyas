const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getInventory, getFilteredJewelry, getPaginatedJewelry } = require('./consultas');

const port = process.env.PORT || 3000;
console.log(port)


const app = express();

app.use(express.json());
app.use(cors());

//Middleware para generar reportes

app.use((req, res, next) => {
    console.log(`Ruta consultada: ${req.method} ${req.url}`);
    next(); // Permite continuar hacia la siguiente ruta
});


app.listen(port, () => { console.log('Servidor iniciado en puerto ', port)} );

app.get('/', async (req, res) => {
    try {
        const inventory = await getInventory();
        res.json(inventory);
    } catch (error) {
        console.error('Error al obtener el inventario:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta GET /joyas con HATEOAS, paginación, y orden
app.get('/joyas', async (req, res) => {
    try {
        const { limits = 10, page = 1, order_by } = req.query;

        const jewelry = await getPaginatedJewelry(limits, page, order_by);

        const totalPages = Math.ceil(jewelry.totalCount / limits);

        const hateoas = {
            totalCount: jewelry.totalCount,
            currentPage: page,
            totalPages,
            data: jewelry.rows,
            _links: {
                self: `/joyas?limits=${limits}&page=${page}&order_by=${order_by}`,
                next: page < totalPages ? `/joyas?limits=${limits}&page=${+page + 1}&order_by=${order_by}` : null,
                previous: page > 1 ? `/joyas?limits=${limits}&page=${+page - 1}&order_by=${order_by}` : null,
            },
        };

        res.json(hateoas);
    } catch (error) {
        console.error('Error al obtener las joyas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta GET /joyas/filtros
app.get('/joyas/filtros', async (req, res) => {
    try {
        const { precio_max, precio_min, categoria, metal } = req.query;

        const filteredJewelry = await getFilteredJewelry(precio_max, precio_min, categoria, metal);

        res.json(filteredJewelry);
    } catch (error) {
        console.error('Error al filtrar las joyas:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = app;

