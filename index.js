require('dotenv').config();
const express = require('express');

express()
  .use(express.static('dist'))
  .get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  })
  .listen(process.env.PORT || 3000);
