"use strict";

const	createError     = require('http-errors'),
		express         = require('express'),
		path            = require('path'),
		cookieParser    = require('cookie-parser'),
		logger          = require('morgan'),
		cors 			= require('cors'),
		whitelist		= require('../config/variables').whitelist,
		adminIPs		= require('../config/variables').adminIPs,
		corsOptions		= {
								origin: function (origin, callback) {
									if (whitelist.indexOf(origin) !== -1 || !origin) {
										callback(null, true)
									} else {
										callback(new Error('Not allowed by CORS ' + origin))
									}
								}
							},
		app             = express(),
		blogApiRouter   = require('./routes/blog/api/index'),
		blogDS          = require('./utilities/mysql').connection,
		blogObject      = require("./models/blog/index").blog,
		blogModel		= new blogObject(blogDS),
		blogAdminRouter	= require('./routes/blog/api/admin'),
		blogAdminObject	= require("./models/blog/admin").blogAdmin,
		blogAdminModel	= new blogAdminObject(blogDS);

// Set connected blog datasource to a global reusable connection
app.set("blogDS", blogDS);
app.set('blogModel', blogModel);
app.set('blogAdminModel', blogAdminModel);


app.set('adminIPs', adminIPs);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.enable('trust proxy');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));

// Define routes access from URL
app.use('/blog/api/admin', blogAdminRouter);
app.use('/blog/api', blogApiRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
	next(createError(500));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  next();
});

module.exports = app;