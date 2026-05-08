---
name: native-ui
description: >
  Builds UI components consistent with the RFQ Dashboard design system.
  Use when adding new components, pages, or modifying existing UI.
  Enforces the project's Tailwind tokens, animation patterns, icon library,
  and component structure so everything looks native to the app.
---

You are building UI for the RFQ Dashboard — a React 19 + Tailwind CSS v3 business intelligence app.
Always produce components that feel native to the existing codebase.

## Stack

- **Styling**: Tailwind CSS v3 only. No inline styles. No custom CSS unless Tailwind cannot do it.
- **Conditional classes**: always use `clsx` + `tailwind-merge` — import as `import { clsx } from 'clsx'; import { twMerge } from 'tailwind-merge';` or combine: `const cn = (...c) => twMerge(clsx(c))`
- **Icons**: `lucide-react` only. Sizes: `size={16}` inline/badge, `size={18}` buttons, `size={20}` nav/actions, `size={24}` header.
- **Animation**: `framer-motion` for enters, exits, page transitions. CSS `transition-colors` / `transition-all` for hover states.
- **Charts**: `recharts` — match existing chart wrappers in `src/components/Charts/`.

---

## Color Tokens

### Surfaces
| Use | Classes |
|-----|---------|
| Page background | `bg-slate-50` or `bg-slate-50/50` |
| Card / panel | `bg-white` |
| Input background | `bg-slate-50` |
| Hover fill | `hover:bg-slate-50` or `hover:bg-slate-100` |

### Text
| Use | Classes |
|-----|---------|
| Primary heading | `text-slate-800` |
| Body | `text-slate-700` |
| Secondary / meta | `text-slate-500` |
| Muted | `text-slate-400` |
| Label (caps) | `text-slate-500 uppercase tracking-wider` |

### Borders
| Use | Classes |
|-----|---------|
| Card border | `border border-slate-200` |
| Divider | `border-b border-slate-100` or `border-t border-slate-100` |
| Sidebar/header | `border-r border-slate-200` / `border-b border-slate-200` |

### Intent Colors
| Intent | Background | Text | Border |
|--------|-----------|------|--------|
| Primary / active | `bg-blue-50` | `text-blue-600` | `border-blue-200` |
| Success | `bg-emerald-50` | `text-emerald-700` | `border-emerald-100` |
| Error / danger | `bg-red-50` | `text-red-600` / `text-red-700` | `border-red-100` |
| Warning / processing | `bg-sky-50` | `text-sky-700` | `border-sky-100` |
| Neutral / secondary | `bg-slate-100` | `text-slate-600` | `border-slate-200` |

---

## Component Recipes

### Card
```jsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  {/* content */}
</div>
```

### Card with accent left border (KPI style)
```jsx
<div className="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-6">
  <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
  <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">{title}</p>
</div>
```

### Section header inside a page
```jsx
<h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
```

### Page heading + subtitle
```jsx
<div>
  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
  <p className="text-slate-500 mt-1">{subtitle}</p>
</div>
```

---

## Buttons

### Primary (CTA)
```jsx
<button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
  <IconName size={18} />
  Label
</button>
```

### Secondary / outline
```jsx
<button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
  <IconName size={18} />
  Label
</button>
```

### Icon-only
```jsx
<button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 shadow-sm transition-all">
  <IconName size={20} />
</button>
```

### Danger
```jsx
<button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200 shadow-sm font-medium text-sm">
  <Trash2 size={18} />
  Delete
</button>
```

---

## Inputs & Form Controls

### Standard text input
```jsx
<input
  type="text"
  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none p-2.5 transition-all"
  placeholder="..."
/>
```

### Input with icon prefix
```jsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <SearchIcon size={16} className="text-slate-400" />
  </div>
  <input className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
</div>
```

### Select
```jsx
<select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 font-medium outline-none">
  <option>Option</option>
</select>
```

### Field label
```jsx
<label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
  Field Name
</label>
```

---

## Badges & Status Pills

```jsx
// Base pattern — swap color per intent
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-100">
  Complete
</span>
```

| Status | Classes |
|--------|---------|
| Complete / success | `bg-emerald-50 text-emerald-700 border-emerald-100` |
| Exception / error | `bg-red-50 text-red-700 border-red-100` |
| Processing / info | `bg-sky-50 text-sky-700 border-sky-100` |
| Pending / neutral | `bg-slate-100 text-slate-600 border-slate-200` |

---

## Dropdown / Popover

```jsx
<div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
  <button className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
    <IconName size={16} />
    Action
  </button>
  <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
    <LogOut size={16} />
    Danger action
  </button>
</div>
```

---

## Navigation Item (Sidebar)

```jsx
<button
  className={twMerge(clsx(
    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-blue-50 text-blue-600'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  ))}
>
  <Icon size={20} className="flex-shrink-0" />
  <span>Label</span>
</button>
```

---

## Table

```jsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  {/* Top bar */}
  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
    <span className="text-sm font-medium text-slate-600">Total {count} items</span>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <th className="p-4 cursor-pointer hover:bg-slate-100/80 transition-colors">Column</th>
        </tr>
      </thead>
      <tbody className="text-sm divide-y divide-slate-100">
        <tr className="hover:bg-blue-50/30 transition-colors duration-150 group">
          <td className="p-4 font-medium text-slate-900">Value</td>
        </tr>
      </tbody>
    </table>
  </div>

  {/* Pagination footer */}
  <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
    <span className="text-sm text-slate-500">Showing 1 to 10 of 100</span>
  </div>
</div>
```

---

## Animations (framer-motion)

### Fade in up (cards, sections)
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
```

### Stagger children
```jsx
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

<motion.ul variants={container} initial="hidden" animate="show">
  {list.map(i => <motion.li key={i} variants={item}>...</motion.li>)}
</motion.ul>
```

### Scale in (modals, popovers)
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
```

### Slide in/out (form views, panels)
```jsx
<motion.div
  key={viewKey}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25 }}
>
```

---

## Layout Patterns

### Dashboard page shell
```jsx
<div className="flex min-h-screen bg-slate-50/50">
  <Sidebar isOpen={isSidebarOpen} user={user} />
  <div className={`flex-1 transition-[margin] duration-500 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
    <Header title="Page Title" onToggleSidebar={...} extraAction={<UserMenu user={user} />} />
    <main className="p-8 max-w-[1600px] mx-auto">
      {/* content */}
    </main>
  </div>
</div>
```

### 2-column responsive grid
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
```

### 4-column KPI grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
```

---

## Rules

1. **Never** use inline `style={{}}` — find the Tailwind equivalent.
2. **Never** add a new color not in the token table above without asking.
3. Every interactive element needs `transition-colors` or `transition-all`.
4. Rounded corners: `rounded-lg` for controls/buttons, `rounded-xl` for cards/panels, `rounded-full` for avatars/badges.
5. Shadows: `shadow-sm` for cards, `shadow-xl` for dropdowns/modals, `shadow-2xl` for sidebar.
6. Always `flex items-center gap-2` for icon+text pairs — never margin hacks.
7. Use `AnimatePresence` when a component conditionally mounts/unmounts.
8. Match z-index layering: content `z-0`, sticky header `z-10`, sidebar `z-20`, dropdowns `z-50`.
