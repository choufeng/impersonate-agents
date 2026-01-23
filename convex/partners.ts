import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllPartnerNames = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    return partners.map((partner) => partner.name);
  },
});

export const addAddressToPartner = mutation({
  args: {
    name: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!partner) {
      throw new Error(`Partner with name "${args.name}" not found`);
    }

    const currentAddresses = partner.addresses ?? [];
    const updatedAddresses = [...currentAddresses, args.address];

    await ctx.db.patch(partner._id, {
      addresses: updatedAddresses,
    });

    return { success: true, addresses: updatedAddresses };
  },
});
