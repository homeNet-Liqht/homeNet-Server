const url = require("node:url");
const { Buffer } = require("buffer");
const generateLink = (baseUrl, id) => {
  baseUrl = baseUrl.toString();
  const encodedId = Buffer.from(id.toString()).toString("base64");
  return url.resolve(baseUrl, `/family-group/${encodedId}`);
};

module.exports = generateLink;
