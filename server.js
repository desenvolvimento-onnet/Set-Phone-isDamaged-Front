const express = require("express");
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser'); // Import the body-parser middleware

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); // Add the body-parser middleware

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

//----------------

const pool = mysql.createPool({
  host: '177.85.0.28',
  user: 'projects',
  password: 'devA1D2M3',
  database: 'onnet_sga',
});

app.post('/selectFilteredData', (req, res) => {
  const sqlQuery = req.body.sqlQuery; // Access the SQL query from the request body

  // Validate the sqlQuery parameter
  if (!sqlQuery) {
    res.status(400).send("Requisição Inválida!");
    return;
  }

  // Execute the SQL query on the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send("Não foi possível conectar-se ao banco de dados.");
      return;
    }

    connection.query(sqlQuery, (err, results) => {
      connection.release();

      if (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar o registro.");
      } else {
        if (results.length > 0) {
          res.json(results); // Send the results back to the client as JSON
        } else {
          res.status(200).json({ message: 'Não há nenhum registro com este(s) filtro(s).' });
          // Send a JSON response with the message
        }
      }
    });

  });
});
//-----------------------------------------
// app.post('/selectAllData', (req, res) => {
//   const sqlQuery = req.body.sqlQuery; // Access the SQL query from the request body

//   // Validate the sqlQuery parameter
//   if (!sqlQuery) {
//     res.status(400).send("Requisição Inválida!");
//     return;
//   }

//   // Execute the SQL query on the database
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send("Não foi possível conectar-se ao banco de dados.");
//       return;
//     }

//     connection.query(sqlQuery, (err, results) => {
//       connection.release(); // Release the connection back to the pool

//       if (err) {
//         console.error(err);
//         res.status(500).send("Erro ao executar este filtro.");
//         return;
//       }

//       if (results.length > 0) {
//         res.json(results); // Send the results back to the client as JSON
//       } else {
//         res.json({ message: 'Não foi possível carregar os dados. Tente Novamente.'});
//         //message to show alert informing the user
//       }
//     });
//   });
// });

app.post('/setEstragado', (req, res) => {
  const sqlQuery = req.body.sqlQuery; // Access the SQL query from the request body

  // Validate the sqlQuery parameter
  if (!sqlQuery) {
    res.status(400).send("Requisição Inválida!");
    return;
  }

  // Execute the SQL query on the database
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send("Não foi possível conectar-se ao banco de dados.");
      return;
    }

    connection.query(sqlQuery, (err, results) => {
      connection.release(); // Release the connection back to the pool

      if (err) {
        console.error(err);
        res.status(500).send("Erro ao atualizar o registro.");
      } else {
        res.status(200).send("Registro atualizado com sucesso.");
      }
    });
  });
});