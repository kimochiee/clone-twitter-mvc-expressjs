require('dotenv').config();

const express = require('express');
const app = express();

const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const viewRouter = require('./routes/view.routes');
const authRouter = require('./routes/auth.routes');
const postRouter = require('./routes/post.routes');
const userRouter = require('./routes/user.routes');
const CustomError = require('./utils/customError');
const errorHandler = require('./middlewares/error.middleware');

// set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// serve static file
app.use(express.static(`${__dirname}/public`));

// basic middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());
app.options('*', cors());

// routes
app.use('/', viewRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

// handle error
app.all('*', (req, res) => {
  throw new CustomError(`Can't find ${req.originalUrl} on this server!`, 404);
});
app.use(errorHandler);

module.exports = app;
