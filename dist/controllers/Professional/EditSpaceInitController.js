"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditSpaceInitController = void 0;
var _EditSpaceInitService = require("../../services/Professional/EditSpaceInitService");
class EditSpaceInitController {
  async handle(req, res) {
    const {
      name,
      latitude,
      longitude,
      schedule,
      description,
      city,
      state,
      zipCode,
      address,
      number,
      neighborhood,
      complement
    } = req.body;
    const {
      spaceId
    } = req.params;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    const editSpaceInitService = new _EditSpaceInitService.EditSpaceInitService();
    const space = await editSpaceInitService.execute({
      spaceId,
      name,
      schedule,
      latitude: Number(latitude),
      longitude: Number(longitude),
      photo,
      description,
      city,
      state,
      zipCode,
      address,
      number,
      neighborhood,
      complement
    });
    if (space["photo"]) {
      space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
    }
    return res.json(space);
  }
}
exports.EditSpaceInitController = EditSpaceInitController;