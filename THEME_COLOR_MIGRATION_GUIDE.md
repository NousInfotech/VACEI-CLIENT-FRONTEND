# Theme Color Migration Guide

## 🎯 Overview

This guide provides step-by-step instructions for replacing hardcoded colors throughout the `client_frontend` project with CSS variables from `globals.css`, matching the A4-MALTA-AUDIT-PORTAL theme system.

---

## 📋 Table of Contents

1. [Available CSS Utility Classes](#-available-css-utility-classes)
2. [Color System Reference](#color-system-reference)
3. [Quick Replacement Cheat Sheet](#-quick-replacement-cheat-sheet)
4. [Step-by-Step Migration Process](#step-by-step-migration-process)
5. [Common Patterns & Examples](#common-patterns--examples)
6. [File-by-File Checklist](#file-by-file-checklist)
7. [Testing & Verification](#testing--verification)

---

## 🎨 Color System Reference

### CSS Variables in `globals.css`

All colors are defined as HSL values in `:root` with hex equivalents in comments:

#### Core Colors
```css
--background: 228 100% 98%;        /* #f5f7ff - Body Background */
--foreground: 222 47% 11%;         /* #0f1729 - Body Text */
--card: 0 0% 100%;                 /* #ffffff - Pure white */
--card-foreground: 222 47% 11%;    /* #0f1729 - Body Text */
```

#### Brand Colors
```css
--primary: 222 47% 11%;            /* #0f1729 - Primary Color */
--primary-foreground: 0 0% 100%;   /* #ffffff - Primary Text */
--primary-hover: 222 47% 15%;      /* #1a2332 - Hover state */

--secondary: 215 25% 27%;          /* #344256 - Slate Gray */
--secondary-foreground: 0 0% 100%; /* #ffffff - Accent Text */

--accent: 43 96% 56%;              /* #f59e0b - Gold */
--accent-foreground: 222 47% 11%; /* #0f1729 - Deep navy text */
--accent-hover: 43 96% 62%;        /* #fbbf24 - Lighter gold */
```

#### Sidebar Colors (Matching 6th Image Theme)
```css
--sidebar-background: 222 47% 11%;        /* #0f1729 - Deep Navy Blue */
--sidebar-foreground: 220 14% 96%;        /* #f3f4f6 - Light cool gray text */
--sidebar-primary: 43 96% 56%;            /* #f59e0b - Gold accent */
--sidebar-accent: 215 25% 27%;           /* #344256 - Slate gray */
--sidebar-hover: 215 25% 27%;            /* #344256 - Slate gray for hover */
--sidebar-active: 215 25% 27%;            /* #344256 - Slate gray for active */
--sidebar-border: 215 25% 27%;            /* #344256 - Slate gray border */
```

#### Status Colors
```css
--success: 142 76% 36%;           /* #10b981 - Emerald Green */
--warning: 38 92% 50%;             /* #f59e0b - Amber */
--destructive: 0 84% 60%;          /* #ef4444 - Red */
--info: 214 88% 52%;               /* #3b82f6 - Electric Blue */
```

#### Interface Elements
```css
--border: 220 13% 91%;             /* #e5e7eb - Light gray border */
--input: 228 100% 98%;             /* #f5f7ff - Body Background */
--ring: 222 47% 11%;               /* #0f1729 - Primary Color */
--muted: 220 14% 96%;              /* #f3f4f6 - Light cool gray */
```

---

## 🎨 Available CSS Utility Classes

All utility classes are defined in `globals.css` and can be used directly in your components:

### Background Classes
- `.bg-brand-primary` - Primary brand color
- `.bg-brand-accent` - Accent color (grey)
- `.bg-brand-body` - Main body background
- `.bg-brand-sidebar` - Sidebar background
- `.bg-brand-hover` - Hover state
- `.bg-brand-active` - Active/selected state
- `.bg-brand-muted` - Muted/disabled state
- `.bg-sidebar-background` - Sidebar background
- `.bg-sidebar-hover` - Sidebar hover state
- `.bg-sidebar-active` - Sidebar active state
- `.bg-sidebar-accent` - Sidebar accent
- `.bg-card` - Card background
- `.bg-input` - Input field background
- `.bg-success` - Success state
- `.bg-warning` - Warning state
- `.bg-destructive` - Error/destructive state
- `.bg-info` - Info state

### Text Classes
- `.text-brand-primary` - Primary brand text
- `.text-brand-accent` - Accent text
- `.text-brand-body` - Body text
- `.text-brand-sidebar` - Sidebar text
- `.text-muted-foreground` - Muted text
- `.text-sidebar-foreground` - Sidebar foreground text
- `.text-sidebar-muted` - Sidebar muted text
- `.text-card-foreground` - Card text
- `.text-success-foreground` - Success text
- `.text-warning-foreground` - Warning text
- `.text-destructive-foreground` - Error text
- `.text-info-foreground` - Info text

### Border Classes
- `.border-brand-primary` - Primary brand border
- `.border-brand-accent` - Accent border
- `.border-brand-sidebar` - Sidebar border
- `.border-sidebar-border` - Sidebar border
- `.border-border` - Standard border

---

## ⚡ Quick Replacement Cheat Sheet

### Background Colors

| Old Hardcoded | New CSS Utility Class | Usage |
|--------------|----------------------|-------|
| `bg-white` | `bg-card` or `bg-brand-body` | Cards, main backgrounds |
| `bg-gray-50` | `bg-brand-body` | Page backgrounds |
| `bg-brand-muted` | `bg-brand-muted` | Subtle backgrounds |
| `bg-gray-900` | `bg-sidebar-background` or `bg-brand-sidebar` | Dark sections, sidebar |
| `bg-gray-800` | `bg-sidebar-hover` | Hover states, dark cards |
| `bg-blue-600` | `bg-brand-primary` | Primary buttons |
| `bg-amber-500` | `bg-brand-accent` | Accent elements |
| `bg-yellow-400` | `bg-brand-accent` | Accent elements |

### Text Colors

| Old Hardcoded | New CSS Utility Class | Usage |
|--------------|----------------------|-------|
| `text-black` | `text-brand-body` | Body text |
| `text-gray-900` | `text-brand-body` | Headings |
| `text-gray-600` | `text-muted-foreground` | Muted text |
| `text-gray-300` | `text-sidebar-foreground` or `text-brand-sidebar` | Sidebar text |
| `text-white` | `text-card-foreground` | Text on dark backgrounds |
| `text-blue-600` | `text-brand-primary` | Primary links |
| `text-amber-500` | `text-brand-accent` | Accent text |

### Border Colors

| Old Hardcoded | New CSS Utility Class | Usage |
|--------------|----------------------|-------|
| `border-gray-200` | `border-border` | Standard borders |
| `border-gray-300` | `border-border` | Input borders |
| `border-gray-800` | `border-sidebar-border` or `border-brand-sidebar` | Sidebar borders |

### Using Inline Styles (For Dynamic/Opacity)

```tsx
// For opacity variants
style={{ backgroundColor: `hsl(var(--sidebar-background) / 0.8)` }}
style={{ color: `hsl(var(--foreground) / 0.7)` }}
style={{ borderColor: `hsl(var(--border))` }}
```

---

## 🔄 Step-by-Step Migration Process

### Phase 1: Preparation (5 minutes)

1. **Backup your work**
   ```bash
   git add .
   git commit -m "Backup before theme migration"
   ```

2. **Open Find & Replace in VS Code**
   - Press `Ctrl+Shift+H` (Windows/Linux) or `Cmd+Shift+H` (Mac)
   - Enable Regex mode (click `.*` icon)

3. **Set search scope**
   - Files to include: `src/**/*.{tsx,ts,jsx,js}`

### Phase 2: Background Colors (15 minutes)

#### Step 1: Replace Common Background Patterns

```regex
# Find: bg-white
# Replace: bg-card

# Find: bg-gray-50
# Replace: bg-brand-body

# Find: bg-brand-muted
# Replace: bg-brand-muted

# Find: bg-gray-900
# Replace: bg-sidebar-background

# Find: bg-gray-800
# Replace: bg-sidebar-hover

# Find: bg-blue-600
# Replace: bg-brand-primary

# Find: bg-amber-500|bg-yellow-400
# Replace: bg-brand-accent
```

**⚠️ Important:** Review each replacement in context. Some `bg-gray-900` in dashboard pages should become `bg-brand-body` instead.

#### Step 2: Context-Aware Replacements

**For Dashboard Pages:**
- Page containers (`min-h-screen bg-gray-900`) → `min-h-screen bg-brand-body`
- Dark cards → `bg-sidebar-background`

**For Auth Pages:**
- Keep dark theme → `bg-sidebar-background`

**For Modals/Dialogs:**
- Modal backgrounds → `bg-sidebar-background`

### Phase 3: Text Colors (10 minutes)

```regex
# Find: text-black|text-gray-900
# Replace: text-brand-body

# Find: text-gray-600|text-gray-700
# Replace: text-muted-foreground

# Find: text-gray-300|text-white
# Context: In sidebar components
# Replace: text-sidebar-foreground

# Find: text-blue-600
# Replace: text-brand-primary

# Find: text-amber-500|text-yellow-600
# Replace: text-brand-accent
```

### Phase 4: Border Colors (5 minutes)

```regex
# Find: border-gray-200|border-gray-300
# Replace: border-border

# Find: border-gray-800
# Replace: border-sidebar-border
```

### Phase 5: Hover States (10 minutes)

```regex
# Find: hover:bg-gray-900
# Replace: hover:bg-sidebar-active

# Find: hover:bg-gray-800
# Replace: hover:bg-sidebar-hover

# Find: hover:bg-blue-600
# Replace: hover:bg-brand-active

# Find: hover:bg-amber-500
# Replace: hover:bg-brand-accent
```

### Phase 6: Opacity Variants (Manual Review Required)

**Pattern:** `bg-gray-900/80`, `bg-gray-800/50`, etc.

**Replacement:**
```tsx
// ❌ Before
<div className="bg-gray-900/80 backdrop-blur-md">

// ✅ After
<div 
  className="backdrop-blur-md"
  style={{ backgroundColor: `hsl(var(--sidebar-background) / 0.8)` }}
>
```

**Common Opacity Mappings:**
- `/80` → `/ 0.8`
- `/50` → `/ 0.5`
- `/30` → `/ 0.3`
- `/20` → `/ 0.2`

### Phase 7: Conditional/Ternary Expressions (Manual Review)

```tsx
// ❌ Before
<div className={isActive ? 'bg-gray-900' : 'bg-gray-800'}>

// ✅ After
<div className={isActive ? 'bg-sidebar-active' : 'bg-sidebar-hover'}>

// ❌ Before
<button className={isSelected ? 'bg-blue-600' : 'bg-gray-200'}>

// ✅ After
<button className={isSelected ? 'bg-brand-primary' : 'bg-brand-muted'}>
```

---

## 📝 Common Patterns & Examples

### Example 1: Card Component

```tsx
// ❌ Before
<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
  <h3 className="text-gray-900 font-bold">Title</h3>
  <p className="text-gray-600">Description</p>
</div>

// ✅ After
<div className="bg-card border-border border rounded-lg p-4 shadow-md">
  <h3 className="text-brand-body font-bold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Example 2: Button Component

```tsx
// ❌ Before
<button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
  Click Me
</button>

// ✅ After (Option 1: Using utility classes with hover)
<button className="bg-brand-primary text-card-foreground px-4 py-2 rounded hover:bg-brand-active transition-colors">
  Click Me
</button>

// ✅ After (Option 2: Using inline styles for dynamic hover)
<button 
  className="px-4 py-2 rounded transition-colors"
  style={{
    backgroundColor: `hsl(var(--primary))`,
    color: `hsl(var(--primary-foreground))`
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = `hsl(var(--primary-hover))`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = `hsl(var(--primary))`;
  }}
>
  Click Me
</button>
```

### Example 3: Sidebar Menu Item

```tsx
// ❌ Before
<Link 
  className={cn(
    "flex items-center gap-3 p-3 rounded-lg",
    isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-800"
  )}
>
  <Icon />
  <span>Menu Item</span>
</Link>

// ✅ After (Using utility classes)
<Link 
  className={cn(
    "flex items-center gap-3 p-3 rounded-lg transition-colors text-sidebar-foreground",
    isActive ? "bg-sidebar-active" : "hover:bg-sidebar-hover"
  )}
>
  <Icon />
  <span>Menu Item</span>
</Link>

// ✅ After (Using inline styles for dynamic states)
<Link 
  className={cn(
    "flex items-center gap-3 p-3 rounded-lg transition-colors",
    isActive ? "" : ""
  )}
  style={{
    backgroundColor: isActive 
      ? `hsl(var(--sidebar-active))` 
      : 'transparent',
    color: `hsl(var(--sidebar-foreground))`
  }}
  onMouseEnter={(e) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = `hsl(var(--sidebar-hover))`;
    }
  }}
  onMouseLeave={(e) => {
    if (!isActive) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  }}
>
  <Icon />
  <span>Menu Item</span>
</Link>
```

### Example 4: Input Field

```tsx
// ❌ Before
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-600"
  placeholder="Enter text"
/>

// ✅ After (Using utility classes)
<input 
  className="w-full px-4 py-2 bg-input border-border border rounded-lg text-brand-body focus:ring-2 transition-colors"
  placeholder="Enter text"
/>

// ✅ After (Using inline styles for dynamic focus states)
<input 
  className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-colors"
  style={{
    backgroundColor: `hsl(var(--input))`,
    borderColor: `hsl(var(--border))`,
    color: `hsl(var(--foreground))`
  }}
  onFocus={(e) => {
    e.target.style.borderColor = `hsl(var(--ring))`;
    e.target.style.boxShadow = `0 0 0 2px hsl(var(--ring) / 0.2)`;
  }}
  onBlur={(e) => {
    e.target.style.borderColor = `hsl(var(--border))`;
    e.target.style.boxShadow = 'none';
  }}
  placeholder="Enter text"
/>
```

### Example 5: Badge/Status Indicator

```tsx
// ❌ Before
<span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
  New
</span>

// ✅ After
<span 
  className="px-2 py-1 rounded-full text-xs font-medium"
  style={{
    backgroundColor: `hsl(var(--accent) / 0.2)`,
    color: `hsl(var(--accent-foreground))`
  }}
>
  New
</span>
```

---

## 📂 File-by-File Checklist

### High Priority Files (Start Here)

- [ ] `src/components/Sidebar.tsx`
- [ ] `src/components/SidebarMenu.tsx`
- [ ] `src/components/TopHeader.tsx`
- [ ] `src/components/UserMenu.tsx`
- [ ] `src/app/login/components/LoginForm.tsx`
- [ ] `src/app/dashboard/layout.tsx`
- [ ] `src/app/dashboard/page.tsx`

### Component Files

- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/StatCard.tsx`
- [ ] `src/components/Breadcrumb.tsx`
- [ ] `src/components/ChatModule.tsx`
- [ ] `src/components/FullPageLoader.tsx`

### Dashboard Pages

- [ ] `src/app/dashboard/todo-list/**/*.tsx`
- [ ] `src/app/dashboard/schedule/**/*.tsx`
- [ ] `src/app/dashboard/invoices/**/*.tsx`
- [ ] `src/app/dashboard/notifications/page.tsx`
- [ ] `src/app/dashboard/settings/page.tsx`
- [ ] `src/app/dashboard/profile/**/*.tsx`

### Form Components

- [ ] `src/components/TextInput.tsx`
- [ ] `src/components/TextArea.tsx`
- [ ] `src/components/Select.tsx`
- [ ] `src/app/forgot-password/**/*.tsx`
- [ ] `src/app/reset-password/**/*.tsx`

### Chart Components

- [ ] `src/components/TotalBalanceChart.tsx`
- [ ] `src/components/CashFlowChart.tsx`
- [ ] `src/components/BankBalanceChart.tsx`
- [ ] `src/components/PLSummaryChart.tsx`

---

## 🧪 Testing & Verification

### Step 1: Build the Project

```bash
npm run build
```

Fix any TypeScript or build errors.

### Step 2: Visual Testing Checklist

Test each page/component:

- [ ] **Login Page**
  - [ ] Left panel uses sidebar colors
  - [ ] Right panel uses body colors
  - [ ] Inputs use theme colors
  - [ ] Button uses primary color

- [ ] **Dashboard**
  - [ ] Background uses body color
  - [ ] Cards use card color
  - [ ] Text uses foreground color
  - [ ] Buttons use primary/accent colors

- [ ] **Sidebar**
  - [ ] Background uses sidebar-background
  - [ ] Text uses sidebar-foreground
  - [ ] Hover states work correctly
  - [ ] Active states are visible

- [ ] **Header**
  - [ ] Background uses body color
  - [ ] Text uses foreground color
  - [ ] Icons are visible
  - [ ] Hover states work

### Step 3: Dynamic Theme Testing

1. **Temporarily modify `globals.css`** to test with different colors:
   ```css
   --primary: 0 84% 60%; /* Red */
   --accent: 142 76% 36%; /* Green */
   ```

2. **Verify all components adapt** to the new colors

3. **Revert changes** after testing

### Step 4: Search for Remaining Hardcoded Colors

```bash
# Search for common hardcoded patterns
grep -r "bg-gray-\|text-gray-\|border-gray-\|bg-blue-\|bg-amber-\|bg-yellow-" src/
grep -r "#[0-9a-fA-F]\{6\}" src/  # Hex colors
grep -r "rgb(" src/  # RGB colors
```

---

## 🎯 Decision Tree for Context-Aware Replacements

```
Found: bg-gray-900
  |
  ├─→ Has opacity? (/80, /50, etc.)
  |   └─→ YES → Use inline style with opacity
  |
  ├─→ Is it hover: prefix?
  |   └─→ YES → hover:bg-sidebar-active
  |
  ├─→ Has min-h-screen or h-screen?
  |   └─→ YES → Is it dashboard page?
  |             ├─→ YES → bg-brand-body
  |             └─→ NO (auth page) → bg-sidebar-background
  |
  ├─→ Is it in modal/dialog component?
  |   └─→ YES → bg-sidebar-background
  |
  ├─→ Is it interactive? (button, link, onClick)
  |   └─→ YES → bg-sidebar-background
  |
  ├─→ Is it in active/selected ternary?
  |   └─→ YES → Active side → bg-sidebar-active
  |
  └─→ Default case
      └─→ bg-sidebar-background
```

---

## ✅ Completion Criteria

You're done when:

1. ✅ `npm run build` succeeds without errors
2. ✅ Search for `bg-gray-`, `text-gray-`, `bg-blue-`, `bg-amber-` returns minimal results (only in comments or special cases)
3. ✅ All pages render correctly with theme colors
4. ✅ Hover states work on all interactive elements
5. ✅ Active/selected states are clearly visible
6. ✅ Sidebar and header match the 6th image theme exactly
7. ✅ Colors adapt when CSS variables change

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Forgetting Opacity

**Problem:** `bg-gray-900/80` doesn't work with CSS variables

**Solution:** Use inline style:
```tsx
style={{ backgroundColor: `hsl(var(--sidebar-background) / 0.8)` }}
```

### Pitfall 2: Wrong Context for Dashboard Pages

**Problem:** Dashboard page container uses `bg-gray-900` but should be light

**Solution:** Use `bg-brand-body` for page containers in dashboards

### Pitfall 3: Sidebar Text Not Visible

**Problem:** Using `text-white` instead of sidebar-foreground

**Solution:** Always use `text-sidebar-foreground` or `text-brand-sidebar` in sidebar components

### Pitfall 4: Hover States Not Working

**Problem:** Using Tailwind hover classes with CSS variables

**Solution:** Use `onMouseEnter`/`onMouseLeave` handlers or ensure Tailwind can process the classes

---

## 📚 Additional Resources

- **CSS Variables Reference:** See `src/app/globals.css`
- **A4-MALTA-AUDIT-PORTAL Reference:** See `D:\projects\New folder\A4-MALTA-AUDIT-PORTAL\src\index.css`
- **Tailwind CSS Variables:** https://tailwindcss.com/docs/customizing-colors#using-css-variables

---

## 🎉 Final Notes

- **Take your time:** Don't rush through replacements. Review each change in context.
- **Test frequently:** Build and test after each major file or component.
- **Ask for help:** If unsure about a replacement, check the A4-MALTA-AUDIT-PORTAL project for similar patterns.
- **Document exceptions:** If you find a case where hardcoded colors are necessary, document why.

**Last Updated:** December 2024  
**Status:** ✅ Ready for execution

