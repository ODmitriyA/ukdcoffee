(function() {
  var config, fs, size;

  fs = require('fs');

  size = require('jpeg-size');

  config = require('./config');

  console.log(config.get('host'));

}).call(this);
