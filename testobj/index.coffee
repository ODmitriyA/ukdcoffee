class Animal

  constructor: (@dir) ->

  dateNow: ->
    date = new Date()
    day = ''
    month = ''
    if date.getDate().toString().length < 2 then day = '0'
    if date.getMonth().toString().length < 2 then month = '0'
    date_now =
      "#{day}#{date.getDate()}#{month}#{date.getMonth()+1}#{date.getFullYear()}"

exports.Animal = Animal
