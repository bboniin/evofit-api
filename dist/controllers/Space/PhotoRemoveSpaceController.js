"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoRemoveSpaceController = void 0;
var _PhotoRemoveSpaceService = require("../../services/Space/PhotoRemoveSpaceService");
class PhotoRemoveSpaceController {
  async handle(req, res) {
    const {
      id
    } = req.params;
    let userId = req.userId;
    const photoRemoveSpaceService = new _PhotoRemoveSpaceService.PhotoRemoveSpaceService();
    const photoSpace = await photoRemoveSpaceService.execute({
      id,
      userId
    });
    if (photoSpace["photo"]) {
      photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
    }
    return res.json(photoSpace);
  }
}
exports.PhotoRemoveSpaceController = PhotoRemoveSpaceController;