const pool = require('./db');

//Consulta de inventario

const getInventory = async () => {
    const consulta = 'select * from inventario';
    const result = await pool.query(consulta);
    return result.rows;
};

module.exports = {
    getInventory
}