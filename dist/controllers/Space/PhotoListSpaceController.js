"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhotoListSpaceController = void 0;
var _PhotoListSpaceService = require("../../services/Space/PhotoListSpaceService");
class PhotoListSpaceController {
  async handle(req, res) {
    let userId = req.userId;
    const photoListSpaceService = new _PhotoListSpaceService.PhotoListSpaceService();
    const photosSpace = await photoListSpaceService.execute({
      userId
    });
    photosSpace.map(item => {
      if (item["photo"]) {
        item["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["photo"];
      }
    });
    return res.json(photosSpace);
  }
}
exports.PhotoListSpaceController = PhotoListSpaceController;