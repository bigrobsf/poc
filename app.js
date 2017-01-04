'use strict';
/* jshint esversion: 6 */
/* jshint devel:true */
/* jshint node: true */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

var ejs = require('ejs');

app.set('view engine', 'ejs');

app.use(express.static('public'));

// route for image selected from flickr api call
app.get('/index.ejs', function(req, res) {
  res.render('index');
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/api-call', function(req, res) {
  res.render('api-call');
});

app.listen(PORT, function(req, res) {
  console.log(`Listening on port ${PORT}`);
});
