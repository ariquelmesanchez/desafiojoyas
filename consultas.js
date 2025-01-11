const pool = require('./db');

//Consulta de inventario

const getInventory = async () => {
    const consulta = 'select * from inventario';
    const { rows } = await pool.query(consulta);
    return rows;
};

const getPaginatedJewelry = async (limits, page, order_by) => {
    const offset = (page - 1) * limits;

    // Mapear valores válidos para evitar inyecciones de SQL
    const validOrderBy = {
        stock_ASC: 'stock ASC',
        stock_DESC: 'stock DESC',
        precio_ASC: 'precio ASC',
        precio_DESC: 'precio DESC',
    };

    // Determinar el orden de forma segura
    const orderByClause = validOrderBy[order_by] || 'id ASC';

    const query = `
        SELECT * 
        FROM inventario 
        ORDER BY ${orderByClause} 
        LIMIT $1 OFFSET $2
    `;
    const values = [limits, offset];
    const { rows } = await pool.query(query, values);

    const totalCountQuery = 'SELECT COUNT(*) FROM inventario';
    const { rows: totalCountRows } = await pool.query(totalCountQuery);

    return {
        rows,
        totalCount: parseInt(totalCountRows[0].count, 10),
    };
};

const getFilteredJewelry = async (precio_max, precio_min, categoria, metal) => {
    const filters = [];
    const values = [];

    if (precio_max) {
        filters.push(`precio <= $${filters.length + 1}`);
        values.push(precio_max);
    }
    if (precio_min) {
        filters.push(`precio >= $${filters.length + 1}`);
        values.push(precio_min);
    }
    if (categoria) {
        filters.push(`categoria = $${filters.length + 1}`);
        values.push(categoria);
    }
    if (metal) {
        filters.push(`metal = $${filters.length + 1}`);
        values.push(metal);
    }

    const query = `
        SELECT * 
        FROM inventario 
        ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    `;
    const { rows } = await pool.query(query, values);
    return rows;
};

module.exports = {
    getInventory,
    getFilteredJewelry,
    getPaginatedJewelry
}