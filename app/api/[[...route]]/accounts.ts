import { z } from "zod";
import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema,  } from "@/db/schema";

const app = new Hono()
  //get all accounts
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
  
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }  
     
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId)); //eq=equals
    return c.json({data });
  })

  //create account
  .post(
    "/",
    clerkMiddleware(),
    //validating the json inputs
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      //validating the name input
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(), //it's a CUid
          userId: auth.userId,
          ...values,
        })
        .returning(); //the 'insert' by default doesn't return anything=> that's why we use returning()
      return c.json({ data });
       //RQ: drizzle always returns an array (like sql) we can say data[0] if we want the first elem
    }
  )
  //bulk-delete is deleting an array of selected ids that's why we use POST and not DELETE
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(accounts.userId, auth.userId),
            inArray(accounts.id, values.ids)
          )
        )
        .returning({
          id: accounts.id,
        });
      return c.json({ data });
    }
  )


export default app;
