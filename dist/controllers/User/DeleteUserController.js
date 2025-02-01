"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeleteUserController = void 0;
var _DeleteUserService = require("../../services/User/DeleteUserService");
class DeleteUserController {
  async handle(req, res) {
    const {
      password
    } = req.body;
    const userId = req.userId;
    const deleteUserService = new _DeleteUserService.DeleteUserService();
    const user = await deleteUserService.execute({
      userId,
      password
    });
    return res.json(user);
  }
}
exports.DeleteUserController = DeleteUserController;