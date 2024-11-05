const platform = require("@nucleoidai/platform-express");
const { get, post } = platform.require("axios").default;
const constants = require("./constants");
const FormData = require("form-data");

async function getGitAccessToken(code) {
  const data = new FormData();
  data.append("client_id", constants.client_id);
  data.append("client_secret", constants.client_secret);
  data.append("code", code);

  const options = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  return post(constants.token_url, data, options);
}

async function getGitUser(token) {
  const options = {
    headers: {
      Authorization: `token ${token}`,
    },
  };

  return get(constants.user_url, options);
}

module.exports = { getGitAccessToken, getGitUser };
