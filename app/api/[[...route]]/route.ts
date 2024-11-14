import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import accounts from "./accounts"
import categories from "./categories"
import transactions from "./transactions";
import summary from "./summary";


export const runtime = 'edge'
//api route setup 
const app = new Hono().basePath('/api')

//setting the sub-routes
const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
 export const DELETE = handle(app);

//genrating RPC type: the client can call backend api in a type-safe manner
//it allows client to know what endpoints and types are available
export type AppType = typeof routes;