const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

//////////////////////// SqlServer DB connection /////////////////////////
const mssql = require('mssql');

const getConnection = async (user, password) => {
    try {
        const config = {
            user: `${user}`, // MySQLServerLogin
            password: `${password}`, // 4089
            server: '192.168.157.29',//'DESKTOP-N1JPSN9\\SQLEXPRESS', // 192.168.157.29
            database: 'IndianBankDB',
            options: {
                encrypt: true,
                trustServerCertificate: true
            }
        };
        await mssql.connect(config);
        console.log('Connected to SQL Server successfully!');
        return new mssql.Request();
    } catch (error) {
        console.error('Error connecting to SQL Server:', error);
        throw new Error('Error connecting to the database');
    }
};

const closeConnection = () => {
    mssql.close();
};
///////////////////////////////////////////////////////////////////////////
////////////////// API 1 /////////////////////////
app.get('/', async (req, res) => {
    const accNum = req.params.accNum; // Access the parameter using req.params
    const request = await getConnection('MySQLServerLogin', '4089');
    try {
        const records = await request.query(`SELECT * FROM AccountMaster;`);
        res.status(200).send(records.recordset);
    } catch (queryError) {
        console.error('Error executing SQL query:', queryError);
        res.status(500).send('Error executing SQL query');
    } finally {
        closeConnection();
    }
});

////////////////// API 1 /////////////////////////
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
