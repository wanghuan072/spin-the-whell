import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";

const env = getEnv();
createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
