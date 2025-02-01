"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoEditSpaceController = void 0;
var _PhotoEditSpaceService = require("../../services/Space/PhotoEditSpaceService");
class PhotoEditSpaceController {
  async handle(req, res) {
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let {
      id
    } = req.params;
    const photoEditSpaceService = new _PhotoEditSpaceService.PhotoEditSpaceService();
    const photoSpace = await photoEditSpaceService.execute({
      id,
      photo
    });
    if (photoSpace["photo"]) {
      photoSpace["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + photoSpace["photo"];
    }
    return res.json(photoSpace);
  }
}
exports.PhotoEditSpaceController = PhotoEditSpaceController;