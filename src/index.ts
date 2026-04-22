import { Elysia } from "elysia";
import { shortenRoutes } from "./routes/shorten";

export const app = new Elysia()
  .get("/", () => ({ name: "bun-speed-box", version: "1.0.0" }))
  .use(shortenRoutes)
  .listen(process.env.PORT ?? 3000);

console.log(`bun-speed-box running at http://localhost:${app.server?.port}`);

export type App = typeof app;
