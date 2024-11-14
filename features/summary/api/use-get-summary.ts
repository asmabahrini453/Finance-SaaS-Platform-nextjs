import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const useGetSummary = () => {
  const params = useSearchParams();
  //retrieve the "from" & "to" & "accountId"
  const from = params.get("from") || "";
  const to = params.get("to") || ""; 
  const accountId = params.get("accountId") || "";

  const query = useQuery({
    queryKey: ["summary", { from, to, accountId }], //catch reponse
    queryFn: async () => {
      const response = await client.api.summary.$get({
        query: { from, to, accountId },
      });
      if (!response.ok) {
        throw new Error("Faild to fetch transactions");
      }
      const { data } = await response.json(); //extracting data ml response
      return {
        ...data,
        // Convert amounts from miliunits to units and format data for consumption
        incomeAmount: convertAmountFromMiliunits(data.incomeAmount),
        expensesAmount: convertAmountFromMiliunits(data.expensesAmount),
        remainingAmount: convertAmountFromMiliunits(data.remainingAmount),
        categories: data.categories.map((category) => ({
          ...category,
          value: convertAmountFromMiliunits(category.value),
        })),
        days: data.days.map((day) => ({
          ...day,
          income: convertAmountFromMiliunits(day.income),
          expenses: convertAmountFromMiliunits(day.expenses),
        })),
      };
    },
  });
  return query;
};
