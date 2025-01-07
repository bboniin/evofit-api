import prismaClient from '../../prisma'
import { resolve } from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import handlebars from "handlebars";

interface BodyRequest {
    email: string;
}

class PasswordForgotService {


    async execute({ email }: BodyRequest) {

        if (!email) {
            throw new Error("Insira o email")
        }

        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            },
            include: {
                space: true,
                client: true,
                professional: true
            }
        })

        if (!user) {
            throw new Error("Email não cadastrado")
        }

        let name = ""

        if(user.role == "CLIENT"){
            name = user.client.name
        }
        if(user.role == "SPACE"){
            name = user.space.name
        }
        if(user.role == "PROFESSIONAL"){
            name = user.professional.name
        }

        const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

        await prismaClient.passwordForgot.create({
            data: {
                email: email,
                code: String(code),
            }
        });

        const path = resolve(
            __dirname,
            "..",
            "..",
            "views",
            "forgotPassword.hbs"
        );

        const templateFileContent = fs.readFileSync(path).toString("utf-8");

        const templateParse = handlebars.compile(templateFileContent);

        const templateHTML = templateParse({
            code,
            name: name,
        });

        var transport = await nodemailer.createTransport({
            host: "smtp.mailersend.net",
            service: "mailersend",
            port: 587,
            secure: false,
            auth: {
                user: "MS_QCvKLv@evofitapp.com.br",
                pass: "VcNnDfD9bA20HI2j",
            },
        });

        await transport.sendMail({
            from: {
                name: "Equipe EvoFit",
                address: "no-reply@evofitapp.com.br",
            },
            to: {
                name: user["name"],
                address: user['email'],
            },
            subject: "[EvoFit] Recuperação de senha",
            html: templateHTML,
        });

        return;

    }
}

export { PasswordForgotService }