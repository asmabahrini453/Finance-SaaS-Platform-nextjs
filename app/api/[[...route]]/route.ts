import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'


export const runtime = 'edge'

const app = new Hono().basePath('/api')

app
    .get('/hello', 
        clerkMiddleware()
        ,(c) => {
            const auth =getAuth(c) 
            if (!auth?.userId){
                return c.json({error:"unauthorized access"})
            }
    return c.json({
        message: 'Hello Next.js!',
        userId:auth.userId
    })
    })
    .get('/hello/:test',
        zValidator(
            'param',
            z.object({
              test: z.string(),
            })
          ),
        (c)=>{
        const {test} = c.req.valid("param");
        return c.json({
            message:"hello",
            test:test
        })
    })
    .post("/",
        zValidator("json",z.object({
            name:z.string(),
            userId:z.number()
        })),
        (c)=>{
            const {name,userId} = c.req.valid("json");
            return c.json({})
        }
    )

export const GET = handle(app)
export const POST = handle(app)