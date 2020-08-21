var exp = require('express')
var app = exp()

var kullanicilar = require('./src/controllers/kullanicilar');
app.use('/kullanicilar', kullanicilar);

module.exports = app;
