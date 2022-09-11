import { Injectors } from "../../../utilities/common/injectors";
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import { SettingsCache } from "../base/SettingsCache";
import type { GuildSchema } from "../../schema/Guild";

@injectable()
export class GuildSettingsCache extends SettingsCache<GuildSchema> {
	public constructor(@inject(Injectors.SQL) public sql: Sql<any>) {
		super();
	}

	public async fetch(id: string): Promise<GuildSchema> {
		const settings = await this.sql.begin(async (sql) => {
			await sql`
				INSERT INTO "Guild" (id)
				VALUES
					(${id})
				ON CONFLICT (id) DO NOTHING;
			`;

			const [settings] = await sql<[GuildSchema]>`
				SELECT * FROM "Guild" WHERE "id" = ${id}
			`;

			return settings;
		});

		this.set(id, settings);

		return settings;
	}

	public upsert(id: string, query: any): Promise<any> {
		return this.sql`
			INSERT INTO "Guild"
				${this.sql({ id, ...query })}
			ON CONFLICT (id) DO UPDATE
			SET ${this.sql(query)}
		`;
	}
}
