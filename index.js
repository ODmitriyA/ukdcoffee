(function() {
  var app, bodyParser, express, fs, multer, sending, server, storage, t, upload, zip;

  express = require('express');

  app = express();

  zip = require('extract-zip');

  bodyParser = require('body-parser');

  t = require('./main');

  multer = require('multer');

  fs = require('fs');

  sending = function() {
    var files;
    console.log('sending...');
    files = t.Template.onlyNeeded('tmp/', true);
    return t.Template.sendToUkd(files);
  };

  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      return cb(null, './tmp');
    },
    filename: function(req, file, cb) {
      return cb(null, file.originalname);
    }
  });

  upload = multer({
    storage: storage
  });

  app.set('views', './templates');

  app.set('view engine', 'jade');

  app.use(express["static"]('bootstrap'));

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.get('/', function(req, res) {
    fs.readdir('./tmp', function(err, files) {
      var file, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _results.push((function(file) {
          return fs.unlink('tmp/' + file, function(err) {
            if (err) {
              return console.log(err);
            }
          });
        })(file));
      }
      return _results;
    });
    return res.render('layout', {
      title: 'Hello'
    });
  });

  app.post('/', upload.single('avatar'), function(req, res) {
    return zip("tmp/1.zip", {
      dir: "tmp"
    }, function(err) {
      if (err) {
        console.log(err);
      }
      t.Template.resizeDir(function() {
        if (req.body.sendFtp) {
          return sending();
        }
      });
      return t.Template.parseDocx("tmp/", "2.docx", function(parsed) {
        return res.render('index', {
          parsed: parsed
        });
      });
    });
  });

  server = app.listen(3001, function() {
    var host, port;
    host = server.address().address;
    port = server.address().port;
    return console.log("Example app listening on http://" + host + ":" + port);
  });

}).call(this);
