const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.token;
    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        message: "Authentication failed!",
      },
    });
  }
};
module.exports = authenticate;
