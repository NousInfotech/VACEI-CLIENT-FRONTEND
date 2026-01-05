# Bulk Color Replacement Guide

## 🎯 Quick Find & Replace Commands

Use these in VS Code Find & Replace (Ctrl+Shift+H) with Regex enabled:

### Background Colors

```regex
# Blue backgrounds → Theme colors
Find: bg-sky-800
Replace: bg-sidebar-background

Find: bg-sky-700
Replace: bg-sidebar-background

Find: bg-blue-\d+
Replace: bg-brand-primary

Find: border-blue-200/50
Replace: border-border

Find: border-blue-100
Replace: border-border

Find: bg-blue-50|bg-blue-100
Replace: bg-brand-muted

Find: bg-gradient-to-r from-white/80 to-blue-100/50
Replace: bg-card
```

### Text Colors

```regex
# Blue text → Theme colors
Find: text-sky-800
Replace: text-brand-body

Find: text-sky-700
Replace: text-brand-primary

Find: text-blue-\d+
Replace: text-brand-primary

Find: text-gray-500
Replace: text-muted-foreground

Find: text-gray-400
Replace: text-muted-foreground

Find: text-gray-700
Replace: text-brand-body
```

### Borders

```regex
# Blue borders → Theme borders
Find: border-blue-200/50
Replace: border-border

Find: border-blue-100
Replace: border-border

Find: border-blue-300
Replace: border-border

Find: border-blue-400
Replace: border-border

Find: border-blue-500
Replace: border-brand-primary
```

### Shadows & Rounded Corners

```regex
# Update rounded corners
Find: rounded-\[16px\]
Replace: rounded-card

Find: rounded-\[12px\]
Replace: rounded-xl

# Update shadows
Find: shadow-sm
Replace: shadow-md

Find: shadow-xs
Replace: shadow-sm
```

### Specific Component Patterns

```regex
# Chart containers
Find: bg-card border border-blue-200/50 rounded-\[16px\]
Replace: bg-card border-border border rounded-card shadow-md

# Button patterns
Find: bg-sky-800 text-card-foreground
Replace: bg-sidebar-background text-sidebar-foreground

# Hover states
Find: hover:bg-sky-800
Replace: hover:bg-sidebar-hover

Find: hover:bg-blue-\d+
Replace: hover:bg-sidebar-hover
```

---

## 📝 File-by-File Replacement Checklist

### High Priority (Start Here)

- [x] `src/components/ui/button.tsx` - ✅ Updated
- [x] `src/app/dashboard/page.tsx` - ✅ Updated
- [x] `src/components/StatCard.tsx` - ✅ Updated
- [x] `src/components/CashFlowChart.tsx` - ✅ Updated
- [x] `src/components/PLSummaryChart.tsx` - ✅ Updated
- [x] `src/app/dashboard/layout.tsx` - ✅ Updated
- [ ] `src/components/TopHeader.tsx`
- [ ] `src/components/ChatModule.tsx`
- [ ] `src/components/TotalBalanceChart.tsx`
- [ ] `src/components/BankBalanceChart.tsx`

### Dashboard Pages

- [ ] `src/app/dashboard/notifications/page.tsx`
- [ ] `src/app/dashboard/invoices/page.tsx`
- [ ] `src/app/dashboard/todo-list/**/*.tsx`
- [ ] `src/app/dashboard/schedule/**/*.tsx`
- [ ] `src/app/dashboard/document-organizer/**/*.tsx`
- [ ] `src/app/dashboard/financial-statements/**/*.tsx`
- [ ] `src/app/dashboard/cash/**/*.tsx`
- [ ] `src/app/dashboard/general-ledger/**/*.tsx`

### Form Components

- [ ] `src/components/TextInput.tsx`
- [ ] `src/components/TextArea.tsx`
- [ ] `src/components/Select.tsx`
- [ ] `src/components/AlertMessage.tsx`

---

## 🎨 Standard Card Pattern

Replace all card containers with this pattern:

```tsx
// ❌ Before
<div className="bg-card border border-blue-200/50 rounded-[16px] shadow-sm">

// ✅ After
<div className="bg-card border-border border rounded-card shadow-md card-hover">
```

---

## 🔘 Standard Button Pattern

```tsx
// ❌ Before
<button className="bg-sky-800 text-white px-4 py-2 rounded-lg">

// ✅ After
<Button variant="default" className="px-4 py-2 rounded-lg">
```

---

## 📊 Chart Container Pattern

```tsx
// ❌ Before
<div className="bg-card border border-blue-200/50 rounded-[16px] py-6 shadow-sm">

// ✅ After
<div className="bg-card border-border border rounded-card py-6 shadow-md card-hover">
```

---

## 🎯 Priority Order

1. **Button Component** - ✅ Done
2. **Dashboard Page** - ✅ Done
3. **Chart Components** - ✅ Done
4. **TopHeader** - Next
5. **Form Components** - Next
6. **All Dashboard Pages** - Then
7. **All Other Components** - Finally

---

**Last Updated:** December 2024

