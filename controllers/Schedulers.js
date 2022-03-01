const Diary = require("../modals/Diary");
const User = require("../modals/User");

const sendMail = require("../utils/nodemailer");

const emailScheduler = async (access_token) => {
  try {
    const number_of_users = await User.find().count();
    const diary_logs = await Diary.find().count();

    const mailOptions = {
      from: "appus1898@gmail.com",
      to: "25sreekanth@gmail.com",
      subject: "Diary application",
      text: `Application report.
              Number of users: ${number_of_users},
              Number of logs: ${diary_logs}`,
    };
    sendMail(access_token, mailOptions);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { emailScheduler };
