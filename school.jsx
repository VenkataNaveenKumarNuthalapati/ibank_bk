const express = require('express');
const app = express();
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwToken = require('jsonwebtoken');
const cors = require('cors');

app.use(express.json());
app.use(cors());
const dbPath = path.join(__dirname, './school.db');

let db;

const initDB_Server = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3001, () => {
            console.log('Server Running at http://localhost:3001 port')
        })
    } catch (error) {
        console.log(`DB Error ${error.message}`);
        process.exit(1);
    }
}

initDB_Server();

app.post('/createtable/', async (request, response) => {
    let createQuery = request.body;
    await db.run(createQuery);
})
