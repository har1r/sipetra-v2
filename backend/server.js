require("dotenv").config();
const app = require("./app");

app.listen(5000, () => {
  console.log("🚀 Server berjalan di http://localhost: 5000");
});
