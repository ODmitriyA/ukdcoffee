im =      require 'imagemagick'
fs =      require 'fs'
mammoth = require 'mammoth'
ftp =     require 'ftp'
async =   require 'async'
config = require '../config'
size = require 'jpeg-size'

Template = {

  dateNow: ->
    date = new Date()
    day = ''
    month = ''
    if date.getDate().toString().length < 2 then day = '0'
    if date.getMonth().toString().length < 2 then month = '0'
    date_now =
      "#{day}#{date.getDate()}#{month}#{date.getMonth()+1}#{date.getFullYear()}"

  onlyNeeded: (dir, small) ->
    f = []
    files = fs.readdirSync dir
    for file in files
      do(file) ->
        if file.substr(-3).toUpperCase() == 'JPG'
          f.push file if small and file.match /small/
          f.push file if !file.match /small/
    f

  parseDocx: (dir, file, callback) ->
    fullTxt = []
    fullTxt.push {type: 'date', date_now: Template.dateNow()}
    mammoth.extractRawText {path: "#{dir}#{file}"}
    .then (result) ->
      tmp = result.value.split('\n\n')
      for c in tmp
        do (c) ->
          if c != ''
            if c.match /^Фото /
              photos = c.substring(5).split(', ')
              fullTxt.push {type: 'photo', data: photos}
            else
              fullTxt.push {type: 'paragraph', data: c}
      callback(fullTxt)
    .done ->

  resizeDir: (cb) ->
    files = Template.onlyNeeded 'tmp/'
    async.eachSeries files, (file, callback) ->
      buf = fs.readFileSync "tmp/#{file}"
      feauters = size buf
      if feauters.width > feauters.height
        width = 600
      else
        width = 300
      console.log "identify - #{file}"
      im.resize {
        srcPath: "tmp/#{file}"
        dstPath: "tmp/small#{file}"
        width: width
        }, (err) ->
          if err then callback err
          console.log "converted - #{file}"
          callback()
    ,
    (err) ->
      if err then cb(err)
      cb()

  sendToUkd: (files) ->
    dir = 'ukdemidov.ru/www/files/img/'

    putFtp = (file) ->
      c.put "tmp/#{file}",
        "#{dir}#{Template.dateNow()}/#{file.toUpperCase()}", (err) ->
        if err then console.log err

    c = new ftp()
    c.on 'ready', ->
      c.mkdir "#{dir}#{Template.dateNow()}", (err) ->
        if err then console.log err
        putFtp file for file in files
      c.end()
    c.connect {
      host: config.get 'host'
      user: config.get 'user'
      password: config.get 'passwd'

    }
}

exports.Template = Template
