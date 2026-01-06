# VACEI – CLIENT PORTAL
## Complete UI/UX & Functionality Specification

**Version:** 1.0  
**Last Updated:** 2024  
**Project:** Client Frontend & Backend Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Global UI Shell](#global-ui-shell)
3. [Authentication & Authorization](#authentication--authorization)
4. [Dashboard](#dashboard)
5. [Documents (Master Vault)](#documents-master-vault)
6. [Services Hub](#services-hub)
7. [Service Workspaces](#service-workspaces)
8. [Compliance Calendar](#compliance-calendar)
9. [Messages](#messages)
10. [Settings](#settings)
11. [Backend API Requirements](#backend-api-requirements)
12. [Data Models](#data-models)
13. [User Flows](#user-flows)

---

## Overview

The VACEI Client Portal is a comprehensive service-based workspace platform that allows clients to:
- Upload and manage documents
- View service statuses and workspaces
- Track compliance deadlines
- Communicate with accountants
- Manage company profiles and users

**Key Principles:**
- Service-based architecture (no logic duplication)
- Document-driven workflows
- Real-time status updates
- Mobile-responsive design
- Intuitive UX with clear CTAs

---

## Global UI Shell

### Header Bar

**Location:** Fixed top of viewport

**Components:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Company Selector ▼]  [Search 🔍]  [🔔]  [Profile ▼] │
└─────────────────────────────────────────────────────────────┘
```

**Functionality:**
- **Company Selector:** Dropdown showing all companies user has access to
  - Shows company name, status indicator
  - Quick switch between companies
  - Shows current company badge
  
- **Global Search:** 
  - Search across documents, services, tasks, messages
  - Keyboard shortcut: `Ctrl/Cmd + K`
  - Recent searches dropdown
  - Search results grouped by type

- **Notifications Bell:**
  - Badge with unread count
  - Dropdown panel with:
    - Grouped by type (document, task, message, deadline)
    - Time-relative labels (2 hours ago, yesterday)
    - Mark as read/unread
    - Link to full notifications page
  - Real-time updates via WebSocket

- **Profile Menu:**
  - User name and role
  - Company name
  - Settings link
  - Logout button

**Implementation:**
- Component: `src/components/layout/Header.tsx`
- State: Global context for notifications, company selection
- API: `/api/notifications`, `/api/user/companies`

---

### Sidebar Navigation

**Location:** Left side, collapsible

**Navigation Items:**
```
┌─────────────────────┐
│ 📊 Dashboard        │
│ 📁 Documents        │
│ 🏢 Services         │
│ 📅 Compliance       │
│ 💬 Messages         │
│ ⚙️  Settings        │
└─────────────────────┘
```

**Features:**
- Active route highlighting
- Badge indicators for:
  - Pending document requests
  - Unread messages
  - Overdue compliance items
- Collapsible on mobile
- Keyboard navigation support

**Implementation:**
- Component: `src/components/layout/Sidebar.tsx`
- Routing: Next.js App Router
- Active state: `usePathname()` hook

---

### Breadcrumbs

**Location:** Below header, above main content

**Format:**
```
Home > Services > Bookkeeping > March 2024
```

**Functionality:**
- Clickable navigation
- Shows full path context
- Responsive (truncates on mobile)

---

## Authentication & Authorization

### Login Page

**Route:** `/login`

**UI Components:**
- Email/Username input
- Password input (with show/hide toggle)
- "Remember me" checkbox
- "Forgot password?" link
- Submit button
- Error message display area

**Validation:**
- Email format validation
- Password strength requirements
- Rate limiting (5 attempts per 15 minutes)

**API Endpoint:** `POST /api/auth/login`

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "owner",
    "companies": [...]
  }
}
```

---

### Password Reset Flow

**Step 1: Request Reset** (`/forgot-password`)
- Email input
- Submit button
- Success message: "If an account exists, you'll receive reset instructions"

**Step 2: Reset Password** (`/reset-password?token=...`)
- New password input
- Confirm password input
- Password strength indicator
- Submit button

**API Endpoints:**
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

---

### Multi-Factor Authentication (Optional)

**Setup Flow:**
1. User enables MFA in settings
2. QR code displayed for authenticator app
3. User scans and enters verification code
4. Backup codes generated and displayed

**Login Flow:**
1. User enters credentials
2. If MFA enabled, prompt for code
3. Code input field
4. "Use backup code" link

**API Endpoints:**
- `POST /api/auth/mfa/enable`
- `POST /api/auth/mfa/verify`
- `POST /api/auth/mfa/disable`

---

### Client User Roles

**Roles:**
- **Owner:** Full access, can manage users
- **Admin:** Full access except user management
- **Viewer:** Read-only access

**Permission Matrix:**
| Action | Owner | Admin | Viewer |
|--------|-------|-------|--------|
| View documents | ✅ | ✅ | ✅ |
| Upload documents | ✅ | ✅ | ❌ |
| Delete documents | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View services | ✅ | ✅ | ✅ |
| Request services | ✅ | ✅ | ❌ |
| View compliance | ✅ | ✅ | ✅ |
| Respond to queries | ✅ | ✅ | ❌ |

**Implementation:**
- Middleware: `src/middleware.ts`
- Role check utility: `src/utils/authUtils.ts`

---

## Dashboard

**Route:** `/dashboard`

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Company Overview Card                                   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Status       │ │ Provider     │ │ Health      │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
├─────────────────────────────────────────────────────────┤
│ Active Services                                         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ BK   │ │ VAT  │ │ Pay  │ │ Audit│                    │
│ │ Wait │ │ Draft│ │ Done │ │ Q(2) │                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                    │
├─────────────────────────────────────────────────────────┤
│ Pending Actions                                         │
│ • Upload bank statement (March)                        │
│ • Reply to audit query #12                             │
│ • Submit VAT return Q2                                  │
├─────────────────────────────────────────────────────────┤
│ Compliance Snapshot                                     │
│ Overdue: 2 | Due Soon: 3 | Waiting: 4 | Done: 12       │
├─────────────────────────────────────────────────────────┤
│ Quick Actions                                           │
│ [Upload Documents] [Request Service] [Send Message]    │
└─────────────────────────────────────────────────────────┘
```

### Components

#### 1. Company Overview Card

**Data Displayed:**
- Company name and registration number
- Current status (Active, Pending, Suspended)
- Assigned accountant/firm name
- Last activity date

**API:** `GET /api/dashboard/company-overview`

---

#### 2. Compliance Health Indicator

**Visual:**
- Circular progress indicator
- Color coding:
  - Green: 90-100% compliant
  - Yellow: 70-89% compliant
  - Orange: 50-69% compliant
  - Red: <50% compliant

**Calculation:**
```
Health = (Completed Tasks / Total Tasks) * 100
```

**API:** `GET /api/dashboard/compliance-health`

---

#### 3. Active Services Tiles

**Display:**
- Service icon/name
- Current status badge
- Action button (Open/Request)
- Status colors:
  - Waiting docs: Orange
  - Draft: Yellow
  - Done: Green
  - Queries: Red (with count)

**Click Action:** Navigate to service workspace

**API:** `GET /api/services/active`

---

#### 4. Pending Actions List

**Items Show:**
- Action description
- Service context
- Due date (if applicable)
- Direct action button

**Max Items:** 5 (with "View all" link)

**API:** `GET /api/dashboard/pending-actions`

---

#### 5. Compliance Snapshot

**KPI Strip:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Overdue  │ │ Due Soon │ │ Waiting   │ │ Done     │
│    2     │ │    3     │ │    4      │ │   12     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Click Action:** Navigate to Compliance Calendar

**API:** `GET /api/dashboard/compliance-snapshot`

---

#### 6. Quick Actions

**Buttons:**
- **Upload Documents:** Opens document upload modal/page
- **Request Service:** Opens service request form
- **Send Message:** Opens message composer

---

## Documents (Master Vault)

**Route:** `/documents`

### Main View Layout

```
┌─────────────────────────────────────────────────────────┐
│ Documents                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ [All]    │ │[Requested]│ │[Uploaded]│                │
│ └──────────┘ └──────────┘ └──────────┘                │
├─────────────────────────────────────────────────────────┤
│ [ Upload Zone ]                                         │
│                                                          │
│    Drag & drop files here                               │
│                                                          │
│    [Choose files]                                       │
│                                                          │
│    Upload to:                                           │
│    (•) Let VACEI decide                                │
│    ( ) Select service manually                          │
│        If manual: Service ▼  Period ▼                 │
├─────────────────────────────────────────────────────────┤
│ [ Smart Checklist - Missing Documents ]                │
│                                                          │
│ • Bookkeeping (March): Missing bank statement [Upload] │
│ • VAT (Q2): Missing 2 sales invoices [Upload]          │
│ • Audit: Missing contract [Upload]                      │
└─────────────────────────────────────────────────────────┘
```

### Tab Navigation

**Tabs:**
1. **All:** All documents (default)
2. **Requested:** Documents specifically requested by accountant
3. **Uploaded by you:** Documents uploaded by current user

**Filter State:** Persisted in URL query params

---

### Upload Zone

**Features:**
- Drag & drop area (highlighted on drag over)
- File picker button
- Multi-file selection support
- File type validation
- File size limit: 20MB per file
- Progress indicators for each file

**Upload Options:**

**Option 1: Let VACEI decide (Default)**
- AI/ML service assignment
- Automatic period detection
- Document type classification

**Option 2: Select service manually**
- Service dropdown (Bookkeeping, VAT, Audit, etc.)
- Period dropdown (based on selected service)
- Manual tagging option

**Upload Flow:**
1. User selects/drops files
2. Files appear in queue with preview
3. User selects upload option
4. Upload starts with progress bars
5. Success notification with sorting results

**Success Notification:**
```
┌─────────────────────────────────────┐
│ ✓ Uploaded successfully            │
│                                     │
│ • 9 documents received              │
│ • Sorted into: Bookkeeping (7),     │
│   VAT (2)                          │
│                                     │
│ Next:                               │
│ • Your accountant will review       │
│   within 24-48 hours.              │
│                                     │
│ Missing:                            │
│ • VAT (Q2): still missing 1 invoice │
│   [Upload now]                      │
└─────────────────────────────────────┘
```

**API Endpoints:**
- `POST /api/documents/upload` (with FormData)
- `POST /api/documents/upload-auto` (auto-assignment)
- `GET /api/documents/upload-status/:uploadId`

---

### Smart Checklist - Missing Documents

**Purpose:** Proactive document request display

**Data Source:** 
- Service requirements
- Document requests
- Compliance deadlines

**Display Format:**
- Service name and period
- Missing document description
- Count (if multiple)
- Direct upload button

**Click Action:** 
- Opens upload modal pre-filled with service/period
- Or navigates to upload page with filters

**API:** `GET /api/documents/missing-checklist`

---

### Document List View

**Table Columns:**
- Document name
- Type/Category
- Service (if assigned)
- Period
- Uploaded date
- Uploaded by
- Status
- Actions (Preview, Download, Replace, Delete)

**Features:**
- Sortable columns
- Search bar
- Filter by:
  - Service
  - Document type
  - Date range
  - Status
  - Uploaded by
- Pagination (20 per page)
- Bulk actions (select multiple)

**API:** `GET /api/documents?page=1&limit=20&filters=...`

---

### Document Detail View

**Route:** `/documents/:id`

**Sections:**
1. **Header:**
   - Document name
   - Status badge
   - Actions menu (Download, Replace, Delete)

2. **Metadata:**
   - Uploaded date
   - Uploaded by
   - File size
   - File type
   - Service assignment
   - Period
   - Tags

3. **Preview:**
   - PDF viewer
   - Image viewer
   - Office document viewer (via iframe)
   - Download button

4. **Version History:**
   - List of all versions
   - Upload date for each
   - "Restore version" option

5. **Comments:**
   - Thread of comments
   - Add comment form
   - @mention support

6. **Linked Items:**
   - Related transactions
   - Related VAT periods
   - Related audit requests
   - Related CSP filings

7. **Audit Trail:**
   - Timeline of all actions
   - User, action, timestamp

**API:** `GET /api/documents/:id`

---

### Document Linking

**Supported Links:**
- Bookkeeping transactions
- VAT periods
- Audit requests
- CSP filings
- Legal matters

**Implementation:**
- Many-to-many relationship
- Displayed in document detail view
- Clickable links to related items

**API:** 
- `POST /api/documents/:id/links`
- `DELETE /api/documents/:id/links/:linkId`

---

## Services Hub

**Route:** `/services`

### Services Overview

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Services                                                │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │ Bookkeeping  │ │ VAT & Tax    │ │ Payroll      │   │
│ │ Waiting docs │ │ Draft        │ │ Done         │   │
│ │ [Open]       │ │ [Open]       │ │ [Open]       │   │
│ └──────────────┘ └──────────────┘ └──────────────┘   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │ Audit        │ │ CSP/Corporate│ │ Legal        │   │
│ │ Queries (2)  │ │ Pending      │ │ None         │   │
│ │ [Open]       │ │ [Open]       │ │ [Request]    │   │
│ └──────────────┘ └──────────────┘ └──────────────┘   │
│ ┌──────────────┐                                       │
│ │ Projects     │                                       │
│ │ None         │                                       │
│ │ [Request]    │                                       │
│ └──────────────┘                                       │
│                                                         │
│ + [ Request a New Service ]                            │
└─────────────────────────────────────────────────────────┘
```

### Service Card Component

**Display:**
- Service name
- Status indicator with text
- Action button:
  - "Open" if service exists
  - "Request" if service not active

**Status Colors:**
- Waiting docs: Orange (#FF6B35)
- Draft: Yellow (#FFD23F)
- Done: Green (#06A77D)
- Queries: Red (#D00000) with count
- Pending filing: Blue (#3A86FF)
- None: Gray (#6C757D)

**Click Action:** Navigate to service workspace

**API:** `GET /api/services/overview`

---

### Request New Service

**Modal/Page:** `/services/request`

**Form Fields:**
1. Service selection (dropdown)
2. Service-specific intake form (dynamic)
3. Required documents checklist
4. Document upload area
5. Additional notes (optional)
6. Submit button

**Service-Specific Forms:**

**Bookkeeping:**
- Start date
- Accounting period (Monthly/Quarterly)
- Chart of accounts preference
- Bank accounts to connect

**VAT & Tax:**
- VAT registration number
- VAT period (Monthly/Quarterly)
- Tax year end
- Previous accountant details

**Audit:**
- Year end date
- Audit type (Statutory/Internal)
- Previous auditor details
- Engagement letter upload

**Payroll:**
- Payroll frequency
- Number of employees
- Payroll software (if any)

**CSP/Corporate:**
- Company registration number
- Company type
- Incorporation date

**Legal:**
- Legal matter type
- Urgency level
- Description

**Projects:**
- Project name
- Project type
- Start date
- Expected completion date

**API:** `POST /api/services/request`

---

## Service Workspaces

### Bookkeeping (Client)

**Route:** `/services/bookkeeping`

#### Overview View

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Bookkeeping                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Status: In Progress                                  │ │
│ │ Last Completed: February 2024                        │ │
│ │ Missing: Bank statement (March)                     │ │
│ │ [Upload Documents]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Requests / Tasks                                         │
│ • Upload bank statement for March                       │
│ • Clarify transaction #1234                            │
│                                                          │
│ Monthly Summaries                                        │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                    │
│ │ Jan  │ │ Feb  │ │ Mar  │ │ Apr  │                    │
│ │ ✓    │ │ ✓    │ │ ⏳   │ │ ⏳   │                    │
│ └──────┘ └──────┘ └──────┘ └──────┘                    │
│                                                          │
│ [Download Report PDF]                                   │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Status card with current period
- Missing items list
- Quick upload button
- Requests/tasks list
- Monthly summary tiles
- Report download button

**API:** `GET /api/services/bookkeeping/overview`

---

#### Insight View (Read-only)

**Route:** `/services/bookkeeping/insights`

**Features:**
- Bank activity table
- Transaction drawer (on click)
- Income & expense summaries
- Category breakdowns
- Linked/unlinked documents
- Expanded reports
- "Ask question" button
- "Upload clarification" button

**Bank Activity Table:**
- Date
- Description
- Amount
- Category
- Linked document (if any)
- Status (Reconciled/Pending)

**Transaction Drawer:**
- Full transaction details
- Linked documents
- Comments/notes
- Category assignment
- Edit request button (if needed)

**API:** `GET /api/services/bookkeeping/insights`

---

### VAT & Tax

**Route:** `/services/vat`

#### Overview

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ VAT & Tax                                                │
│                                                          │
│ VAT Registrations                                        │
│ • Registration #: MT12345678                            │
│ • Status: Active                                         │
│                                                          │
│ VAT Periods                                              │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Q1 2024      │ │ Q2 2024      │ │ Q3 2024      │     │
│ │ Submitted    │ │ Missing docs │ │ Not started  │     │
│ │ [View]       │ │ [View]       │ │ [View]       │     │
│ └──────────────┘ └──────────────┘ └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**API:** `GET /api/services/vat/overview`

---

#### Period Detail View

**Route:** `/services/vat/period/:periodId`

**Sections:**
1. **Period Info:**
   - Period (Q1 2024)
   - Due date
   - Status

2. **Missing Items:**
   - List of required documents
   - Upload buttons for each

3. **VAT Checks:**
   - Automated validation results
   - Warnings/errors

4. **Submission Status:**
   - Current status
   - Submission date (if submitted)
   - MBR confirmation (if applicable)

5. **Payment Info:**
   - VAT amount due
   - Payment deadline
   - Payment status

6. **VAT History:**
   - Previous submissions
   - Payment history

7. **Linked Documents:**
   - All documents for this period

**API:** `GET /api/services/vat/period/:periodId`

---

### Payroll

**Route:** `/services/payroll`

**Features:**
- Payroll overview
- Payslips list (by month)
- Payslip download (PDF)
- Payroll run status
- Payroll history
- Payroll requests

**API:** `GET /api/services/payroll/overview`

---

### Audit

**Route:** `/services/audit`

**Features:**
- Engagement overview
- Timeline of audit phases
- Document requests list
- Upload documents area
- Audit queries list
- Respond to queries interface
- Draft & final reports (download)
- Archive (completed audits)

**Query Response Interface:**
- Query text
- Related documents
- Response text area
- Attach documents
- Submit response button

**API:** `GET /api/services/audit/overview`

---

### CSP & Corporate

**Route:** `/services/csp`

**Features:**
- Company profile (read-only)
- Directors & shareholders snapshot
- Share register
- Corporate documents
- Corporate requests
- Filing status tracking

---

### ⚠️ MBR Submissions (Malta Business Registry)

**Route:** `/services/csp/mbr`

#### MBR Overview

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ MBR Submissions                                          │
│                                                          │
│ Company Status: Active                                   │
│ Last Filed: Annual Return A1 (2023) - 15 Jan 2024       │
│                                                          │
│ Upcoming Deadlines                                       │
│ • Annual Return A1 - Due: 30 Jun 2024 (Due soon)        │
│ • Financial Statements - Due: 31 Aug 2024              │
│                                                          │
│ Penalties / Overdue Alerts                               │
│ ⚠️ No current penalties                                 │
└─────────────────────────────────────────────────────────┘
```

**API:** `GET /api/services/csp/mbr/overview`

---

#### MBR Forms - Full List

**Company Lifecycle:**
- **M1** – Registration of a Company
- **M2** – Memorandum & Articles of Association
- **M3** – Change to Memorandum / Articles
- **M4** – Notice of dissolution / winding up
- **M5** – Re-registration / restoration

**Directors, Secretary & Officers:**
- **K** – Appointment / resignation of director or secretary
- **K1** – Change in personal details of director / secretary
- **K2** – Change in representation of director

**Share Capital & Ownership:**
- **R** – Share transfer
- **R1** – Allotment of shares
- **R2** – Redemption / cancellation of shares
- **R3** – Increase / reduction of share capital

**Company Details & Compliance:**
- **B2** – Change of registered office
- **B3** – Change of company name
- **B4** – Change of company objects
- **B5** – Company re-registration

**Annual & Financial Filings:**
- **A1** – Annual return
- **FS** – Filing of financial statements
- **FSX** – Revised / corrected financial statements

**Beneficial Ownership (UBO):**
- **BO1** – Initial UBO declaration
- **BO2** – Change in UBO details
- **BO3** – Confirmation of UBO information

---

#### Per-Form Client Flow

**Route:** `/services/csp/mbr/forms/:formCode`

**Example:** `/services/csp/mbr/forms/A1`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Annual Return (A1)                                       │
│                                                          │
│ Status: Draft                                            │
│                                                          │
│ Required Documents Checklist:                            │
│ ☑ Company registration certificate                      │
│ ☑ Directors' details                                    │
│ ☐ Financial statements                                  │
│ ☐ Shareholder register                                  │
│                                                          │
│ [Upload Supporting Documents]                            │
│                                                          │
│ Form Details:                                            │
│ [Form fields based on MBR form type]                    │
│                                                          │
│ [Save Draft] [Submit to Accountant]                     │
│                                                          │
│ Submitted Form (PDF):                                    │
│ [View] [Download]                                       │
│                                                          │
│ MBR Submission Confirmation:                             │
│ ✓ Submitted to MBR on 15 Jan 2024                      │
│ ✓ Filing receipt: [Download]                           │
└─────────────────────────────────────────────────────────┘
```

**Status Flow:**
1. **Draft** - Client filling form
2. **Waiting client** - Accountant requests changes
3. **Submitted** - Submitted to MBR
4. **Registered** - Confirmed by MBR

**Features:**
- Dynamic form fields based on form type
- Required documents checklist
- Document upload area
- Save draft functionality
- Submit to accountant button
- View submitted form (PDF)
- MBR submission confirmation
- Filing receipt storage

**API:**
- `GET /api/services/csp/mbr/forms/:formCode`
- `POST /api/services/csp/mbr/forms/:formCode`
- `PUT /api/services/csp/mbr/forms/:formCode/:formId`
- `GET /api/services/csp/mbr/forms/:formCode/:formId/submit`

---

### Legal Workspace

**Route:** `/services/legal`

**Features:**
- Legal overview
- Legal requests list
- Legal matters list
- Contract drafts
- Version comparison
- Comments / approvals
- Final signed documents
- Legal messages
- History

**API:** `GET /api/services/legal/overview`

---

### Projects / Transactions

**Route:** `/services/projects`

**Features:**
- Create project button
- Project type selection
- Project list
- Milestones tracking
- Tasks list
- Data room (documents)
- Project messages
- History

**API:** `GET /api/services/projects/overview`

---

## Compliance Calendar

**Route:** `/compliance`

### Calendar View

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Compliance Calendar                                      │
│                                                          │
│ View: [Calendar] [List]                                 │
│ Range: [This Month ▼]                                    │
│ Filter: Service ▼ Status ▼ Company ▼                    │
│                                                          │
│ [ KPI Strip ]                                            │
│ Overdue: 2 | Due soon (7d): 3 | Waiting: 4 | Done: 12  │
│                                                          │
│ [ Calendar Grid ]                                        │
│                                                          │
│  10  VAT Q2 Due (△)                                     │
│  12  Audit query reply (█ Waiting on you)              │
│  20  Payroll submission (█ In progress)                 │
│  30  Annual Return A1 (█ Due soon)                      │
│                                                          │
│ [ Selected Day Drawer ]                                  │
│                                                          │
│ - VAT Q2: Upload missing invoice [Upload]               │
│ - Audit query: Reply required [Reply]                   │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Month/week/day view toggle
- Click date to see details
- Color-coded status indicators
- Filter by service, status, company
- Range selector (This Month, This Quarter, This Year, Custom)

**Status Indicators:**
- △ Warning (due soon)
- █ Red square: Waiting on you
- █ Orange square: In progress
- █ Green square: Done
- █ Gray square: Not started

**API:** `GET /api/compliance/calendar?view=month&range=this-month&filters=...`

---

### List View

**Route:** `/compliance/list`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Compliance - List                                        │
│                                                          │
│ Filters: Service ▼ Status ▼ Search 🔍 ______           │
│                                                          │
│ ┌──────────┬──────────────┬─────────┬─────────┬──────┐ │
│ │Due Date  │ Item         │ Service │ Status  │ CTA  │ │
│ ├──────────┼──────────────┼─────────┼─────────┼──────┤ │
│ │10 Jan    │ Audit query  │ Audit   │ Waiting │Reply │ │
│ │          │ Q#12         │         │ you     │      │ │
│ ├──────────┼──────────────┼─────────┼─────────┼──────┤ │
│ │15 Jan    │ Bank stmt    │ BK      │Overdue │Upload│ │
│ │          │ (March)      │         │         │      │ │
│ ├──────────┼──────────────┼─────────┼─────────┼──────┤ │
│ │30 Jun    │ VAT Return   │ VAT     │Due soon│Open  │ │
│ │          │ Q2            │         │         │      │ │
│ ├──────────┼──────────────┼─────────┼─────────┼──────┤ │
│ │01 Aug    │ Annual Return│ MBR     │Not     │Start │ │
│ │          │ A1            │         │started  │      │ │
│ └──────────┴──────────────┴─────────┴─────────┴──────┘ │
└─────────────────────────────────────────────────────────┘
```

**Table Columns:**
- Due Date
- Item (description)
- Service
- Status
- CTA (Call to Action button)

**Features:**
- Sortable columns
- Search functionality
- Filter dropdowns
- Pagination
- Click row to view details

**API:** `GET /api/compliance/list?page=1&limit=20&filters=...`

---

### Deadline Detail View

**Route:** `/compliance/:taskId`

**Sections:**
1. Task details
2. Service context
3. Required actions
4. Related documents
5. History/timeline
6. Direct service link

**API:** `GET /api/compliance/:taskId`

---

## Messages

**Route:** `/messages`

### Unified Inbox

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Messages                                                 │
│                                                          │
│ ┌──────────────┐ ┌──────────────────────────────────┐  │
│ │ Inbox        │ │ [Selected Thread]                │  │
│ │              │ │                                  │  │
│ │ Service: All │ │ From: Accountant Name            │  │
│ │              │ │ Service: Bookkeeping             │  │
│ │ [Thread 1]   │ │                                  │  │
│ │ [Thread 2]   │ │ Message content...               │  │
│ │ [Thread 3]   │ │                                  │  │
│ │              │ │ [Reply]                          │  │
│ └──────────────┘ └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Service-based thread grouping
- Unread/read indicators
- Attachment support
- Real-time notifications
- Search functionality
- Filter by service

**API:**
- `GET /api/messages/inbox`
- `GET /api/messages/thread/:threadId`
- `POST /api/messages/thread/:threadId/reply`

---

## Settings

**Route:** `/settings`

### Sections

1. **Company Profile**
   - Company name
   - Registration number
   - Address
   - Contact details
   - Logo upload

2. **Client Users & Roles**
   - User list
   - Add user
   - Edit user
   - Remove user
   - Role assignment

3. **Notification Preferences**
   - Email notifications toggle
   - In-app notifications toggle
   - Notification types:
     - Document requests
     - Task assignments
     - Deadline reminders
     - Messages
     - Service updates

4. **Security**
   - Change password
   - MFA setup
   - Session management
   - Active sessions list

5. **Billing** (if enabled)
   - Current plan
   - Payment method
   - Invoice history
   - Usage statistics

**API:**
- `GET /api/settings/company`
- `PUT /api/settings/company`
- `GET /api/settings/users`
- `POST /api/settings/users`
- `PUT /api/settings/notifications`

---

## Backend API Requirements

### Base URL Structure

```
/api/v1/client/...
```

### Authentication

All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

### Document APIs

#### Upload Document
```
POST /api/v1/client/documents/upload
Content-Type: multipart/form-data

Body:
- files: File[]
- autoAssign: boolean (default: true)
- serviceId?: number
- periodId?: number
- tags?: string[]
```

#### Get Documents
```
GET /api/v1/client/documents
Query params:
- page: number
- limit: number
- tab: 'all' | 'requested' | 'uploaded'
- serviceId?: number
- type?: string
- dateFrom?: string
- dateTo?: string
- search?: string
```

#### Get Document Detail
```
GET /api/v1/client/documents/:id
```

#### Get Missing Checklist
```
GET /api/v1/client/documents/missing-checklist
```

#### Delete Document
```
DELETE /api/v1/client/documents/:id
```

#### Replace Document Version
```
POST /api/v1/client/documents/:id/replace
Content-Type: multipart/form-data

Body:
- file: File
```

---

### Service APIs

#### Get Services Overview
```
GET /api/v1/client/services/overview
```

#### Get Service Detail
```
GET /api/v1/client/services/:serviceCode
```

#### Request New Service
```
POST /api/v1/client/services/request
Body:
{
  serviceCode: string
  intakeData: object
  documents: File[]
  notes?: string
}
```

#### Get Bookkeeping Overview
```
GET /api/v1/client/services/bookkeeping/overview
```

#### Get Bookkeeping Insights
```
GET /api/v1/client/services/bookkeeping/insights
Query params:
- period?: string
- category?: string
```

#### Get VAT Overview
```
GET /api/v1/client/services/vat/overview
```

#### Get VAT Period Detail
```
GET /api/v1/client/services/vat/period/:periodId
```

#### Get MBR Overview
```
GET /api/v1/client/services/csp/mbr/overview
```

#### Get MBR Form
```
GET /api/v1/client/services/csp/mbr/forms/:formCode
```

#### Create/Update MBR Form
```
POST /api/v1/client/services/csp/mbr/forms/:formCode
PUT /api/v1/client/services/csp/mbr/forms/:formCode/:formId

Body:
{
  formData: object
  documents: File[]
  status: 'draft' | 'submitted'
}
```

---

### Compliance APIs

#### Get Compliance Calendar
```
GET /api/v1/client/compliance/calendar
Query params:
- view: 'month' | 'week' | 'day'
- range: 'this-month' | 'this-quarter' | 'this-year' | 'custom'
- startDate?: string
- endDate?: string
- serviceId?: number
- status?: string
```

#### Get Compliance List
```
GET /api/v1/client/compliance/list
Query params:
- page: number
- limit: number
- serviceId?: number
- status?: string
- search?: string
```

#### Get Compliance Task Detail
```
GET /api/v1/client/compliance/:taskId
```

---

### Dashboard APIs

#### Get Dashboard Overview
```
GET /api/v1/client/dashboard/overview
```

#### Get Company Overview
```
GET /api/v1/client/dashboard/company-overview
```

#### Get Compliance Health
```
GET /api/v1/client/dashboard/compliance-health
```

#### Get Pending Actions
```
GET /api/v1/client/dashboard/pending-actions
```

#### Get Compliance Snapshot
```
GET /api/v1/client/dashboard/compliance-snapshot
```

---

### Message APIs

#### Get Inbox
```
GET /api/v1/client/messages/inbox
Query params:
- serviceId?: number
- unreadOnly?: boolean
```

#### Get Thread
```
GET /api/v1/client/messages/thread/:threadId
```

#### Reply to Thread
```
POST /api/v1/client/messages/thread/:threadId/reply
Body:
{
  message: string
  attachments?: File[]
}
```

---

### Settings APIs

#### Get Company Settings
```
GET /api/v1/client/settings/company
```

#### Update Company Settings
```
PUT /api/v1/client/settings/company
Body:
{
  name?: string
  registrationNumber?: string
  address?: object
  contactDetails?: object
}
```

#### Get Users
```
GET /api/v1/client/settings/users
```

#### Create User
```
POST /api/v1/client/settings/users
Body:
{
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'admin' | 'viewer'
}
```

#### Update User
```
PUT /api/v1/client/settings/users/:userId
Body:
{
  role?: string
  status?: string
}
```

#### Get Notification Preferences
```
GET /api/v1/client/settings/notifications
```

#### Update Notification Preferences
```
PUT /api/v1/client/settings/notifications
Body:
{
  emailEnabled: boolean
  inAppEnabled: boolean
  types: object
}
```

---

## Data Models

### Document Model (Extended)

```typescript
interface Document {
  id: number
  userId: number
  documentTitle: string
  year: number
  month: number
  notes?: string
  statusId: number
  status: DocumentStatus
  assignedAccountantId?: number
  serviceId?: number
  periodId?: number
  tags: DocumentTag[]
  categories: DocumentCategory[]
  files: DocumentFile[]
  links: DocumentLink[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

interface DocumentFile {
  id: number
  documentId: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  uploadedById?: number
  parentId?: number // For versioning
  extractedData?: object
  createdAt: Date
}

interface DocumentLink {
  id: number
  documentId: number
  linkType: 'transaction' | 'vat_period' | 'audit_request' | 'csp_filing' | 'legal_matter'
  linkedEntityType: string
  linkedEntityId: number
  createdAt: Date
}
```

---

### Service Model

```typescript
interface Service {
  id: number
  serviceCode: string
  name: string
  description?: string
  status: 'active' | 'draft' | 'pending' | 'completed'
  clientId: number
  accountantId?: number
  metadata: object // Service-specific data
  createdAt: Date
  updatedAt: Date
}

interface ServiceRequest {
  id: number
  serviceCode: string
  clientId: number
  intakeData: object
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: Date
  approvedAt?: Date
}
```

---

### Compliance Task Model

```typescript
interface ComplianceTask {
  id: number
  clientId: number
  serviceId?: number
  title: string
  description?: string
  dueDate: Date
  status: 'not_started' | 'in_progress' | 'waiting_client' | 'done' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  taskType: 'document_upload' | 'query_response' | 'form_submission' | 'payment'
  relatedEntityType?: string
  relatedEntityId?: number
  createdAt: Date
  updatedAt: Date
}
```

---

### MBR Form Model

```typescript
interface MBRForm {
  id: number
  formCode: string // 'A1', 'M1', 'K', etc.
  clientId: number
  serviceId: number
  status: 'draft' | 'waiting_client' | 'submitted' | 'registered'
  formData: object // Dynamic based on form type
  requiredDocuments: MBRFormDocument[]
  submittedFormUrl?: string
  mbrSubmissionDate?: Date
  mbrConfirmationNumber?: string
  filingReceiptUrl?: string
  createdAt: Date
  updatedAt: Date
}

interface MBRFormDocument {
  id: number
  formId: number
  documentType: string
  documentId: number
  isRequired: boolean
  uploaded: boolean
}
```

---

### Message Model

```typescript
interface MessageThread {
  id: number
  clientId: number
  accountantId: number
  serviceId?: number
  subject: string
  lastMessageAt: Date
  unreadCount: number
  messages: Message[]
  createdAt: Date
}

interface Message {
  id: number
  threadId: number
  senderId: number
  receiverId: number
  message: string
  attachments: MessageAttachment[]
  read: boolean
  createdAt: Date
}

interface MessageAttachment {
  id: number
  messageId: number
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
}
```

---

## User Flows

### Document Upload Flow

1. User navigates to Documents page
2. User drags files or clicks "Choose files"
3. Files appear in upload queue
4. User selects upload option:
   - Auto-assign (default)
   - Manual service selection
5. User clicks upload
6. Progress bars show for each file
7. Success notification appears with:
   - Number of documents received
   - Service assignments
   - Next steps
   - Missing items reminder
8. Documents appear in document list
9. Smart checklist updates

---

### Service Request Flow

1. User clicks "Request a New Service"
2. Service selection dropdown appears
3. User selects service
4. Dynamic intake form loads
5. User fills form fields
6. Required documents checklist displays
7. User uploads documents
8. User adds optional notes
9. User submits request
10. Confirmation message appears
11. Request appears in "Pending" status
12. Notification sent to accountant
13. User receives notification when approved/rejected

---

### Compliance Task Flow

1. User views Compliance Calendar
2. User sees task with "Waiting on you" status
3. User clicks task
4. Task detail drawer opens
5. User sees required action (e.g., "Upload missing invoice")
6. User clicks action button
7. Upload modal opens (pre-filled with service/period)
8. User uploads document
9. Task status updates to "In progress"
10. Notification sent to accountant
11. Task status updates when accountant reviews

---

### MBR Form Submission Flow

1. User navigates to CSP > MBR Submissions
2. User sees upcoming deadline (e.g., Annual Return A1)
3. User clicks "Start" or form name
4. MBR form page loads with:
   - Form fields
   - Required documents checklist
   - Upload area
5. User fills form fields
6. User uploads required documents
7. User clicks "Save Draft" (optional)
8. User clicks "Submit to Accountant"
9. Form status changes to "Waiting accountant"
10. Accountant reviews and submits to MBR
11. Form status changes to "Submitted"
12. MBR confirmation received
13. Form status changes to "Registered"
14. Filing receipt stored and available for download

---

### Message Thread Flow

1. User receives notification of new message
2. User clicks notification or navigates to Messages
3. Unread thread appears highlighted
4. User clicks thread
5. Message history loads
6. User reads messages
7. User types reply
8. User optionally attaches files
9. User clicks "Send"
10. Message appears in thread
11. Thread marked as read
12. Notification sent to accountant

---

## Implementation Notes

### Frontend Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / shadcn/ui
- **State Management:** React Context + Zustand (if needed)
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios
- **Date Handling:** date-fns
- **Icons:** Lucide React

### Backend Technology Stack

- **Framework:** Node.js + Express
- **Database:** PostgreSQL (via Prisma)
- **ORM:** Prisma
- **Authentication:** JWT
- **File Storage:** AWS S3 / Azure Blob Storage
- **Real-time:** WebSocket (Socket.io)

### File Structure

```
client_frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx (Dashboard)
│   │   │   └── ...
│   │   ├── documents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx (Services Hub)
│   │   │   ├── request/
│   │   │   │   └── page.tsx
│   │   │   ├── bookkeeping/
│   │   │   │   ├── page.tsx
│   │   │   │   └── insights/
│   │   │   │       └── page.tsx
│   │   │   ├── vat/
│   │   │   │   ├── page.tsx
│   │   │   │   └── period/
│   │   │   │       └── [periodId]/
│   │   │   │           └── page.tsx
│   │   │   └── csp/
│   │   │       ├── mbr/
│   │   │       │   ├── page.tsx
│   │   │       │   └── forms/
│   │   │       │       ├── [formCode]/
│   │   │       │       │   └── page.tsx
│   │   │       │       └── [formCode]/
│   │   │       │           └── [formId]/
│   │   │       │               └── page.tsx
│   │   │       └── page.tsx
│   │   ├── compliance/
│   │   │   ├── page.tsx (Calendar View)
│   │   │   ├── list/
│   │   │   │   └── page.tsx
│   │   │   └── [taskId]/
│   │   │       └── page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [threadId]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── documents/
│   │   │   ├── UploadZone.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── SmartChecklist.tsx
│   │   │   └── DocumentDetail.tsx
│   │   ├── services/
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── ServiceRequestForm.tsx
│   │   │   └── ...
│   │   ├── compliance/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── ListView.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── KPIBar.tsx
│   │   └── messages/
│   │       ├── Inbox.tsx
│   │       ├── ThreadList.tsx
│   │       └── MessageComposer.tsx
│   ├── api/
│   │   ├── documentService.tsx
│   │   ├── serviceService.tsx
│   │   ├── complianceService.tsx
│   │   └── ...
│   └── types/
│       ├── document.ts
│       ├── service.ts
│       ├── compliance.ts
│       └── mbr.ts
```

---

## Testing Requirements

### Unit Tests
- Component rendering
- Form validation
- API service functions
- Utility functions

### Integration Tests
- User flows (document upload, service request)
- API endpoints
- Authentication/authorization
