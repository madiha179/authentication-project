import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { htmlToText } from "html-to-text";
import nodemailer from "nodemailer";
import Brevo from "@getbrevo/brevo";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class Email {
    to;
    firstName;
    from;
    otp;
    constructor(user, otp) {
        this.to = user.email;
        this.firstName = user.name.split(" ")[0] || "User";
        this.otp = otp;
        this.from = process.env.EMAIL_FROM;
    }
    async send(template, subject) {
        const htmlPath = path.resolve(__dirname, "../views", `${template}.html`);
        if (!fs.existsSync(htmlPath)) {
            throw new Error(`Email template not found at path: ${htmlPath}`);
        }
        let html = fs.readFileSync(htmlPath, "utf-8");
        html = html
            .replace("{{firstName}}", this.firstName)
            .replace("{{otp}}", this.otp.toString());
        const textContent = htmlToText(html);
        try {
            if (process.env.NODE_ENV === "production") {
                const apiInstance = new Brevo.TransactionalEmailsApi();
                apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
                await apiInstance.sendTransacEmail({
                    sender: { email: this.from, name: "projects" },
                    to: [{ email: this.to }],
                    subject,
                    htmlContent: html,
                    textContent,
                });
            }
            else {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: Number(process.env.EMAIL_PORT),
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                await transporter.sendMail({
                    to: this.to,
                    from: this.from,
                    subject,
                    html,
                    text: textContent,
                });
            }
        }
        catch (err) {
            console.error("Email send error:", err);
            throw new Error("There was an error sending the email.");
        }
    }
    async sendResetEmail() {
        await this.send("resetEmail", "Send OTP Reset Password");
    }
}
