///////////////////////// Database.Connection ///////////////////////
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

// Export modules
module.exports = { getConnection, closeConnection };
