const connection = require('../db/db.connection');

const getCajas = (req, res) => {
    const query = 'SELECT * FROM cajas';

    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error al ejecutar la consulta:', error);
            res.status(500).send(error);
        } else {
            res.status(200).send(results);
        }
    });
};

module.exports = {
    getCajas,
};
