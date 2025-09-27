# POS_OFFLINE_SYNC_REPORT.md

**Executive summary (≤6 lines)**

1. MVP: PWA (Vue) + local Node.js server on Raspberry Pi + Postgres (cloud) / SQLite (local) supporting offline orders, sync, KDS, and thermal printing.
2. Offline-first: PWA with service worker + IndexedDB queue; local server exposes REST API and sync worker pushes to cloud when online.
3. Guarantees: at-least-once delivery with idempotency keys and deduplication; optimistic UI and order acknowledgements.
4. Security: TLS for cloud sync, signed payloads, encrypted local DB, captive-portal Wi-Fi options and hardened firewall on local device.
5. Deliverables included: architecture diagrams, stack recommendations, API/OpenAPI stub, Docker compose scaffold, service worker + sync client snippets, and a sample server route patch with idempotency.
6. Estimated dev effort for MVP: **~540 developer-hours** (detailed in MVP plan).

------

## Table of contents

1. Architecture (mermaid diagram + rationale)
2. Technical stack recommendation
3. Offline architecture & sync protocol (detailed)
4. Networking & hostpoint design (Wi-Fi / captive portal)
5. User flows & UX wireframes (ASCII)
6. API & data model (endpoints, schemas, OpenAPI)
7. POS & peripheral integration (ESC/POS examples)
8. Payments design (offline strategies & PCI notes)
9. Security & privacy (threat model & mitigations)
10. Resilience & monitoring (health checks & fallback)
11. Operations & deployment (step-by-step)
12. Testing plan (cases & commands)
13. MVP implementation plan (sprints, tasks, dev-hours)
14. Deliverable artifacts (README summary + repo layout + docker-compose + service worker + sync client + unified diff)
15. Security & compliance appendix (short checklist)
16. Operations playbook (onboarding + troubleshooting)

------

## 1. Architecture — mermaid diagram + rationale

```mermaid
flowchart LR
  subgraph LocalNetwork[Restaurant Local Network]
    AP[Wi-Fi AP (captive portal)]
    Pi[Local Server (Raspberry Pi)]
    KDS[Kitchen Display System]
    Printer[Thermal Printer]
    POSterm[POS Terminal]
    Customers[PWA Clients on Phones]
    AP -->|DHCP/WiFi| Customers
    Customers -->|HTTP (local)| Pi
    Pi -->|Print| Printer
    Pi -->|WebSocket| KDS
  end

  subgraph Cloud[Cloud Backend]
    API[Cloud API (Auth, Orders, Sync)]
    DB[Cloud DB (Postgres/CouchDB)]
    Admin[Admin Dashboard]
    Payments[Payment Gateway]
    Analytics[Analytics]
    API --> DB
    Admin --> API
    Payments --> API
  end

  Pi -->|HTTPS (when online) | API
  Customers -->|Public web (internet)| API
```

**Rationale & tradeoffs**

- **Local-first design** ensures orders can be placed without Internet; local server persists orders and routes to KDS/printer.
- **Sync to cloud** when connectivity available: ensures central reporting, multi-site view.
- **Single points of failure:** Local server is SPOF for local orders; mitigations include redundancy (secondary Pi) or process supervisor + clear operator playbook for manual fallback.
- **Choice of DB:** Use lightweight local SQLite (or CouchDB/PouchDB) for simple sync: PouchDB (IndexedDB on client + CouchDB compatible sync) allows conflict resolution; Postgres on cloud provides relational reporting. Tradeoff: CouchDB/PouchDB simplifies sync; relational DB requires custom sync layer.

------

## 2. Technical stack recommendation

**Frontend (PWA)**

- Framework: **Vue 3** (Composition API) — good PWA tooling.
- PWA tools: Vite, `workbox` or native Service Worker, `localforage` or `idb` for IndexedDB access.
- Sync client: small sync module in TypeScript.
- KDS client: simple web app (Vue) running full-screen on a tablet or small monitor.

**Local server (in-restaurant)**

- Runtime: **Node.js 18+** (lightweight) or Go for extra reliability. Node.js recommended for faster dev.
- Local DB: **SQLite** with WAL or **PouchDB (LevelDB backend)** if using CouchDB sync model.
- Expose: REST + WebSocket/Server-Sent Events for KDS updates.
- Process manager: `systemd` or `pm2` for auto-restart.

**Cloud backend**

- Host: Managed service (Heroku / Render / AWS Elastic Beanstalk / GCP Cloud Run).
- DB: **Postgres** for relational data; optionally CouchDB if using PouchDB sync (but Postgres is more standard for reporting).
- API: Node.js (Fastify/Express) or Go (Gin). OpenAPI spec and JWT auth.

**Sync protocol**

- Use **operation log (oplog)** with idempotency keys + server-authoritative reconciliation. For simplicity: client generates orders with UUID and timestamp; cloud ACKs with server order ID.

**Printing**

- ESC/POS for thermal printers (networked via Ethernet or connected through local server via USB). Libraries: `escpos` (node-escpos), or use `cups` on Linux + `python-escpos` if needed.

**Hardware recommendations (examples)**

- Raspberry Pi 4 (4GB) — cheap local server; add SSD via USB.
- Wi-Fi AP capable of captive portal (Ubiquiti UniFi AC Lite or TP-Link Omada) — supports local DNS / captive portal.
- Thermal printer (58mm or 80mm) with USB or Ethernet (e.g., Epson TM-T20III or cheaper Sunmi/Generic ESC/POS).
- Tablet for KDS (Android tablet) or small monitor.
- POS terminal (optional) for payments and cashier.

------

## 3. Offline Architecture & Sync Protocol

### How the local hotspot serves PWA

Two approaches:

1. **Captive portal**: AP intercepts HTTP requests and redirects to local server IP (e.g., `http://192.168.4.1`) serving the PWA HTML bundle. Good UX (automatic redirect).
2. **Manual SSID / local DNS**: User connects to SSID `Restaurant_Order` and navigates to `http://order.local` or IP. Simpler to implement; less intrusive.

**Recommendation:** Use local DNS + captive portal fallback. Host PWA static files on Pi and configure AP to redirect unknown HTTP requests to Pi IP.

### Client storage model

- Use **IndexedDB** via `idb` or `localforage`. Data model:
  - `orders` store: order objects with `clientOrderId: UUID`, `status`, `items[]`, `createdAt`, `modifiedAt`, `idempotencyKey`.
  - `syncQueue` store: references to orders waiting to sync.
- Optimistic UI: when user submits, show order accepted locally and returns `clientOrderId`.

### Sync algorithm (recommended)

- **Client**: create order with `clientOrderId` (UUID v4) and `idempotencyKey` (same as clientOrderId). Save locally and push to `syncQueue`. Attempt `POST /local/orders` to local Pi; local Pi persists and returns local order ID & status; local Pi attempts to push to cloud when it has Internet.
- **Local server**: accepts order POSTs and persists with `clientOrderId`. It maintains `sync` worker to push to cloud:
  - Push payload: `{ clientOrderId, idempotencyKey, createdAt, storeId, items, totals }`.
  - Cloud API uses idempotencyKey to deduplicate.
- **Cloud API**: idempotent endpoint `POST /api/orders/sync` that returns `cloudOrderId` or existing order if idempotencyKey already present.

**Sync pseudocode (local server):**

```pseudocode
for order in local_db.where(status == 'pending_sync'):
    payload = buildPayload(order)
    resp = http_post(cloud_url + '/api/orders/sync', payload, headers={ Authorization: token })
    if resp.status == 200:
        mark order.synced = true
        store cloudOrderId
    else:
        schedule retry with exponential backoff
```

**Deduplication & idempotency**

- Use `idempotencyKey = clientOrderId` and server-side table with unique index on (`storeId`, `idempotencyKey`). If duplicate, return existing cloud ID.

**Guarantee properties**

- **At-least-once delivery**: achieved via retry loop on local server with exponential backoff until ACK.
- **Idempotency**: ensures duplicates don't create duplicate cloud orders.
- **Order acknowledgement flow**: local server responds immed to client with `localOrderId` and `status: accepted`. Later, when cloud returns `cloudOrderId`, local server updates status to `synced` and optionally notifies client via WebSocket.

**Sample JSON payload**

```json
{
  "clientOrderId":"b7f4c2d0-1a4f-4b2d-9a3e-5e2c9a2b8f9a",
  "storeId":"store_123",
  "createdAt":"2025-09-20T09:30:00Z",
  "customer":{"name":"Onsite Customer","type":"onsite"},
  "items":[{"sku":"ATT001","name":"Attiéké+Thon","qty":1,"price":3500}],
  "total":3500,
  "payment":{"method":"cash","status":"pending"},
  "idempotencyKey":"b7f4c2d0-1a4f-4b2d-9a3e-5e2c9a2b8f9a"
}
```

------

## 4. Networking & Hostpoint Design

### Setup steps (Raspberry Pi + AP)

1. **Local server (Pi)**
   - Install OS (Raspberry Pi OS lite), Node.js 18+, Docker (optional). Assign static IP (e.g., `192.168.4.1`).
   - Serve PWA on port 80 (nginx or simple Node static server).
2. **Wi-Fi AP**
   - Configure SSID `Restaurant-Order` with open or WPA2 (if captive portal used, typical open SSID with terms).
   - Set DHCP gateway to Pi IP or ensure Pi reachable. Configure AP to redirect HTTP traffic to `http://192.168.4.1`.
   - Captive portal: many AP vendors (UniFi, OpenWRT) support a captive portal redirect URL. Point to Pi.
3. **Firewall / NAT**
   - On Pi: accept only inbound HTTP/HTTPS from local interface; block other ports. If Pi also provides Internet (NAT), set iptables to allow only needed traffic.
   - Prevent local orders from routing to Internet (if offline mode desired) by configuring AP to not provide upstream internet or by firewall rules.
4. **Security**
   - If cloud sync required, allow outbound HTTPS to cloud API only (restrict to known IPs/DNS). Use an outbound proxy if needed.
5. **SSL**
   - For local captive portal, HTTPS is tricky due to certificate trust; HTTP is acceptable inside local-only network but ensure local server encrypts sensitive data at rest and uses secure channels to cloud. For cloud endpoints, always use TLS.

------

## 5. User flows & UX wireframes (ASCII/text)

### Join Wi-Fi & Order (quick)

```
1. User connects to SSID: "Restaurant-Order"
2. Mobile OS shows captive portal; redirect to http://192.168.4.1 OR user opens browser -> lands on PWA
3. PWA loads (service worker serves cached app); menu displayed
4. User picks items -> adds to cart -> Checkout (selects 'Onsite' / table or name)
5. User taps "Place order" -> PWA writes to IndexedDB and POSTs to local server
6. PWA shows "Order accepted - #LOCAL123 (synced: no/yes)"
```

### Resume order after connection loss

- On submit, if local POST fails, mark `status: queued` and show message "Order queued — will send when local network available". Retry in background.

### Payment flow

- **Offline cash**: Set `payment.method = cash`, `payment.status = pending`; operator collects cash and marks as paid in Admin.
- **Card on-site**: Use portable card reader (e.g., SumUp) and store `payment.token` or external txn id offline. If card capture requires connectivity, mark order pending and reconcile once online.

### Kitchen workflow (KDS)

- Local server emits WebSocket event `new_order` to KDS; KDS displays tickets, updates status (cooking, ready), operator can mark complete which triggers print and notifies client status via local WebSocket.

### Receipt printing

- After order accepted, local server triggers print job to thermal printer using ESC/POS.

------

## 6. API & Data model

### Key endpoints (local server)

- `POST /local/orders` — accept onsite order from client (local).
- `GET /local/menu` — serve current menu JSON.
- `GET /local/orders/:id` — fetch local order status.
- WebSocket `/ws` — push new orders to KDS & clients.

### Cloud API (OpenAPI minimal)

```yaml
openapi: 3.0.3
info:
  title: POS Cloud API
  version: 1.0.0
paths:
  /api/orders/sync:
    post:
      summary: Sync order from local store
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderSync'
      responses:
        '200':
          description: Order accepted
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
components:
  schemas:
    OrderSync:
      type: object
      properties:
        clientOrderId: { type: string }
        storeId: { type: string }
        createdAt: { type: string, format: date-time }
        items:
          type: array
          items:
            type: object
            properties:
              sku: { type: string }
              qty: { type: integer }
              price: { type: number }
        total: { type: number }
        idempotencyKey: { type: string }
    OrderResponse:
      type: object
      properties:
        cloudOrderId: { type: string }
        status: { type: string }
```

### Data model (Postgres)

```sql
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_order_id TEXT,
  store_id TEXT REFERENCES stores(id),
  created_at TIMESTAMP,
  total NUMERIC,
  payment_method TEXT,
  idempotency_key TEXT,
  cloud_status TEXT,
  UNIQUE (store_id, idempotency_key)
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  sku TEXT,
  name TEXT,
  qty INTEGER,
  price NUMERIC
);
```

If using CouchDB/PouchDB: store full order documents with `_id = clientOrderId` to get automatic dedupe.

------

## 7. POS & peripheral integration

### ESC/POS printing (Node example)

```js
// node-escpos example (USB or network)
const escpos = require('escpos');
escpos.Network = require('escpos-network');
const device = new escpos.Network('192.168.4.100'); // printer IP
const printer = new escpos.Printer(device);

device.open(() => {
  printer
    .font('A')
    .align('ct')
    .style('b')
    .size(1,1)
    .text('Garbadrome Receipt')
    .text('Order #LOCAL123')
    .text('1x Attieke+Thon 3500 FCFA')
    .text('Total: 3500 FCFA')
    .cut()
    .close();
});
```

### ESC/POS raw commands (example)

- Use ESC/POS sequences to format receipts. For networked printers, open TCP socket to port 9100 and write data.

### Cash drawer

- Trigger via printer pulse (ESC p) if drawer connected to printer. Else use USB GPIO adapter.

### KDS

- KDS is a Vue app connected via WebSocket; local server broadcasts `new_order` event containing order details.

------

## 8. Payments design

### Offline strategies

1. **Cash-on-delivery / cash on-site** — simplest; mark `payment.status: paid` when cashier confirms. Reconciliation manual.
2. **Portable card readers** (SumUp, Zettle): process payment on reader; store transaction ID. If reader offline, some readers buffer transactions; risk-managed by vendor support.
3. **Deferred card capture**: client provides card token or pre-authorization when online; not recommended if network may be persistently absent.

### PCI considerations

- Avoid storing card numbers locally. Use tokenization via payment gateway SDKs. Only store `payment_token` or `transaction_id`. Use TLS for cloud sync. PCI scope minimized by using external terminals.

**Recommended gateways**: local/regional providers supporting tokenization and SDKs (choose by country). For global: Stripe (if available), Adyen, or local processors that support offline SDKs.

------

## 9. Security & Privacy

### Threat model highlights

- **Local network attacks**: MITM on local open Wi-Fi, captive portal spoofing.
- **Device compromise**: Pi stolen or tampered with.
- **Replay / duplicate orders**: client re-sends same id leading to duplicates (mitigated by idempotency keys).

### Mitigations

- Use short-lived JWT between local server and cloud. Sign payloads with HMAC; cloud verifies signature.
- Encrypt local DB at rest (LUKS or file-level encryption), or encrypt sensitive fields.
- On local network, optionally require a short per-visit code to validate user (lower UX).
- Harden Pi: disable SSH or use key-based auth, change default passwords, enable `ufw` to restrict ports.
- For captive portal, display clear instructions and use HTTPS for cloud endpoints. Local HTTP is okay for PWA on local network but store only non-sensitive data locally if possible.

------

## 10. Resilience & monitoring

- Local health endpoint: `GET /health` returns process OK + DB status + printer status. Supervisor (systemd) restarts on failure.
- Logs: ship local logs to cloud when online (rotate and sync). Use file-based logs and upload compressed daily.
- Alerts: configure SMS/WhatsApp webhook when Pi hasn't synced for N hours.
- Fallback: if Pi down, staff use paper tickets; admin later enters orders into system.

------

## 11. Operations & deployment (step-by-step)

**Pre-deploy**

- Image a Raspberry Pi with OS + Docker + service image. Include `config.json` for storeId, cloud API URL, TLS certs/keys.

**In-restaurant install**

1. Mount Pi and SSD; set static IP.
2. Connect AP; configure captive portal redirect to Pi.
3. Start services: `docker-compose up -d`.
4. Test: connect phone, place order, confirm KDS shows, confirm printer prints.
5. Configure cloud credentials and run initial sync.

**Updates**

- Use auto-update mechanism: Pi polls for signed update manifest; downloads and restarts with zero-downtime swap. Alternatively, admin triggers `git pull` + `docker-compose up -d`.

------

## 12. Testing plan

**Automated**

- Unit tests: Jest/Vitest for sync logic.
- Integration tests: local server + SQLite + mocked cloud API.
- E2E: Cypress for PWA flows; test offline scenarios using `cy.intercept` and service worker emulation.
- Sync stress tests: create many queued orders and bring cloud up; measure throughput and dedupe correctness.

**Manual**

- Printer integration: print receipts, triggers, drawer pulse.
- Captive portal flows on iOS and Android (some OS captive portal quirks).
- Payment flows: cash, portable reader, deferred capture tests.

**Example test commands**

```bash
npm ci
npm test         # unit
npm run test:e2e # cypress
npm run lint
# Local server
docker-compose up -d
curl -X POST http://192.168.4.1/local/orders -d @sample_order.json
```

------

## 13. MVP implementation plan (3–6 sprints) + dev-hours

**Assumptions:** 2 engineers (frontend + backend), 1 QA, 1 devops part-time.

### Sprint 1 (2 weeks) — Core PWA + local server basics (160 dev-hours)

- Tasks:
  - Scaffold Vue PWA & service worker (60h)
  - Local Node server REST `POST /local/orders` + SQLite persistence (50h)
  - Static menu endpoint + basic UI (30h)
  - Docker compose + README (20h)
- Acceptance: place order on local network, persists in local DB, appears in admin local web.

### Sprint 2 (2 weeks) — KDS & Printing (120 dev-hours)

- Tasks:
  - WebSocket events for KDS (40h)
  - KDS UI (40h)
  - Thermal printer integration + sample receipts (40h)
- Acceptance: order prints and KDS shows order.

### Sprint 3 (2 weeks) — Cloud sync + idempotency (120 dev-hours)

- Tasks:
  - Implement cloud API stub + idempotency (50h)
  - Local sync worker with retry/backoff, store cloudOrderId (50h)
  - OpenAPI + basic admin dashboard (20h)
- Acceptance: orders sync to cloud & dedupe verified.

### Sprint 4 (1.5 weeks) — Offline UX polish & captive portal (80 dev-hours)

- Tasks:
  - Service Worker caching, IndexedDB queue (40h)
  - Captive portal steps & AP instructions (20h)
  - Edge-case handling (30h)
- Acceptance: PWA works offline, caching and retry work.

### Sprint 5 (1 week) — Payments & QA (40 dev-hours)

- Tasks:
  - Integrate portable card or mark as cash workflow, reconcile UX (20h)
  - QA, test cases, performance tuning (20h)
- Acceptance: payment flows defined & tested.

### Sprint 6 (1 week) — Deploy & Documentation (20 dev-hours)

- Tasks:
  - Ops playbook, imaging Pi, final docs (20h)
- Acceptance: one store deployed with checklist validated.

**Total estimated dev-hours:** 540 hours
 **Note:** these are conservative; adjust by team experience.

------

## 14. Deliverable artifacts (scaffold + snippets + patch)

### Repo layout (suggested)

```
pos-offline/
├─ deploy/
│  ├─ docker-compose.yml
│  ├─ Dockerfile.local
│  └─ sample.service (systemd)
├─ server/
│  ├─ src/
│  └─ package.json
├─ pwa/
│  ├─ src/
│  ├─ manifest.json
│  └─ sw.js
├─ kds/
├─ admin/
└─ AUDIT_REPORT.md
```

### docker-compose.yml (minimal)

```yaml
version: '3.8'
services:
  local-server:
    build: ./server
    ports:
      - "80:3000"
    volumes:
      - ./server/data:/data
    restart: always
```

### sample service worker (sw.js) — simplified

```js
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('pos-v1').then(cache => cache.addAll([
      '/', '/index.html', '/app.js', '/styles.css'
    ]))
  );
});

self.addEventListener('fetch', event => {
  // Try network first for API calls, fallback to cache
  if (event.request.url.includes('/local/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
  }
});

// background sync for queued orders (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(self.clients.matchAll().then(() => {
      // message client to run sync
    }));
  }
});
```

### sample sync client (PWA)

```ts
import { openDB } from 'idb';
const db = await openDB('pos',1,{
  upgrade(db){ db.createObjectStore('orders', { keyPath: 'clientOrderId' }) }
});

async function queueOrder(order){
  await db.put('orders', order);
  try {
    const resp = await fetch('/local/orders', { method:'POST', body: JSON.stringify(order), headers:{'Content-Type':'application/json'}});
    if(resp.ok) {
      const data = await resp.json();
      // mark synced
      await db.delete('orders', order.clientOrderId);
    }
  } catch(e){
    // offline -> keep in store, schedule background sync
    if('serviceWorker' in navigator && 'SyncManager' in window){
      navigator.serviceWorker.ready.then(sw => sw.sync.register('sync-orders'));
    }
  }
}
```

### unified diff patch — implement local server `POST /local/orders` (Node + SQLite, minimal)

```diff
*** Begin Patch
*** Add File: server/src/index.js
+const express = require('express');
+const bodyParser = require('body-parser');
+const sqlite3 = require('sqlite3').verbose();
+const { v4: uuidv4 } = require('uuid');
+
+const db = new sqlite3.Database('./data/local.db');
+db.serialize(() => {
+  db.run(`CREATE TABLE IF NOT EXISTS orders (
+    id TEXT PRIMARY KEY,
+    client_order_id TEXT,
+    store_id TEXT,
+    created_at TEXT,
+    payload TEXT,
+    synced INTEGER DEFAULT 0,
+    idempotency_key TEXT,
+    UNIQUE(store_id, idempotency_key)
+  )`);
+});
+
+const app = express();
+app.use(bodyParser.json());
+
+app.post('/local/orders', (req, res) => {
+  const { clientOrderId, storeId, idempotencyKey } = req.body;
+  const id = uuidv4();
+  const createdAt = new Date().toISOString();
+  const payload = JSON.stringify(req.body);
+  const stmt = db.prepare(`INSERT OR IGNORE INTO orders
+    (id, client_order_id, store_id, created_at, payload, idempotency_key)
+    VALUES (?, ?, ?, ?, ?, ?)`);

+  stmt.run(id, clientOrderId || id, storeId || 'store_local', createdAt, payload, idempotencyKey || clientOrderId || id, function(err){
+    if(err){
+      console.error(err);
+      return res.status(500).json({ error: 'db_error' });
+    }
+    // If row was ignored (duplicate), fetch existing
+    db.get(`SELECT * FROM orders WHERE idempotency_key = ?`, [idempotencyKey || clientOrderId || id], (err2, row) => {
+      if(err2) return res.status(500).json({ error: 'db_error' });
+      res.json({
+        localOrderId: row.id,
+        clientOrderId: row.client_order_id,
+        synced: !!row.synced
+      });
+    });
+  });
+});
+
+app.get('/local/menu', (req, res) => {
+  // Sample static menu
+  res.json([
+    { sku: 'ATT001', name: 'Attiéké + Thon', price: 3500 },
+    { sku: 'ATT002', name: 'Attiéké + Poulet', price: 3000 }
+  ]);
+});
+
+const PORT = process.env.PORT || 3000;
+app.listen(PORT, ()=>console.log('Local server listening on', PORT));
+
*** End Patch
```

------

## 15. Security & compliance appendix (short checklist)

- Ensure cloud endpoints use HTTPS with valid certs.
- Local device: disk encryption or encrypted DB.
- Tokenize payments & avoid storing PANs.
- Retention policy: orders retained for X months; purge older data per law.
- Backup schedule: cloud sync offers backup; local Pi snapshots nightly.
- PCI: use validated external terminals and avoid storing card data.

------

## 16. Operations playbook (onboarding + daily checklist + troubleshooting)

**Hardware checklist**

- Raspberry Pi 4 (4GB) + case + power supply
- 256GB USB SSD (local DB)
- Wi-Fi AP (configurable captive portal)
- Thermal printer (Ethernet/USB)
- Tablet for KDS + POS terminal if needed

**Onboarding steps**

1. Flash Pi image -> configure `config.json` with `storeId` and cloud URL.
2. Connect AP; ensure Pi reachable.
3. Start services `docker-compose up -d`.
4. Test order flow & printer.
5. Train staff: how to start/stop server, print manual receipt, and fallback procedure.

**Daily operator checklist**

- Start server and verify `GET /health` OK.
- Ensure printer paper & receipt logs.
- Confirm connection to cloud (if available) and last sync time.
- Check KDS for queued orders.

**Common failures & fixes**

- Printer offline: check Ethernet/USB, restart `local-server` service.
- Pi not synced: check `journalctl -u local-server` logs; restart service; check outbound firewall.
- AP captive portal not redirecting: reboot AP and verify captive portal config.

------

## Appendix — Quick references

### Hardware suggested SKUs & estimated price (approx)

*(Estimates in USD and approximate FCFA [1 USD ≈ 620 FCFA — adjust to local rate])*

| Item                 | SKU example                    | Est. USD | Est. FCFA | One-line justification                                |
| -------------------- | ------------------------------ | -------- | --------- | ----------------------------------------------------- |
| Raspberry Pi 4 (4GB) | Raspberry Pi 4 Model B         | $60      | 37,200    | Low-cost local server for PWA & sync.                 |
| USB SSD 256GB        | Samsung T5 / generic           | $40      | 24,800    | Fast reliable storage for local DB.                   |
| Wi-Fi AP             | TP-Link Omada EAP225           | $60      | 37,200    | Captive portal & strong local network features.       |
| Thermal Printer      | Generic ESC/POS / Epson TM-T20 | $80      | 49,600    | Standard receipt printing; Ethernet option preferred. |
| Android Tablet (KDS) | 8" Android tablet              | $100     | 62,000    | KDS display; cheap tablet works well.                 |
| Portable card reader | SumUp / Zettle                 | $70      | 43,400    | For card payments on-site.                            |

------

