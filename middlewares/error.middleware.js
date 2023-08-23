const errorHandler = (err, req, res, next) => {
  console.log(err);

  let customError = {
    statusCode: err.statusCode || 500,
    msg: err.message || "Something went wrong, please try again later",
  };

  // render only for production
  // const errorMessages = [
  //   'jwt expired',
  //   'Invalid access token',
  //   'jwt malformed',
  //   'your session has expired. please log in',
  //   'you already logout',
  // ];
  // if (
  //   errorMessages.includes(customError.msg) ||
  //   (customError.statusCode !== 403 &&
  //     customError.statusCode !== 404 &&
  //     customError.statusCode !== 500)
  // ) {
  //   return res.status(customError.statusCode).json({ msg: customError.msg });
  // }

  // return res.status(customError.statusCode).render('error', {
  //   msg: customError.msg,
  // });

  // api only for development
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandler;
