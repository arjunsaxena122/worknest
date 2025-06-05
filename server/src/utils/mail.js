import { env } from "../config/config.js";

const sendCustomMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://mailgen.js/",
    },
  });

  const htmlEmail = mailGenerator.generate(options.mailGen);
  const plainTextEmail = mailGenerator.generatePlainText(options.mailGen);

  const transporter = nodemailer.createTransport({
    host: env.mailtrap_host,
    port: env.mailtrap_port,
    secure: false,
    auth: {
      user: env.mailtrap_auth_user,
      pass: env.mailtrap_auth_pass,
    },
  });

  await transporter.sendMail({
    from: options.fromSender,
    to: options.toReceiver,
    subject: options.subject,
    text: plainTextEmail,
    html: htmlEmail,
  });
};

const emailVerificationCustomMail = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to my website! We're very excited to have you on board.",
      action: {
        instructions: "To get started with website, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your account",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

//* sendCustomMail({
//*   mailGen: emailVerificationCustomMail("arjunsaxena", "http://localhost:3000"),
//*   fromSender: "arjunsaxena122@gmail.com",
// *  toReceiver: "deepak@gmail.com",
// *  subject: "time pass time pass ....",
//* });
