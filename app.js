var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var userInfoRouter = require('./routes/users');
var dataEntryRouter = require('./routes/dataEntry');
var dataViewRouter = require('./routes/dataView');
var formRouter = require('./routes/form');
var exportRouter = require('./routes/dataExport');
var listRouter = require('./routes/list');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', userInfoRouter);
app.use('/data_entry', dataEntryRouter);
app.use('/data_view', dataViewRouter);
app.use('/form', formRouter);
app.use('/export', exportRouter);
app.use('/list', listRouter);

module.exports = app;
