import { query } from "./_generated/server";

export const getAllPartnerNames = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    return partners.map((partner) => partner.name);
  },
});
