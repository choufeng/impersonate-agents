import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllPartnerNames = query({
  args: {},
  handler: async (ctx) => {
    const partners = await ctx.db.query("partners").collect();
    return partners.map((partner) => partner.name);
  },
});

export const getPartnerAddressCount = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!partner) {
      return { count: 0, exists: false };
    }

    return {
      count: partner.addresses?.length ?? 0,
      exists: true,
    };
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

export const addMultipleAddressesToPartner = mutation({
  args: {
    name: v.string(),
    addresses: v.array(v.string()),
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
    const updatedAddresses = [...currentAddresses, ...args.addresses];

    await ctx.db.patch(partner._id, {
      addresses: updatedAddresses,
    });

    return { success: true, addresses: updatedAddresses };
  },
});

export const getRandomAddress = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!partner) {
      return null;
    }

    const addresses = partner.addresses ?? [];
    if (addresses.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * addresses.length);
    return addresses[randomIndex];
  },
});
