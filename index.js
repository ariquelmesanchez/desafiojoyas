const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 3000;
console.log(port)


const app = express();

app.use(express.json());
app.use(cors());

app.listen(port, () => { console.log('Servidor iniciado en puerto ', port)} );


