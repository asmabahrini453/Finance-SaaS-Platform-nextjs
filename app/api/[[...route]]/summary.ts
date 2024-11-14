import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { subDays, parse, differenceInDays } from "date-fns";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";
import { calculatePercentage, fillMissingDays } from "@/lib/utils";

const app = new Hono()
//get summary data
    .get(
    "/",
    clerkMiddleware(),
    zValidator(
        "query",
        z.object({
            //date & account id
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
        })
    ),
    async (c) => {
        const auth = getAuth(c);
        const { from, to, accountId } = c.req.valid("query");

        if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
        }
        //default date range
        const defaultTo = new Date();//default "to" hia today
        const defaultFrom = subDays(defaultTo, 30); //default "from" hia 30 days ago

        const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

        const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;
        //calculate periods
        const periodLength = differenceInDays(endDate, startDate) + 1;
        const lastPeriodStart = subDays(startDate, periodLength);
        const lastPeriodEnd = subDays(endDate, periodLength);
    // Func to fetch income, expenses, and remaining balance
        async function fetchFinancialData(
        userId: string,
        startDate: Date,
        endDate: Date
        ) {
        return await db
            .select({
            income:
                sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
                Number
                ),
            expenses:
                sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
                Number
                ),
            remaining: sum(transactions.amount).mapWith(Number),
            })
            .from(transactions)
            .innerJoin(accounts, eq(transactions.accountId, accounts.id))
            .where(
            and(
                accountId ? eq(transactions.accountId, accountId) : undefined,
                eq(accounts.userId, userId),
                gte(transactions.date, startDate),
                lte(transactions.date, endDate)
            )
            );
        }
  // Fetch current and last period financial data
        const [currentPeriod] = await fetchFinancialData(
        auth.userId,
        startDate,
        endDate
        );
        const [lastPeriod] = await fetchFinancialData(
        auth.userId,
        lastPeriodStart,
        lastPeriodEnd
        );
    // Calculate percentage changes 
        const incomeChange = calculatePercentage(
        currentPeriod.income,
        lastPeriod.income
        );
        const expensesChange = calculatePercentage(
        currentPeriod.expenses,
        lastPeriod.expenses
        );
        const remainingChange = calculatePercentage(
        currentPeriod.remaining,
        lastPeriod.remaining
        );
    // get top spending categories
        const category = await db
        .select({
            name: categories.name,
            value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
            and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            lt(transactions.amount, 0),// Only negative amounts => expenses
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
            )
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));

        const topCategories = category.slice(0, 3); //top 3 categories
        const otherCategories = category.slice(3);
        const otherSum = otherCategories.reduce(
        (sum, current) => sum + current.value,
        0
        );
        const finalCategories = topCategories;
        if (otherCategories.length > 0) {
        finalCategories.push({
            name: "Other",
            value: otherSum,
        });
        }
        // active days' income and expenses within the period
        const activeDays = await db
        .select({
            date: transactions.date,
            income:
            sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
                Number
            ),
            expenses:
            sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(
                Number
            ),
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
            and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
            )
        )
        .groupBy(transactions.date)
        .orderBy(transactions.date);
        // for missing days with we put 0 income/expense
        const days = fillMissingDays(activeDays, startDate, endDate);

        return c.json({
        data: {
            remainingAmount: currentPeriod.remaining,
            remainingChange,
            incomeAmount: currentPeriod.income,
            incomeChange,
            expensesAmount: currentPeriod.expenses,
            expensesChange,
            categories: finalCategories,
            days,
        },
        });
    }
    );

    export default app;
