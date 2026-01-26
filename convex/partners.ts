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
    refreshKey: v.optional(v.number()),
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

    // 使用 refreshKey + 当前时间戳 + partner名称 生成种子
    // 这样每次调用都会得到不同的随机结果
    const seed = (args.refreshKey ?? 0) + Date.now() + args.name.length;
    
    // 简单的伪随机算法（线性同余生成器）
    const pseudoRandom = (seed: number) => {
      const a = 1664525;
      const c = 1013904223;
      const m = 2 ** 32;
      return ((a * seed + c) % m) / m;
    };
    
    const randomIndex = Math.floor(pseudoRandom(seed) * addresses.length);
    return addresses[randomIndex];
  },
});

export const removeAddressFromPartner = mutation({
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
    const updatedAddresses = currentAddresses.filter(
      (addr: string) => addr !== args.address,
    );

    await ctx.db.patch(partner._id, {
      addresses: updatedAddresses,
    });

    return { success: true, addresses: updatedAddresses };
  },
});
