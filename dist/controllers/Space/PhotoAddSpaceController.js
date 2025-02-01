"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoAddSpaceController = void 0;
var _PhotoAddSpaceService = require("../../services/Space/PhotoAddSpaceService");
class PhotoAddSpaceController {
  async handle(req, res) {
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let userId = req.userId;
    const photoAddSpaceService = new _PhotoAddSpaceService.PhotoAddSpaceService();
    const photoSpace = await photoAddSpaceService.execute({
      userId,
      photo
    });
    if (photoSpace["photo"]) {
      photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
    }
    return res.json(photoSpace);
  }
}
exports.PhotoAddSpaceController = PhotoAddSpaceController;