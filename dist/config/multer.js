"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _crypto = _interopRequireDefault(require("crypto"));
var _multer = _interopRequireDefault(require("multer"));
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const tmpFolder = _path.default.resolve(__dirname, '..', '..', 'tmp');
var _default = exports.default = {
  directory: tmpFolder,
  storage: _multer.default.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      const fileHash = _crypto.default.randomBytes(16).toString("hex");
      const filename = `${fileHash}=${file.originalname}`;
      return callback(null, filename);
    }
  })
};