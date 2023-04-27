const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('../config/connectDB');
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());

connectDB();


app.use('/api/Doctorants', require('./routes/Doctorant'));
app.use('/api/PVs', require('./routes/PV'));
app.use('/api/Encadrants', require('./routes/Encadrant'));
app.use('/api/Statistiques', require('./routes/Statistiques'));



    
app.listen(port, () => console.log(`Listening on PORT : ${port}`));