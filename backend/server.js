require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Running the Database
connectDB()

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost: ${PORT}`);
});
