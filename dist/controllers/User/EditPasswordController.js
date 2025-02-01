"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditPasswordUserController = void 0;
var _EditPasswordUserService = require("../../services/User/EditPasswordUserService");
class EditPasswordUserController {
  async handle(req, res) {
    const {
      new_password,
      old_password
    } = req.body;
    let userId = req.userId;
    const editPasswordUserService = new _EditPasswordUserService.EditPasswordUserService();
    const user = await editPasswordUserService.execute({
      new_password,
      old_password,
      userId
    });
    return res.json(user);
  }
}
exports.EditPasswordUserController = EditPasswordUserController;