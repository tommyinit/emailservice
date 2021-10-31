import express from "express";
import path from "path";
import mailgun, { messages } from "mailgun-js"
import sgMail from "@sendgrid/mail"
import { EmailData } from "./interface";
import { mailgunCfg } from "./emailServiceCfg/mailgunConfig";
import { sendGridCfg } from "./emailServiceCfg/sendGridConfig";
import Joi from "joi"

const mg = mailgun({apiKey: mailgunCfg.API_KEY, domain: mailgunCfg.DOMAIN}).messages();
sgMail.setApiKey(sendGridCfg.API_KEY)

const app = express();

// Setup view engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index'));

app.post('/sendemail', async(req, res, next) => {
    const { error } = validateInput(req.body);
    if (error) {
        res.status(400).render('error', { error });
        return;
    }

    const body = Object.fromEntries(
        Object.entries(req.body).filter(
            ([key, value]) => value !== '')
    )
    const data = {
        from: "Test account <test@gmail.com>",
        ...body
    } as EmailData;

    try {
        await sendViaMailGun(data);
        res.render('submitted', { email : req.body.to });
    } catch (error) {
        try {
            await sendViaSendGrid(data)
            res.render('submitted', { email : req.body.to });
        } catch (e) {
            res.render('error', { error });
        }
    }
});

app.listen(process.env.PORT || 8080);

const sendViaMailGun = async (data: EmailData) => {
    try {
        await mg.send(data)
        // tslint:disable-next-line:no-console
        console.log("Email sent successfully via MailGun");
    } catch (mailGunError) {
        // tslint:disable-next-line:no-console
        console.log("Email sent unsuccessfully via MailGun. Error detail: ", mailGunError);
        throw mailGunError;
    }
};

const sendViaSendGrid = async (data: EmailData) => {
    try {
        await sgMail.send(data)
        // tslint:disable-next-line:no-console
        console.log("Email sent successfully via SendGrid");
    } catch (sendGridError) {
        // tslint:disable-next-line:no-console
        console.log("Email sent unsuccessfully via SendGrid. Error detail: ", sendGridError);
        throw sendGridError;
    }
};

const validateInput = (inputPayload: EmailData) => {
    const inputSchema = Joi.object({
        to: Joi.string().email().required(),
        cc: Joi.string().allow('').email(),
        bcc: Joi.string().allow('').email(),
        subject: Joi.string().min(5).max(50).required(),
        text: Joi.string().min(5).max(1000).required()
    })
    return inputSchema.validate(inputPayload)
}