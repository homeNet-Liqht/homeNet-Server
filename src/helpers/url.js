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

    const endIndex = decodedId.search(/[^a-zA-Z0-9]/);

    const cleanId = endIndex !== -1 ? decodedId.slice(0, endIndex) : decodedId;
    return cleanId;
  } catch (error) {
    console.error("Error decoding link:", error);
    throw error;
  }
};

module.exports = { generateLink, decodeLink };
