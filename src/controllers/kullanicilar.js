var exp = require('express')
var app = exp.Router()
var dbs = require('../../database')
var cfg = require('../../config')
var jwt = require('jsonwebtoken')
var cry = require('bcryptjs')

var bpr = require('body-parser')
app.use(bpr.urlencoded({ extended: false }))
app.use(bpr.json())

// Tüm Kullanıcı Listesi Getirme İşlemi
app.get('/', (request, response, next) => {
	var tkn = request.headers['x-access-token']
	if(!tkn){
		return response.status(401).json({'auth': false, 'message': 'Erisim anahtari bulunamadi'})
	}
	jwt.verify(tkn, cfg.secret, function(error, decoded) {
		if(error){
			return response.status(401).json({'auth': false, 'message': 'Erisim anahtari gecersiz'})
		} else {
			var sql = 'SELECT * from kullanicilar'
			var prm = []
			dbs.all(sql, prm, (error, rows) => {
				if(error) {
					response.status(400).json({'error': response.message})
					return
				} else {
					response.status(201).json({'message': 'success', 'data': rows})
				}
			})
		}
	})
})

// Kullanıcı Kayıt İşlemi
app.post('/', (request, response, next) => {
	var err = []
	if(!request.body.sifre){
		err.push('Sifre girilmesi zorunludur.')
	}
	if(!request.body.kullanici_adi){
		err.push('Kullanici adi girilmesi zorunludur.')
	}
	if(err.length){
		response.status(400).json({'error': err.join(',')})
		return
	}
  var tkn = jwt.sign({id: this.lastID}, cfg.secret, {
    expiresIn: 86400
  })
	var dat = {
		kullanici_adi: request.body.kullanici_adi,
		sifre: cry.hashSync(request.body.sifre, 8),
    token: tkn
	}
	var sql = 'INSERT INTO kullanicilar (kullanici_adi, sifre, token) VALUES (?, ?, ?)'
	var prm = [dat.kullanici_adi, dat.sifre, dat.token]
	dbs.run(sql, prm, (error, rows) => {
		if(error) {
			response.status(400).json({'error': response.message})
			return
		} else {
			response.status(201).json({'message': 'success', 'auth' : true, 'token': dat.token, 'token_expires_in': dat.token_expires_in})
		}
	})
})

// Kullanıcı Giriş İşlemi
app.post('/giris_yap', (request, response, next) => {
	var err = []
	if(!request.body.sifre){
		err.push('Sifre girilmesi zorunludur.')
	}
	if(!request.body.kullanici_adi){
		err.push('Kullanici adi girilmesi zorunludur.')
	}
	if(err.length){
		response.status(400).json({'error': err.join(',')})
		return
	}
	var sql = 'SELECT * from kullanicilar where kullanici_adi = ?'
	var prm = [request.body.kullanici_adi]
	dbs.get(sql, prm, (error, row) => {
		if(error) {
			response.status(400).json({'error': response.message})
			return
		} else {
			if(!row){
				response.status(400).json({'error': 'Boyle bir kullanici yok'})
			} else {
				var psw = cry.compareSync(request.body.sifre, row.sifre)
				if(psw){
					var tkn = jwt.sign({id: this.lastID}, cfg.secret, {
				    expiresIn: 86400
				  })
					var dat = {
						kullanici_adi: request.body.kullanici_adi,
						sifre: cry.hashSync(request.body.sifre, 8),
				    token: tkn
					}
				} else {
					response.status(400).json({'error': 'Dogrulama basarisiz oldu'})
					return
				}
				response.status(201).json({'message': 'success', 'auth' : true, 'token': dat.token, 'token_expires_in': dat.token_expires_in})
			}
		}
	})
})

// Belirli Kullanıcı Getirme İşlemi
app.get('/:id', (request, response, next) => {
	var tkn = request.headers['x-access-token']
	if(!tkn){
		return response.status(401).json({'auth': false, 'message': 'Erisim anahtari bulunamadi'})
	}
	jwt.verify(tkn, cfg.secret, function(error, decoded) {
		if(error){
			return response.status(401).json({'auth': false, 'message': 'Erisim anahtari gecersiz'})
		} else {
			var sql = 'SELECT * from kullanicilar where id = ?'
			var prm = [request.params.id]
			dbs.get(sql, prm, (error, rows) => {
				if(error) {
					response.status(400).json({'error': response.message})
					return
				} else {
					response.status(201).json({'message': 'success', 'data': rows})
				}
			})
		}
	})
})

// Belirli Kullanıcı Güncelleme İşlemi
app.put('/:id', (request, response, next) => {
	var tkn = request.headers['x-access-token']
	if(!tkn){
		return response.status(401).json({'auth': false, 'message': 'Erisim anahtari bulunamadi'})
	}
	jwt.verify(tkn, cfg.secret, function(error, decoded) {
		if(error){
			return response.status(401).json({'auth': false, 'message': 'Erisim anahtari gecersiz'})
		} else {
			var dat = {
				kullanici_adi: request.body.kullanici_adi,
				sifre: request.body.sifre ? cry.hashSync(request.body.sifre, 8) : undefined
			}
			var sql = 'UPDATE kullanicilar set kullanici_adi = coalesce(?, kullanici_adi), sifre = coalesce(?, sifre) WHERE id = ?'
			var prm = [dat.kullanici_adi, dat.sifre, request.params.id]
			dbs.run(sql, prm, (error, result) => {
				if(error){
					response.status(400).json({'error': response.message})
					return
				} else {
					response.status(201).json({'message': 'success', 'data': dat})
				}
			})
		}
	})
})

// Belirli Kullanıcı Silme İşlemi
app.delete('/:id', (request, response, next) => {
	var tkn = request.headers['x-access-token']
	if(!tkn){
		return response.status(401).json({'auth': false, 'message': 'Erisim anahtari bulunamadi'})
	}
	jwt.verify(tkn, cfg.secret, function(error, decoded) {
		if(error){
			return response.status(401).json({'auth': false, 'message': 'Erisim anahtari gecersiz'})
		} else {
			var sql = 'DELETE FROM kullanicilar WHERE id = ?'
			var prm = [request.body.id]
			dbs.run(sql, prm, (error, result) => {
				if(error){
					response.status(400).json({'error': response.message})
					return
				} else {
					response.status(201).json({'message': 'success', 'rows': this.changes})
				}
			})
		}
	})
})

module.exports = app;
