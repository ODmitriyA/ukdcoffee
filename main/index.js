(function() {
  var Template, async, config, fs, ftp, im, mammoth, size;

  im = require('imagemagick');

  fs = require('fs');

  mammoth = require('mammoth');

  ftp = require('ftp');

  async = require('async');

  config = require('../config');

  size = require('jpeg-size');

  Template = {
    dateNow: function() {
      var date, date_now, day, month;
      date = new Date();
      day = '';
      month = '';
      if (date.getDate().toString().length < 2) {
        day = '0';
      }
      if (date.getMonth().toString().length < 2) {
        month = '0';
      }
      return date_now = "" + day + (date.getDate()) + month + (date.getMonth() + 1) + (date.getFullYear());
    },
    onlyNeeded: function(dir, small) {
      var f, file, files, _fn, _i, _len;
      f = [];
      files = fs.readdirSync(dir);
      _fn = function(file) {
        if (file.substr(-3).toUpperCase() === 'JPG') {
          if (small && file.match(/small/)) {
            f.push(file);
          }
          if (!file.match(/small/)) {
            return f.push(file);
          }
        }
      };
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _fn(file);
      }
      return f;
    },
    parseDocx: function(dir, file, callback) {
      var fullTxt;
      fullTxt = [];
      fullTxt.push({
        type: 'date',
        date_now: Template.dateNow()
      });
      return mammoth.extractRawText({
        path: "" + dir + file
      }).then(function(result) {
        var c, tmp, _fn, _i, _len;
        tmp = result.value.split('\n\n');
        _fn = function(c) {
          var photos;
          if (c !== '') {
            if (c.match(/^Фото /)) {
              photos = c.substring(5).split(', ');
              return fullTxt.push({
                type: 'photo',
                data: photos
              });
            } else {
              return fullTxt.push({
                type: 'paragraph',
                data: c
              });
            }
          }
        };
        for (_i = 0, _len = tmp.length; _i < _len; _i++) {
          c = tmp[_i];
          _fn(c);
        }
        return callback(fullTxt);
      }).done(function() {});
    },
    resizeDir: function(cb) {
      var files;
      files = Template.onlyNeeded('tmp/');
      return async.eachSeries(files, function(file, callback) {
        var buf, feauters, width;
        buf = fs.readFileSync("tmp/" + file);
        feauters = size(buf);
        if (feauters.width > feauters.height) {
          width = 600;
        } else {
          width = 300;
        }
        console.log("identify - " + file);
        return im.resize({
          srcPath: "tmp/" + file,
          dstPath: "tmp/small" + file,
          width: width
        }, function(err) {
          if (err) {
            callback(err);
          }
          console.log("converted - " + file);
          return callback();
        });
      }, function(err) {
        if (err) {
          cb(err);
        }
        return cb();
      });
    },
    sendToUkd: function(files) {
      var c, dir, putFtp;
      dir = 'ukdemidov.ru/www/files/img/';
      putFtp = function(file) {
        return c.put("tmp/" + file, "" + dir + (Template.dateNow()) + "/" + (file.toUpperCase()), function(err) {
          if (err) {
            return console.log(err);
          }
        });
      };
      c = new ftp();
      c.on('ready', function() {
        c.mkdir("" + dir + (Template.dateNow()), function(err) {
          var file, _i, _len, _results;
          if (err) {
            console.log(err);
          }
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            _results.push(putFtp(file));
          }
          return _results;
        });
        return c.end();
      });
      return c.connect({
        host: config.get('host'),
        user: config.get('user'),
        password: config.get('passwd')
      });
    }
  };

  exports.Template = Template;

}).call(this);
