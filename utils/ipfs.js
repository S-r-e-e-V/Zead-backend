const fs = require("fs");
const IPFS = require("ipfs");

let node;
const createIPFS = async () => {
  node = await IPFS.create();
};
const addDataToIPFS = async (file) => {
  data = fs.readFileSync(file.path);
  // add your data to to IPFS - this can be a string, a Buffer,
  // a stream of Buffers, etc
  const result = await node.add(data);
  return result.path;
};

const getDataFromIPFS = async (hash) => {
  const stream = node.cat(hash);
  let data = "";
  for await (const chunk of stream) {
    // chunks of data are returned as a Buffer, convert it back to a string
    data += chunk.toString();
  }
  return data;
};

module.exports = { addDataToIPFS, getDataFromIPFS, createIPFS };
