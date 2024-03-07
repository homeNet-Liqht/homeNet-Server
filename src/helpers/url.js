const url = require("node:url");
const { Buffer } = require("buffer");
const generateLink = (baseUrl, id) => {
  baseUrl = baseUrl.toString();
  const encodedId = Buffer.from(id.toString()).toString("base64");
  return url.resolve(baseUrl, `/family/join/${encodedId}`);
};

const decodeLink = async (link) => {
  try {
    const decodedId = Buffer.from(link, "base64").toString("utf-8");
    return decodedId;
  } catch (error) {
    console.error("Error decoding link:", error);
    throw error;
  }
};

module.exports = { generateLink, decodeLink };
