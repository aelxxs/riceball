import { Tokens } from "#lib/utils";
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import { SettingsCache } from "../base/SettingsCache";
import type { UserSchema } from "../../schema/User";

@injectable()
export class UserSettingsCache extends SettingsCache<UserSchema> {
	public constructor(@inject(Tokens.SQL) public sql: Sql<any>) {
		super();
	}

	public async fetch(id: string): Promise<UserSchema> {
		const settings = await this.sql.begin(async (sql) => {
			await sql`
				INSERT INTO "User" (id)
				VALUES
					(${id})
				ON CONFLICT (id) DO NOTHING;
			`;

			const [settings] = await sql<[UserSchema]>`
				SELECT * FROM "User" WHERE "id" = ${id}
			`;

			return settings;
		});

		this.set(id, settings);

		return settings;
	}

	public upsert(id: string, query: any): Promise<any> {
		return this.sql`
			INSERT INTO "User"
				${this.sql({ id, ...query })}
			ON CONFLICT (id) DO UPDATE
			SET ${this.sql(query)}
		`;
	}
}
