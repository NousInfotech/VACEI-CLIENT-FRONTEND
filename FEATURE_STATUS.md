
# **VACEI Client Portal – Feature Status**

**Legend:**
✅ Completed | 🟡 Partially Implemented | ⏳ Not Started

---

## **1. Authentication & Global**

* Client login / logout: ✅
  *(Login page, token + cookie, logout in header)*
* Password reset: ✅
  *(Forgot / reset pages wired to backend)*
* MFA (optional): 🟡
  *(UI toggle in Settings; full TOTP/SMS flow not wired yet)*
* Client user roles (Owner / Admin / Viewer): 🟡
  *(Role badge + Request‑service guard in header; still no true role-based routing)*
* Multi-company selector: 🟡
  *(Company dropdown in header using localStorage; backend wiring pending)*
* Session management: 🟡
  *(UI session list + revoke in Settings; real backend sessions not wired)*
* Notifications (in-app + email): 🟡
  *(In-app bell dropdown + unread count; Settings email prefs UI; email delivery handled by backend)*

---

## **2. Global UI Shell**

* Header bar (search, quick actions, notifications, profile): ✅
  *(`TopHeader` with compact Quick Actions dropdown + company selector)*
* Sidebar navigation (Dashboard, Documents, Services, Compliance, Messages, Settings): ✅
  *(Grouped into Client portal / Workspaces & insights / Operations & tools / Settings)*
* Breadcrumbs: ✅
  *(`Breadcrumbs` under dashboard header)*
* Global search: ✅
  *(Header search → `/dashboard/search`)*

---

## **3. Dashboard**

* Company overview card: 🟡
  *(Welcome + summary; provider/firm not shown)*
* Compliance health indicator: ✅
  *(KPI strip on Dashboard + full KPIs on Compliance page)*
* Assigned provider / firm: ⏳
* Active services tiles: ✅
  *(`/dashboard/services`)*
* Pending actions: ✅
  *(Pending actions card on Dashboard fed from tasks API)*
* Compliance snapshot: ✅
  *(Dashboard compliance snapshot card + dedicated Compliance pages)*
* Quick actions (Upload / Request service / Send message): ✅
  *(Quick Actions dropdown in header + chat bubble for messaging)*

---

## **4. Documents (Master Vault)**

* Upload (drag & drop) / multi-file: ✅
  *(DocumentForm reused)*
* Tagging / service tagging / year-month: ✅
* Version control: 🟡
  *(Backend supports; UI not explicit)*
* OCR status: ⏳
* Preview / download: 🟡
  *(Available in organizer components; no consolidated page)*
* Replace version: 🟡
  *(Backend ready; UI not exposed)*
* Notes / comments: 🟡
  *(Backend supports; not surfaced per file in new UI)*
* Requested documents view: ✅
  *(`?tab=requested`, checklist, tasks)*
* Search & filters: ✅
* Document linking (BK / VAT / Audit / CSP / Legal): 🟡
  *(Model supports; UI not exposed)*
* Full audit trail: 🟡
  *(Model supports; UI not exposed)*

---

## **5. Services Hub**

* Services overview / status / open workspace: ✅
  *(`/dashboard/services` with tiles for each workspace)*
* Request new service: 🟡
  *(CTA to `/dashboard/services/request`; intake UI present, backend wiring pending)*

---

## **6. Service Request / Intake**

* Dynamic intake, required docs, upload, tracking: 🟡
  *(UI-only intake at `/dashboard/services/request`, drafts saved locally; no backend submission yet)*

---

## **7. Bookkeeping (Client)**

* Overview (status, last completed, missing items, uploads, tasks, summaries, reports): 🟡
  *(`/dashboard/services/bookkeeping` workspace UI; data wiring pending)*
* Insight view (bank activity, summaries, linked docs, Q&A): ⏳

---

## **8. VAT & Tax**

* VAT overview, registrations, periods, checks, submissions, payments, history, linked docs: 🟡
  *(`/dashboard/services/vat` workspace UI for registrations/periods/missing items; data wiring pending)*

---

## **9. Payroll**

* Overview, payslips, run status, history, requests: 🟡
  *(`/dashboard/services/payroll` workspace UI for payslips/run status/requests; data wiring pending)*

---

## **10. Audit**

* Engagement overview, timeline, doc requests, uploads, queries, reports, archive: 🟡
  *(`/dashboard/services/audit` workspace UI; detailed flows to be wired / reused from A4 backend)*

---

## **11. CSP & Corporate**

* Company profile, directors/shareholders, registers, filings, corp docs: 🟡
  *(`/dashboard/services/csp-mbr` workspace UI + MBR overview; detailed registers still to wire)*

---

## **12. MBR Submissions**

* MBR overview (status, last filed, deadlines, penalties): 🟡
  *Overview + upcoming deadlines section in `/dashboard/services/csp-mbr`; real statuses pending*
* Forms (M1–M5, K/K1/K2, R/R1/R2/R3, B2–B5, A1, FS/FSX, BO1–BO3): 🟡
  *(UI grid of all form codes with “Open” actions; per-form wizard + status/receipt flows still to build)*

---

## **13. Legal Workspace**

* Overview, matters, drafts, version compare, approvals, signed docs, messages, history: 🟡
  *(`/dashboard/services/legal` workspace UI for matters/drafts/finals/messages; detailed flows pending)*

---

## **14. Projects / Transactions**

* Projects, milestones, tasks, data room, messages, history: 🟡
  *(`/dashboard/services/projects` workspace UI; real project/task/data-room wiring pending)*

---

## **15. Compliance Calendar**

* Calendar view: ✅
  *(`/dashboard/compliance`)*
* List view: ✅
  *(`/dashboard/compliance/list`)*
* Deadline detail view: ✅
  *(`/dashboard/compliance/detail` – task detail reuse)*
* Filter by service: ✅
* Direct service links: 🟡
  *(Tasks open details; no deep-link to service workspace yet)*

---

## **16. Messages**

* Unified inbox, threads, attachments, read/unread, notifications: 🟡
  *(Floating chat bubble + full-page `/dashboard/messages` that auto-opens inbox; still using existing chat module layout, but functionally usable)*

---

## **17. Settings (Client)**

* Company profile: 🟡
  *(Tab in Settings with UI-only profile fields saved locally)*
* Client users & roles: 🟡
  *(Settings tab for users & roles; UI-only list + add user)*
* Notification preferences: 🟡
  *(Settings tab for notification toggles; backend wiring pending)*
* Security (MFA): 🟡
  *(Settings tab with MFA toggle; full flow pending)*
* Session history: 🟡
  *(Settings tab with UI-only session list & revoke)*
* Billing (if enabled): 🟡
  *(Settings tab placeholder for plans/billing details)*

---

## **18. Explicitly Excluded**

* Journal posting, COA editing, VAT box editing, payroll calculations, audit working papers, legal drafting: ✅
  *(Intentionally not implemented)*

---

## **Proposed Next Steps (to move 🟡 / ⏳ → ✅)**

1. **Messages:**
   Add a full-page inbox using existing ChatModule threads
   → Route: `/dashboard/messages`

3. **MFA Toggle:**
   Add Security UI in Settings (pending backend endpoints)
4. **Multi-company Selector:**
   Header dropdown once company list API is available
5. **Compliance → Service Links:**
   Deep-link tasks to their service workspaces
6. **Service Workspaces (BK / VAT / Payroll):**
   Create client-side overview pages (status, missing items, uploads)
7. **Service Intake Flow:**
   `/dashboard/services/request` with dynamic forms + required documents
8. **CSP / MBR:**
   Scaffold overview + per-form wizard pages with status mapping
9. **Settings Expansion:**
   Company profile, users/roles, notifications, sessions, billing stubs

