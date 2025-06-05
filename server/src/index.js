import app from "./app.js";
import { env } from "./config/config.js";
import connectDB from "./db/db.js";

const envPORT = Number(env.port ?? 3000);

connectDB()
  .then(() =>
    app.listen(envPORT, () => {
      console.log(`Server running at port ${envPORT}`);
    }),
  )
  .catch((err) => {
    console.log("index.js err");
  });
