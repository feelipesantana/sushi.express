import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { authenticate } from "./http/authenticate";
import { authenticateFromLink } from "./http/routes/authenticate-from-link";
import { getManagedRestaurant } from "./http/routes/get-managed-restaurant";
import { getMonthOrdersAmount } from "./http/routes/get-month-orders-amount";
import { getMonthReceipt } from "./http/routes/get-month-receipt";
import { getProfile } from "./http/routes/get-profile";
import { registerCustomer } from "./http/routes/register-customer";
import { registerRestaurant } from "./http/routes/register-restaurant";
import { sendAuthenticationLink } from "./http/routes/send-authentication-link";
import { signOut } from "./http/routes/sign-out";

const app = new Elysia()
	.use(
		cors({
			credentials: true,
			allowedHeaders: ["content-type"],
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
			origin: (request): boolean => {
				const origin = request.headers.get("origin");

				if (!origin) {
					return false;
				}

				return true;
			},
		}),
	)
	.use(authenticate)
	.use(authenticateFromLink)
	.use(sendAuthenticationLink)

	.use(registerCustomer)

	.use(registerRestaurant)
	.use(getManagedRestaurant)

	.use(getMonthOrdersAmount)
	.use(getMonthReceipt)
	.use(getProfile)

	.use(signOut);

app.listen(3333);

console.log(
	`🔥 HTTP server running at ${app.server?.hostname}:${app.server?.port}`,
);
