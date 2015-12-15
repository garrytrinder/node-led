var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var GPIO = require('onoff').Gpio;
var led = new GPIO(18, 'out');

app.io.on('connection', function (socket) {

  console.log('client connected');

  app.io.sockets.emit('users', app.io.engine.clientsCount);

  led.read(function (err, value) {
    app.io.sockets.emit('led', { led: value });
  });

  socket.on('disconnect', function () {
    console.log('client disconnected');
    app.io.sockets.emit('users', app.io.engine.clientsCount);
  });

  socket.on('led', function (data) {
    console.log('led changed: %O', data);
    led.writeSync(data.led);
    app.io.sockets.emit('led', data);
  });

});

function exit() {
  console.log('Cleaning up GPIO before exiting...');
  led.unexport();
  process.exit();
}

process.on('SIGINT', exit);

module.exports = app;