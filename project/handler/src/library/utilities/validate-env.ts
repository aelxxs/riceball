import { logger } from "@riceball/logger";

const envVars = ["DISCORD_TOKEN", "REDIS_URL", "MONGO_URL", "WEBSITE_GROUP", "DISCORD_GROUP", "GATEWAY_GROUP"];

export const validateEnv = () => {
	const missing = [];

	for (const envVar of envVars) {
		if (!process.env[envVar]) {
			missing.push(envVar);
		}
	}

	if (missing.length > 0) {
		logger.error("Missing environment variables: \n•", missing.join("\n• "));
		process.exit(1);
	}
};
