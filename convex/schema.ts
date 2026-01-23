import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  partners: defineTable({
    name: v.string(),
    addresses: v.optional(v.array(v.string())),
  }),
});
