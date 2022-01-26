import axios from "axios";

export const slackMsg = async (webhook: string, message: string) => {
  const options = {
    text: message,
  };
  axios
    .post(webhook, JSON.stringify(options))
    .then((res) => {
      return "Slack Updated";
    })
    .catch((err) => {
      return "Couldn't update Slack: " + err;
    });
};
