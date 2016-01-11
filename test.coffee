fs = require 'fs'
size = require 'jpeg-size'

files = fs.readdirSync './pic'
for file in files
  do(file) ->
#    console.log "./pic/#{file}"
    buf = fs.readFileSync "./pic/#{file}"
    pic = size buf
    console.log file, pic.width, pic.height
