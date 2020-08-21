var sql   = require('sqlite3').verbose()
const src = 'db.sqlite'
var msg   = 'Database is ready!'

let dbs = new sql.Database(src, (error) => {
	if(error) {
		console.log(error.message)
		throw error
	} else {
		console.log('\x1b[42m', 'RUNING' ,'\x1b[0m', msg)
	}
})

module.exports = dbs
