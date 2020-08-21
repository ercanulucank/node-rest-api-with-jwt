var app = require('./app')
var prt = 8000

var srv = app.listen(prt, () => {
	var msg = 'Rest is %host%:%prt% running!'.replace('%host%', srv.address().address).replace('%prt%', srv.address().port)
	console.log('\x1b[42m', 'RUNING' ,'\x1b[0m', msg)
})
