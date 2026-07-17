import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.titan.email',
  port: 465,
  secure: true, // implicit TLS on 465
  auth: {
    user: process.env.TITAN_SMTP_USER, // e.g. dispatch@daxini.xyz
    pass: process.env.TITAN_SMTP_PASS,
  },
});

export { transporter };
