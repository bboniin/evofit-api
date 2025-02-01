"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassesScheduleProfessionalController = void 0;
var _ClassesScheduleProfessionalService = require("../../services/Schedule/ClassesScheduleProfessionalService");
class ClassesScheduleProfessionalController {
  async handle(req, res) {
    const userId = req.userId;
    const {
      date
    } = req.query;
    const classesScheduleProfessionalService = new _ClassesScheduleProfessionalService.ClassesScheduleProfessionalService();
    const schedules = await classesScheduleProfessionalService.execute({
      date: new Date(String(date)),
      professionalId: userId
    });
    schedules.map(item => {
      if (item["client"]) {
        if (item["client"]["photo"]) {
          item["client"]["photo_url"] = "https://evofit-data.s3.us-east-1.amazonaws.com/" + item["client"]["photo"];
        }
      }
    });
    return res.json(schedules);
  }
}
exports.ClassesScheduleProfessionalController = ClassesScheduleProfessionalController;