express = require 'express'
app = express()
zip = require 'extract-zip'
t = require './main'
multer = require 'multer'

sending = ->
  console.log 'sending...'
#  files = t.Template.onlyNeeded 'tmp/', true
#  t.Template.sendToUkd files

storage = multer.diskStorage {
  destination: (req, file, cb) ->
    cb null, './tmp',
  filename: (req, file, cb) ->
    cb null, file.originalname
}
upload = multer { storage:storage }
app.set 'views', './templates'
app.set 'view engine', 'jade'
app.use express.static 'bootstrap'

app.get '/', (req, res) ->
  res.render 'layout', {title: 'Hello'}

app.post '/', upload.single('avatar'), (req, res) ->
  zip "tmp/1.zip", {dir: "tmp"}, (err) ->
    if err then console.log err
    t.Template.resizeDir ->
      sending()
    t.Template.parseDocx "tmp/", "2.docx", (parsed) ->
      res.render 'index', {parsed: parsed}

server = app.listen 3001, ->
  host = server.address().address
  port = server.address().port

  console.log "Example app listening on http://#{host}:#{port}"
