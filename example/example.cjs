const { randUserAgent } = require("../dist/index.cjs");
const agent = randUserAgent("desktop");

console.log(agent);
