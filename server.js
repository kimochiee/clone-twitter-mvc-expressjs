const app = require("./app");
const connectDB = require("./config/connectDB");
const port = process.env.SERVER_PORT || 8001;

app.listen(port, async () => {
  try {
    await connectDB(process.env.MONGO_DB);
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
