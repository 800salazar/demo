import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { addRecentActivity } from "@/lib/demo/recent-activity";
import { activitySeries, createOrder } from "@/lib/demo/workflow";
import { getReportScope } from "@/lib/demo/report";

describe("recent demo activity", () => {
  it("waits until there are no creations or closures in the last fourteen Chihuahua calendar days", () => {
    const data = createSeedData(new Date("2026-11-01T18:00:00Z"));
    const now = new Date("2026-12-25T18:00:00Z");
    const recent = {
      ...data,
      orders: data.orders.map((order, index) => index === 0
        ? { ...order, createdAt: "2026-12-12T18:00:00Z", completedAt: null }
        : order),
    };
    expect(addRecentActivity(recent, now)).toBe(recent);
    const expired = {
      ...recent,
      orders: recent.orders.map((order, index) => index === 0
        ? { ...order, createdAt: "2026-12-11T18:00:00Z" }
        : order),
    };
    expect(addRecentActivity(expired, now).orders).toHaveLength(expired.orders.length + 4);
  });

  it("adds current examples without changing existing orders, edits, catalogs or history", () => {
    const original = createSeedData(new Date("2026-11-01T18:00:00Z"));
    const edited = createOrder(original, {
      title: "Solicitud del visitante", departmentId: original.departments[0].id,
      categoryId: original.categories[0].id, priorityId: original.priorities[0].id,
      assignee: "Ana Torres", dueDate: "2026-11-10", estimatedCost: 1000, description: "",
    }, new Date("2026-11-01T18:00:00Z"));
    const now = new Date("2026-12-25T18:00:00Z");
    const next = addRecentActivity(edited, now);
    expect(next.orders.slice(0, edited.orders.length)).toEqual(edited.orders);
    expect(next.history.slice(0, edited.history.length)).toEqual(edited.history);
    expect(next.departments).toEqual(edited.departments);
    expect(next.orders).toHaveLength(35);
    expect(new Set(next.orders.map(order => order.folio)).size).toBe(35);
    expect(activitySeries(next.orders, now, 7).reduce((sum, day) => sum + day.created + day.completed, 0)).toBe(6);
    expect(getReportScope(next, now, 7).data.orders).toHaveLength(4);
    expect(addRecentActivity(next, now)).toBe(next);
    for (const order of next.orders.slice(-4)) {
      expect(next.history.some(entry => entry.orderId === order.id && entry.action === "created")).toBe(true);
      expect(next.checklist.filter(item => item.orderId === order.id).every(item => item.done === Boolean(order.completedAt))).toBe(true);
    }
  });

  it("uses active catalog options and respects the 100 order limit", () => {
    const data = createSeedData(new Date("2026-11-01T18:00:00Z"));
    data.departments[0].active = false;
    data.categories[0].active = false;
    data.priorities[0].active = false;
    const now = new Date("2026-12-25T18:00:00Z");
    const next = addRecentActivity(data, now);
    for (const order of next.orders.slice(-4)) {
      expect(next.departments.find(item => item.id === order.departmentId)?.active).toBe(true);
      expect(next.categories.find(item => item.id === order.categoryId)?.active).toBe(true);
      expect(next.priorities.find(item => item.id === order.priorityId)?.active).toBe(true);
    }
    const full = { ...data, orders: Array.from({ length: 100 }, (_, index) => ({ ...data.orders[0], id: String(index) })) };
    expect(addRecentActivity(full, now)).toBe(full);
  });
});
