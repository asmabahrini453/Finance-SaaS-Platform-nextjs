import { z } from "zod";
import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import {HTTPException} from "hono/http-exception"

import { db } from "@/db/drizzle";
import { accounts,  } from "@/db/schema";

const app = new Hono()

  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
  
    if (!auth?.userId) {
      //httpException used to manage not only errrors but to also provide 1 output 
      //instead of having  2 outputs : 1:error / 2: data => better managing of RPC
      throw new HTTPException(401,
        {res:c.json({ error: "Unauthorized" }, 401)}
      );
    }
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId)); //eq=equals
    return c.json({data });
  });



export default app;
