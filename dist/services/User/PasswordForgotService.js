"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasswordForgotService = void 0;
var _prisma = _interopRequireDefault(require("../../prisma"));
var _path = require("path");
var _fs = _interopRequireDefault(require("fs"));
var _nodemailer = _interopRequireDefault(require("nodemailer"));
var _handlebars = _interopRequireDefault(require("handlebars"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class PasswordForgotService {
  async execute({
    email
  }) {
    if (!email) {
      throw new Error("Insira o email");
    }
    const user = await _prisma.default.user.findFirst({
      where: {
        email: email
      },
      include: {
        space: true,
        client: true,
        professional: true
      }
    });
    if (!user) {
      throw new Error("Email não cadastrado");
    }
    let name = "";
    if (user.role == "CLIENT") {
      name = user.client.name;
    }
    if (user.role == "SPACE") {
      name = user.space.name;
    }
    if (user.role == "PROFESSIONAL") {
      name = user.professional.name;
    }
    const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
    await _prisma.default.passwordForgot.create({
      data: {
        email: email,
        code: String(code)
      }
    });
    const path = (0, _path.resolve)(__dirname, "..", "..", "views", "forgotPassword.hbs");
    const templateFileContent = _fs.default.readFileSync(path).toString("utf-8");
    const templateParse = _handlebars.default.compile(templateFileContent);
    const templateHTML = templateParse({
      code,
      name: name
    });
    var transport = await _nodemailer.default.createTransport({
      host: "smtp.mailersend.net",
      service: "mailersend",
      port: 587,
      secure: false,
      auth: {
        user: "MS_QCvKLv@evofitapp.com.br",
        pass: "VcNnDfD9bA20HI2j"
      }
    });
    await transport.sendMail({
      from: {
        name: "Equipe EvoFit",
        address: "no-reply@evofitapp.com.br"
      },
      to: {
        name: user["name"],
        address: user['email']
      },
      subject: "[EvoFit] Recuperação de senha",
      html: templateHTML
    });
    return;
  }
}
exports.PasswordForgotService = PasswordForgotService;