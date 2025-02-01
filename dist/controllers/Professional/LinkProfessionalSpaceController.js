"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkProfessionalSpaceController = void 0;
var _LinkProfessionalSpaceService = require("../../services/Professional/LinkProfessionalSpaceService");
class LinkProfessionalSpaceController {
  async handle(req, res) {
    const {
      spaceId
    } = req.params;
    let userId = req.userId;
    const linkProfessionalSpaceService = new _LinkProfessionalSpaceService.LinkProfessionalSpaceService();
    const user = await linkProfessionalSpaceService.execute({
      userId,
      spaceId
    });
    return res.json(user);
  }
}
exports.LinkProfessionalSpaceController = LinkProfessionalSpaceController;