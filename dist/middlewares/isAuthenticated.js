"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuthenticated = isAuthenticated;
var _jsonwebtoken = require("jsonwebtoken");
var _auth = _interopRequireDefault(require("./../utils/auth"));
var _prisma = _interopRequireDefault(require("../prisma"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function isAuthenticated(req, res, next) {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({
      message: 'Token não enviado'
    });
  }
  const [, token] = authToken.split(' ');
  try {
    const {
      sub
    } = (0, _jsonwebtoken.verify)(token, _auth.default.jwt.secret);
    req.userId = sub;
    const user = await _prisma.default.user.findUnique({
      where: {
        id: req.userId
      }
    });
    if (!user) {
      return res.status(401).json({
        message: 'Usuário não existe'
      });
    }
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Internal server Error'
    });
  }
}