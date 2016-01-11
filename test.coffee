fs = require 'fs'
size = require 'jpeg-size'

files = fs.readdirSync './tmp'
for file in files
  do(file) ->
#    console.log "./pic/#{file}"
    buf = fs.readFileSync "./tmp/#{file}"
    pic = size buf
    console.log file, pic.width, pic.height
