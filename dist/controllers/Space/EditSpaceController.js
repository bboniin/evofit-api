"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditSpaceController = void 0;
var _EditSpaceService = require("../../services/Space/EditSpaceService");
class EditSpaceController {
  async handle(req, res) {
    const {
      name,
      city,
      state,
      enableDiarie,
      valueDiarie,
      zipCode,
      address,
      number,
      complement,
      phoneNumber,
      latitude,
      longitude,
      description,
      email,
      schedule,
      type
    } = req.body;
    let photo = "";
    if (req.file) {
      photo = req.file.filename;
    }
    let userId = req.userId;
    const editSpaceService = new _EditSpaceService.EditSpaceService();
    const space = await editSpaceService.execute({
      name,
      city,
      state,
      valueDiarie: valueDiarie ? Number(valueDiarie) : 0,
      enableDiarie: enableDiarie == "true",
      zipCode,
      address,
      number,
      complement,
      phoneNumber,
      latitude: latitude ? Number(latitude) : 0,
      longitude: longitude ? Number(longitude) : 0,
      description,
      photo,
      email,
      schedule,
      type,
      userId
    });
    if (space["photo"]) {
      space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + space["photo"];
    }
    return res.json(space);
  }
}
exports.EditSpaceController = EditSpaceController;