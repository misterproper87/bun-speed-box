import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db } from "../db";
import { links } from "../db/schema";
import { generateCode } from "../utils/code";

export const shortenRoutes = new Elysia()
  .post(
    "/shorten",
    async ({ body, set }) => {
      const code = generateCode();

      try {
        await db.insert(links).values({ code, url: body.url, createdAt: new Date() });
      } catch {
        set.status = 409;
        return { error: "Code collision, please retry" };
      }

      const base = `http://localhost:${process.env.PORT ?? 3000}`;
      return { code, shortUrl: `${base}/${code}` };
    },
    {
      body: t.Object({
        url: t.String({ format: "uri", description: "The URL to shorten" }),
      }),
    },
  )
  .get("/:code", async ({ params, redirect, set }) => {
    const [link] = await db.select().from(links).where(eq(links.code, params.code));

    if (!link) {
      set.status = 404;
      return { error: "Link not found" };
    }

    await db
      .update(links)
      .set({ visits: link.visits + 1 })
      .where(eq(links.code, params.code));

    return redirect(link.url, 302);
  })
  .get("/stats/:code", async ({ params, set }) => {
    const [link] = await db.select().from(links).where(eq(links.code, params.code));

    if (!link) {
      set.status = 404;
      return { error: "Link not found" };
    }

    return {
      code: link.code,
      url: link.url,
      visits: link.visits,
      createdAt: link.createdAt,
    };
  });
