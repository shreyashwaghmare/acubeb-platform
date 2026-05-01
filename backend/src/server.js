require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5050;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`A Cube B backend running on port ${PORT}`);
});