import dayjs from "dayjs";
import { and, eq, gte, sql, sum } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "../../db/connection";
import { orders } from "../../db/schemas";
import { authenticate } from "../authenticate";

export const getMonthReceipt = new Elysia()
	.use(authenticate)
	.get("/metrics/month-receipt", async ({ getManagedRestaurantId }) => {
		const restaurantId = await getManagedRestaurantId();

		const today = dayjs();
		const lastMonth = today.subtract(1, "month");
		const startOfLastMonth = lastMonth.startOf("month");

		const lastMonthWithYear = lastMonth.format("YYYY-MM");
		const currentMonthWithYear = today.format("YYYY-MM");

		const monthsReceipts = await db
			.select({
				monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
				receipt: sum(orders.totalInCents).mapWith(Number),
			})
			.from(orders)
			.where(
				and(
					eq(orders.restaurantId, restaurantId),
					gte(orders.createdAt, startOfLastMonth.toDate()),
				),
			)
			.groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
			.having(({ receipt }) => gte(receipt, 1));

		const currentMonthReceipt = monthsReceipts.find((monthReceipt) => {
			return monthReceipt.monthWithYear === currentMonthWithYear;
		});
		const lastMonthReceipt = monthsReceipts.find((monthReceipt) => {
			return monthReceipt.monthWithYear === lastMonthWithYear;
		});

		const diffFromLastMonth =
			lastMonthReceipt && currentMonthReceipt
				? (currentMonthReceipt.receipt * 100) / lastMonthReceipt.receipt
				: null;
		return {
			receipt: currentMonthReceipt?.receipt ?? 0,
			diffFromLastMonth: diffFromLastMonth
				? Number((diffFromLastMonth - 100).toFixed(2))
				: 0,
		};
	});
