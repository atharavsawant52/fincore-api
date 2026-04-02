const handleCastError = () => ({
  statusCode: 400,
  message: "Invalid resource identifier",
});

const handleDuplicateError = (error) => {
  const field = Object.keys(error.keyValue || {})[0] || "field";
  return {
    statusCode: 409,
    message: `${field} already exists`,
  };
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error.name === "CastError") {
    ({ statusCode, message } = handleCastError(error));
  }

  if (error.code === 11000) {
    ({ statusCode, message } = handleDuplicateError(error));
  }

  return res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
