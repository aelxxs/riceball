import { Tokens } from "#lib/utils";
import type { Sql } from "postgres";
import { inject, injectable } from "tsyringe";
import { SettingsCache } from "../base/SettingsCache";
import type { MemberSchema } from "../../schema/Member";

@injectable()
export class MemberSettingsCache extends SettingsCache<MemberSchema> {
	public constructor(@inject(Tokens.SQL) public sql: Sql<any>) {
		super();
	}

	public async fetch(id: string): Promise<MemberSchema> {
		const [guild, member] = id.split(":");

		const settings = await this.sql.begin(async (sql) => {
			await sql`
				INSERT INTO "Member" (guild, member)
				VALUES (${guild}, ${member})
				ON CONFLICT (guild, member) DO NOTHING;
			`;

			const [settings] = await sql<[MemberSchema]>`
				SELECT * FROM "Member"
				WHERE "guild" = ${guild} AND "member" = ${member}
			`;

			return settings;
		});

		this.set(id, settings);

		return settings;
	}

	public upsert(id: string, query: any): Promise<any> {
		const [guild, member] = id.split(":");

		return this.sql`
			INSERT INTO "Member"
				${this.sql({ guild, member, ...query })}
			ON CONFLICT (guild, member) DO UPDATE
			SET ${this.sql(query)}
		`;
	}
}
