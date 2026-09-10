---
name: architecture-layering
description: Separating an application into layers (routes/controllers, business logic/services, data access) with a clear, one-directional dependency flow. Use when structuring a new app/service, when a route handler is doing too much directly, or when business logic is tangled up with HTTP/framework or database-specific code.
metadata:
  tags: architecture, layering, separation-of-concerns
---

## When to use

Load this when scaffolding a new app/service, when a route handler or controller has grown past a few lines of direct logic, or when business rules are entangled with HTTP request/response handling or raw database queries.

## The standard layers and what belongs in each

1. **Transport/routes/controllers** — parses the incoming request, calls the service layer, formats the response. No business logic, no direct database queries here. If a route handler has an `if` statement checking a business rule, that logic belongs one layer down.
2. **Business logic/services** — the actual rules of the domain (see [[domain-entity-modeling]] for how the domain itself should be modeled). Framework-agnostic — this layer shouldn't import anything from your web framework or know it's being called over HTTP.
3. **Data access/repository** — talks to the database/external APIs, returns domain objects. Business logic calls this layer through an interface (see [[architecture-solid-principles]] dependency inversion), never writes raw queries inline in a service function if the codebase has a repository layer.

## The dependency rule

Dependencies point inward/downward only: routes depend on services, services depend on repository interfaces. Never the reverse — a repository must never import or call back into a service, and a service must never import framework-specific request/response types. If you find yourself importing "up" the stack, that's the signal the responsibility is in the wrong layer.

## Checklist

- [ ] Route/controller functions are thin — parse input, call one service method, map the result to a response. No inline business rules, no inline SQL.
- [ ] Service-layer functions don't import `req`/`res` (or framework-equivalent) types — they take plain arguments and return plain data/domain objects.
- [ ] Database queries live in a data-access/repository layer, not scattered inline across service functions — makes it possible to swap storage or write unit tests against a fake repository.
- [ ] A business rule exists in exactly one place — not duplicated between a route validator and a service-layer check that both enforce the same thing slightly differently (see [[modularity-dry-judgment]]).
- [ ] Cross-cutting concerns (auth, logging, rate limiting) are handled as middleware/decorators around the layers, not copy-pasted into every route handler — see [[secure-api-defaults]] for the auth-specific version of this.

## Pattern: layering in practice

```ts
// Route — thin, just orchestrates
router.post('/orders', requireAuth, async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json(order);
});

// Service — the actual business rule, framework-agnostic
class OrderService {
  constructor(private orders: OrderRepository, private inventory: InventoryRepository) {}

  async createOrder(customerId: string, input: OrderInput) {
    const available = await this.inventory.checkStock(input.items);
    if (!available) throw new OutOfStockError(input.items);
    return this.orders.create({ customerId, ...input });
  }
}

// Repository — the only place that knows this is Postgres
class PostgresOrderRepository implements OrderRepository {
  async create(data: OrderData) {
    return db.query('INSERT INTO orders ...', [...]);
  }
}
```

## When to skip strict layering

A genuinely tiny script or single-file utility doesn't need three formal layers — that's over-engineering for its own sake (see [[architecture-pattern-selection]]). This applies once an app has enough routes/entities that "where does this logic go" becomes a real question different developers would answer differently.

## Quick self-audit

1. Pick any route handler at random — does it contain business logic, or does it delegate?
2. Grep the service layer for framework-specific imports (`req`, `res`, `Request`, `Response`) — should be zero.
3. Grep for raw SQL/ORM calls outside the data-access layer — should be zero (or explicitly justified) if the codebase has adopted a repository pattern.
