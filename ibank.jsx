const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const bcrypt = require("bcrypt");
const jsonWebToken = require("jsonwebtoken");

//////////////////////// SqlServer DB connection /////////////////////////
const mssql = require("mssql");

const getConnection = async (user, password) => {
  try {
    const config = {
      user: `${user}`, // MySQLServerLogin
      password: `${password}`, // 4089
      server: "DESKTOP-N1JPSN9\\SQLEXPRESS", //'DESKTOP-N1JPSN9\\SQLEXPRESS', // 192.168.157.29
      database: "IndianBankDB",
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    };
    await mssql.connect(config);
    console.log("Connected to SQL Server successfully!");
    return new mssql.Request();
  } catch (error) {
    console.error("Error connecting to SQL Server:", error);
    throw new Error("Error connecting to the database");
  }
};
// getConnection("MySQLServerLogin", "4089");
const closeConnection = () => {
  mssql.close();
};
///////////////////////////////////////////////////////////////////////////
/////////////  Register APIS /////////////////
app.post("/register/", async (request, response) => {
  const db = await getConnection("MySQLServerLogin", "4089");
  let { username, password, name, gender } = request.body;
  console.log(username, password, name, gender);
  try {
    let user = `SELECT * FROM reg_user WHERE username = '${username}';`;
    user = await db.query(user);
    console.log(user);
    if (user.recordset.length === 0) {
      if (password.length >= 6) {
        let hashPashword = await bcrypt.hash(password, 10);
        await db.query(
          `insert into reg_user values('${username}', '${hashPashword}', '${name}', '${gender}');`
        );
        console.log("User created successfully");
        response.status(200);
        response.send("User created successfully");
      } else {
        response.status(400);
        response.send(
          "The password is too short, It should be Min 6 characters"
        );
      }
    } else {
      response.send("User Name Already Exist, Use Deferent User Name");
    }
  } catch (queryError) {
    console.error("Error executing SQL query:", queryError);
    response.status(500).send("Error executing SQL query");
  } finally {
    closeConnection();
    console.log("Closed SQL Server successfully!");
  }
});
///////////////////// Validate Access Token /////////////////////
let validateToken = (request, response, next) => {
  let token = request.headers["authorization"];
  if (token !== undefined) {
    token = token.split(" ")[1];
    jsonWebToken.verify(token, "aeiou", async (error, payLoad) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payLoad.username;
        next();
      }
    });
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
};
/////////////  LOGIN APIS /////////////////
app.post("/login/", async (request, response) => {
  const db = await getConnection("MySQLServerLogin", "4089");
  let { username, password } = request.body;
  let user = `SELECT * FROM reg_user WHERE username = '${username}';`;
  user = await db.query(user);
  if (user.recordset.length !== 0) {
    console.log(user.recordset[0].password);
    let isValidPass = await bcrypt.compare(
      password,
      user.recordset[0].password
    );
    if (isValidPass === true) {
      payLoad = { username: username };
      let jwtToken = jsonWebToken.sign(payLoad, "aeiou");
      response.status(200);
      response.send({ jwtToken });
      console.log(jwtToken);
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  } else {
    response.status(400);
    response.send("Invalid user");
  }
});
////////////////// API 1 /////////////////////////
app.get("/accounts/:accNum", validateToken, async (request, response) => {
  console.log("Attentyication Successful");
  let username = request.username;
  console.log(username);
  const accNum = request.params.accNum; // Access the parameter using req.params
  const db = await getConnection("MySQLServerLogin", "4089");
  try {
    const records = await db.query(
      `SELECT * FROM AccountMaster WHERE ACID = ${accNum};`
    );
    response.status(200);
    response.send(records.recordset);
  } catch (queryError) {
    console.error("Error executing SQL query:", queryError);
    res.status(500).send("Error executing SQL query");
  } finally {
    closeConnection();
  }
});

////////////////// API 2 /////////////////////////
app.get("/statement/:accNum", async (req, res) => {
  const accNum = req.params.accNum; // Access the parameter using req.params
  const request = await getConnection("MySQLServerLogin", "4089");
  try {
    const records = await request.query(
      `select * , 0 as TotalBal from TransactionMaster WHERE ACID = ${accNum};`
    );
    res.status(200).send(records.recordset);
  } catch (queryError) {
    console.error("Error executing SQL query:", queryError);
    res.status(500).send("Error executing SQL query");
  } finally {
    closeConnection();
  }
});

const server = app.listen(5000, () => {
  console.log("Server is listening at port 5000...");
});
