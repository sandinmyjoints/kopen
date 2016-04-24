var debug = require('debug')('kopen');

var express = require('express');
var bodyParser = require('body-parser')

var level = require('level');
var db = level('./db', {keyEncoding: 'json', valueEncoding: 'json'})
require('level-promise').install(db)


var PORT=3333;

var app = express()
app.use(bodyParser.json())

function itemKey (app, key) {
  if (!app && !key) return null;

  return `${app}:${key}`
}

app.get('/:app/:key', (req, res) => {
  var _itemKey = itemKey(req.params.app, req.params.key)
  debug('get ', _itemKey)

  if (!_itemKey) {
    return res.send(404)
  }

  db.get(_itemKey).then((value) => {
    return res.status(200).send(value)
  }).catch((err) => {
    var r = /Key not found in database/;
    var status = 500;
    if (r.test(err.message)) status = 404;

    var error = {
      error: err.message
    }

    return res.status(status).send(error)
  })
})

app.put('/:app/:key', (req, res) => {
  var _itemKey = itemKey(req.params.app, req.params.key)
  var val = req.body
  debug('put', _itemKey, val)

  db.put(_itemKey, val).then(() => {
    return res.status(200).send()
  }).catch((err) => {
    var error = {
      error: err.message
    }
    return res.status(500).send(error)
  })
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);

})
