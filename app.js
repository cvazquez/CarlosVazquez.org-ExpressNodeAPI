"use strict";

const	createError     = require('http-errors'),
		express         = require('express'),
		path            = require('path'),
		cookieParser    = require('cookie-parser'),
		logger          = require('morgan'),
		cors 			= require('cors'),
		corsOptions		= {
							origin: 'http://api.carlosvazquez.org',
							optionsSuccessStatus: 200
						},
		app             = express(),
		indexRouter     = require('./routes/index'),
		usersRouter     = require('./routes/users'),
		blogIndexRouter = require('./routes/blog/index'),
		blogApiRouter   = require('./routes/blog/api'),
		blogDS          = require('./utilities/mysql').connection,
		blogModel       = require("./models/blog")(blogDS);


// Set connected blog datasource to a global reusable connection
app.set("blogDS", blogDS);
app.set('blogModel', blogModel);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));

// Define routes access from URL
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blog/api', blogApiRouter);
app.use('/blog/', blogIndexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;