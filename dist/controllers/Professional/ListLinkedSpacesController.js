"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ListLinkedSpacesController = void 0;
var _ListLinkedSpacesService = require("../../services/Professional/ListLinkedSpacesService");
class ListLinkedSpacesController {
  async handle(req, res) {
    let userId = req.userId;
    const listLinkedSpacesService = new _ListLinkedSpacesService.ListLinkedSpacesService();
    const spaces = await listLinkedSpacesService.execute({
      userId
    });
    spaces.map(item => {
      if (item.space["photo"]) {
        item.space["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item.space["photo"];
      }
    });
    return res.json(spaces);
  }
}
exports.ListLinkedSpacesController = ListLinkedSpacesController;