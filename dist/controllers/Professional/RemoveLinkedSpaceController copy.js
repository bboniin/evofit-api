"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoveLinkedSpaceController = void 0;
var _RemoveLinkedSpaceService = require("../../services/Professional/RemoveLinkedSpaceService");
class RemoveLinkedSpaceController {
  async handle(req, res) {
    const {
      id
    } = req.params;
    let userId = req.userId;
    const removeLinkedSpaceService = new _RemoveLinkedSpaceService.RemoveLinkedSpaceService();
    const user = await removeLinkedSpaceService.execute({
      id,
      userId
    });
    return res.json(user);
  }
}
exports.RemoveLinkedSpaceController = RemoveLinkedSpaceController;