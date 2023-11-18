const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      res.status(401).json({
        message: "Not authorized, Token invalid!",
      });
    }
  } else {
    res.status(401).json({
      message: "Not authorized, Token invalid!",
    });
  }
};

module.exports = verifyToken;
