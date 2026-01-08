
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
  *(Security tab + dedicated `/mfa` verify screen (6-digit code UI) on frontend; full backend TOTP/SMS flow still pending)*
* Client user roles (Owner / Admin / Viewer): 🟡
  *(Role badge + Request‑service guard in header + UI-only users & roles tab; no true role-based routing yet)*
* Multi-company selector: 🟡
  *(Company dropdown in header + onboarding company selector using localStorage; backend wiring pending)*
* First-time onboarding: ✅
  *(`/onboarding/company-select`, `/onboarding/company-setup` (3-step wizard), `/onboarding/choose-services`; UI-only with localStorage)*
* Session management: 🟡
  *(UI session list + revoke in Settings; real backend sessions not wired)*
* Notifications (in-app + email): 🟡
  *(In-app bell dropdown + unread count; Settings email prefs UI; email delivery handled by backend)*

---

## **2. Global UI Shell**

* Header bar (search, quick actions, notifications, profile): ✅
  *(`TopHeader` with compact Quick Actions dropdown + company selector)*
* Global upload drawer: ✅
  *(`GlobalUploadDrawer` triggered from Quick Actions; drag & drop, smart detection, service/period/tag selection, upload success screen)*
* Sidebar navigation (Dashboard, Documents, Services, Compliance, Messages, Settings): ✅
  *(Grouped into Client portal / Workspaces & insights / Operations & tools / Settings)*
* Breadcrumbs: ✅
  *(`Breadcrumbs` under dashboard header)*
* Global search: ✅
  *(Header search → `/dashboard/search`)*

---

## **3. Dashboard**

* Company & health header: ✅
  *(Company name + health status indicator (🟥/🟨/🟩) based on compliance counts)*
* Compliance KPI strip: ✅
  *(Horizontal strip: Overdue | Due soon (7d) | Waiting on you | Done (30d) with color-coded values)*
* Top Priority Actions: ✅
  *(Numbered priority items with action buttons: Upload documents, Reply to queries, etc.)*
* Active Services: ✅
  *(List of active services with status, next action hint, and Open buttons)*
* Recently Completed: ✅
  *(Checkmark items (VAT Q1, Payroll May, MBR BO2) with View links)*
* Recent Activity & Messages/Updates: ✅
  *(Two-column layout showing recent activity and message updates)*
* Company overview card: 🟡
  *(Welcome + summary; provider/firm not shown)*
* Assigned provider / firm: ⏳
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
  *(CTA to `/dashboard/services/request`; intake UI present, backend submission wiring pending)*

---

## **6. Service Request / Intake**

* Dynamic intake, required docs, upload, tracking: 🟡
  *(Intake UI at `/dashboard/services/request`, drafts saved locally; no backend submission yet)*

---

## **7. Bookkeeping (Client)**

* Overview (status, last completed, missing items, uploads, tasks, summaries, reports): 🟡
  *(`/dashboard/services/bookkeeping` workspace UI with Overview/Insight tabs; data wiring pending)*
* Insight view (bank activity, summaries, linked docs, Q&A): 🟡
  *(Insight tab with read-only bank activity table (Date, Description, Amount, Category, Doc, Status) + summary KPIs placeholder)*

---

## **8. VAT & Tax**

* VAT overview, registrations, periods, checks, submissions, payments, history, linked docs: 🟡
  *(`/dashboard/services/vat` workspace UI for registrations/periods/missing items; data wiring pending)*
* VAT period detail: ✅
  *(`/dashboard/services/vat/period/[periodId]` with summary (Sales/Purchase/Net VAT), missing items, automated checks (✅/⚠/❌), submission status, linked documents)*

---

## **9. Payroll**

* Overview, payslips, run status, history, requests: 🟡
  *(`/dashboard/services/payroll` workspace UI for payslips/run status/requests; data wiring pending)*

---

## **10. Audit**

* Engagement overview, timeline, doc requests, uploads, queries, reports, archive: 🟡
  *(`/dashboard/services/audit` workspace UI with tabs [Requests] [Queries] [Reports] [Messages]; Requests table (Item, Due, Status, Action), Queries table with Open/Reply; detailed flows to be wired / reused from A4 backend)*

---

## **11. CSP & Corporate**

* Company profile, directors/shareholders, registers, filings, corp docs: 🟡
  *(`/dashboard/services/csp-mbr` workspace UI + MBR overview; detailed registers still to wire)*

---

## **12. MBR Submissions**

* MBR overview (status, last filed, deadlines, penalties): 🟡
  *Overview + upcoming deadlines section in `/dashboard/services/csp-mbr`; real statuses pending*
* MBR submissions list: ✅
  *(`/dashboard/services/csp-mbr/mbr-submissions` with filters (Type/Status/Year), table of all forms (A1, BO1, BO2, FS, R, B2, K, etc.) showing Due, Status, Start/Open/View actions)*
* MBR form detail: ✅
  *(`/dashboard/services/csp-mbr/mbr-submissions/[code]` with status (Draft/Waiting/Submitted/Registered), required documents checklist with Upload buttons, form preview placeholder, Messages note, action buttons)*
* Forms (M1–M5, K/K1/K2, R/R1/R2/R3, B2–B5, A1, FS/FSX, BO1–BO3): 🟡
  *(All form codes accessible via submissions list; per-form wizard + status/receipt flows still to build)*

---

## **13. Legal Workspace**

* Overview, matters, drafts, version compare, approvals, signed docs, messages, history: 🟡
  *(`/dashboard/services/legal` workspace UI for matters/drafts/finals/messages; detailed flows pending)*

---

## **14. Projects / Transactions**

* Projects, milestones, tasks, data room, messages, history: 🟡
  *(`/dashboard/services/projects` workspace UI with project type selector (Merger/Liquidation/M&A/Advisory), projects table (Name, Type, Status, Next milestone, Open), milestones flow (Intake → Docs → Review → Filing → Complete), data room & history cards; real project/task/data-room wiring pending)*

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

* Unified inbox, threads, attachments, read/unread, notifications: ✅
  *(Floating chat bubble + full-page `/dashboard/messages` auto-opening the inbox; existing chat module reused end‑to‑end)*

---

## **17. Settings (Client)**

* Company profile: 🟡
  *(Tab in Settings with UI-only profile fields saved locally; backend sync pending)*
* Client users & roles: 🟡
  *(Settings tab for users & roles; UI-only list + add user; backend user management pending)*
* Notification preferences: 🟡
  *(Settings tab for notification toggles; backend wiring pending)*
* Security (MFA): 🟡
  *(Settings tab with MFA toggle + `/mfa` verify screen; full backend MFA flow pending)*
* Session history: 🟡
  *(Settings tab with UI-only session list & revoke; backend sessions pending)*
* Billing (if enabled): 🟡
  *(Settings tab placeholder for plans/billing details; billing backend not implemented)*

---

## **18. Explicitly Excluded**

* Journal posting, COA editing, VAT box editing, payroll calculations, audit working papers, legal drafting: ✅
  *(Intentionally not implemented)*

---

## **Proposed Next Steps (to move 🟡 / ⏳ → ✅)**

1. **Backend wiring for MFA & sessions:**
   Implement TOTP/SMS endpoints, verification, and real session revocation to back the existing UI.
2. **True role-based access control:**
   Enforce Owner/Admin/Viewer permissions across routes and actions using backend roles.
3. **Multi-company backend support:**
   Expose company list + active company switcher API so the selector and onboarding feed real data.
4. **Onboarding backend integration:**
   Connect company setup wizard and service selection to backend company/user creation APIs.
5. **Global upload drawer backend:**
   Wire smart detection, service/period/tag auto-assignment, and upload success feedback to document APIs.
6. **Documents advanced features:**
   Surface version history, replace‑version, audit trail, and cross‑service linking from the backend.
7. **VAT period detail backend:**
   Connect period summary, missing items, automated checks, and submission status to VAT APIs.
8. **MBR form workflows:**
   Implement per‑form wizards, validation, document upload, and filing status mapping for all MBR forms.
9. **Service intake & workspaces:**
   Connect intake requests and workspace overviews (BK/VAT/Payroll/Audit/Projects/Legal) to backend service/job records.
10. **Dashboard data integration:**
    Wire Top Priority Actions, Active Services, Recently Completed, and Recent Activity to real backend data.

