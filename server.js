const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');

const app = express();
app.use(bodyParser.json());
app.use(helmet())

// Base de données en mémoire pour l'exo
const db = new sqlite3.Database(':memory:');

const ADMIN_TOKEN = process.env.JWT_TOKEN;

const adminPassword = bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
const userPassword = bcrypt.hash(process.env.USER_PASSWORD, 10);

db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER, username CHAR, password CHAR, role CHAR CHECK(role IN ('admin', 'user')))");
  db.run(
      "INSERT INTO users VALUES (?, ?, ?, ?)",
      [1, 'admin', adminPassword, 'admin']
  );
  db.run(
      "INSERT INTO users VALUES (?, ?, ?, ?)",
      [1, 'admin', userPassword, 'admin']
  );
});

app.get('/api/user', (req, res) => {
  const username = req.query.username;
  const query = `SELECT username FROM users WHERE username = '${username}'`;
  
  db.get(query, (err, row) => {
    if (err) res.status(500).send(err.message);
    else res.json(row);
  });
});

app.post('/api/delete-user', (req, res) => {
  const token = req.headers['authorization'];
  
  if (token === ADMIN_TOKEN) { 
    const id = req.body.id;
    db.run(`DELETE FROM users WHERE id = ${id}`);
    res.send("Utilisateur supprimé");
  } else {
    res.status(403).send("Accès refusé");
  }
});

app.get('/api/welcome', (req, res) => {
  const name = req.query.name || "Visiteur";
  res.send(`<h1>Bienvenue sur l'API, ${name} !</h1>`);
});

app.get('/api/debug', (req, res) => {
    throw new Error("Base de données inaccessible");
});

app.listen(3000, () => console.log('🚀 API vulnérable lancée sur http://localhost:3000'));