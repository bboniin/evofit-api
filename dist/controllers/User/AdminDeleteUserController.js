"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminDeleteUserController = void 0;
var _AdminDeleteUserService = require("../../services/User/AdminDeleteUserService");
class AdminDeleteUserController {
  async handle(req, res) {
    const {
      idDelete
    } = req.body;
    const userId = req.userId;
    const admindeleteUserService = new _AdminDeleteUserService.AdminDeleteUserService();
    const user = await admindeleteUserService.execute({
      userId,
      idDelete
    });
    return res.json(user);
  }
}
exports.AdminDeleteUserController = AdminDeleteUserController;