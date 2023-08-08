const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const { getConnection, closeConnection } = require('./init_DB_Server/init_DB_Server.jsx');

////////////////// API 2 /////////////////////////
app.get('/login/:accNum', async (req, res) => {
    const accNum = req.params.accNum; // Access the parameter using req.params
    const request = await getConnection('MySQLServerLogin', '4089');
    try {
        const records = await request.query(`SELECT * FROM AccountMaster WHERE ACID = ${accNum};`);
        res.status(200).send(records.recordset);
    } catch (queryError) {
        console.error('Error executing SQL query:', queryError);
        res.status(500).send('Error executing SQL query');
    } finally {
        closeConnection();
    }
});

////////////////// API 2 /////////////////////////
app.get('/statement/:accNum', async (req, res) => {
    const accNum = req.params.accNum; // Access the parameter using req.params
    const request = await getConnection('MySQLServerLogin', '4089');
    try {
        const records = await request.query(`select * , 0 as TotalBal from TransactionMaster WHERE ACID = ${accNum};`);
        res.status(200).send(records.recordset);
    } catch (queryError) {
        console.error('Error executing SQL query:', queryError);
        res.status(500).send('Error executing SQL query');
    } finally {
        closeConnection();
    }
});

const server = app.listen(5000, () => {
    console.log('Server is listening at port 5000...');
});
