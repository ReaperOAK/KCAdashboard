# 🎨 **Kolkata Chess Academy – Full Component Color System**

---

## 🟪 **Color Tokens (Tailwind-friendly)**

You can use these in your Tailwind config (`tailwind.config.js`) under `theme.extend.colors`:

```js
colors: {
  primary: '#200e4a',
  secondary: '#461fa3',
  accent: '#7646eb',
  background: {
    dark: '#14092e',
    light: '#f3f1f9',
  },
  highlight: '#af0505',
  text: {
    dark: '#270185',
    light: '#e3e1f7',
    neutral: '#ffffff',
  },
  gray: {
    light: '#c2c1d3',
    dark: '#3b3a52',
  },
}
```

---

## 🧩 **Component-Specific Usage Guide**

### 🧭 Navbar / Sidebar

| Element          | Color                                      |
| ---------------- | ------------------------------------------ |
| Background       | `bg-primary` or `bg-background.dark`       |
| Link (inactive)  | `text-text.light` + `hover:text-accent`    |
| Link (active)    | `text-accent` + `border-l-2 border-accent` |
| Divider / Border | `border-gray.dark`                         |
| User avatar bg   | `bg-secondary`                             |

---

### 📍 Headings & Text

| Use                  | Class Suggestion                        |
| -------------------- | --------------------------------------- |
| Section Titles       | `text-2xl text-text.dark font-semibold` |
| Page Headers         | `text-3xl text-primary`                 |
| Subtext / Meta       | `text-sm text-gray.dark`                |
| Body Text (light bg) | `text-text.dark`                        |
| Body Text (dark bg)  | `text-text.light`                       |

---

### 🟦 Buttons

#### 🔹 Primary Button

| State    | Classes                                           |
| -------- | ------------------------------------------------- |
| Default  | `bg-primary text-white hover:bg-secondary`        |
| Focus    | `ring-2 ring-accent`                              |
| Disabled | `bg-gray.dark text-gray.light cursor-not-allowed` |

#### 🔸 Secondary Button

| State   | Classes                                                             |
| ------- | ------------------------------------------------------------------- |
| Default | `bg-secondary text-white hover:bg-accent`                           |
| Outline | `border border-accent text-accent hover:bg-accent hover:text-white` |

#### 🟠 Accent / CTA Button

| State   | Classes                                   |
| ------- | ----------------------------------------- |
| Default | `bg-accent text-white hover:bg-secondary` |
| Focus   | `ring-2 ring-offset-2 ring-accent`        |

---

### 🪪 Cards / Panels

| Element       | Class Suggestion                              |
| ------------- | --------------------------------------------- |
| Background    | `bg-background.light dark:bg-background.dark` |
| Border/Shadow | `border border-gray.light shadow-md`          |
| Title Text    | `text-primary font-medium`                    |
| Content Text  | `text-gray.dark`                              |

---

### ⚠️ Alerts & Notifications

| Type    | Background     | Border             | Text         |
| ------- | -------------- | ------------------ | ------------ |
| Info    | `bg-secondary` | `border-accent`    | `text-white` |
| Warning | `bg-highlight` | `border-highlight` | `text-white` |
| Success | `bg-green-600` | `border-green-700` | `text-white` |
| Error   | `bg-red-700`   | `border-red-800`   | `text-white` |

Add icons like Heroicons or Lucide for visual cue clarity.

---

### 🏷️ Badges / Tags

| Type       | Class                                                    |
| ---------- | -------------------------------------------------------- |
| Role-based | `bg-secondary text-white px-2 py-1 rounded-full text-xs` |
| Status     | `bg-gray.light text-primary font-medium`                 |
| Highlight  | `bg-accent text-white font-semibold text-xs px-2 py-0.5` |

---

### 📅 Tables / Lists / Rows

| Element    | Class                                     |
| ---------- | ----------------------------------------- |
| Header Row | `bg-primary text-white text-sm uppercase` |
| Odd Rows   | `bg-background.light`                     |
| Hover Row  | `hover:bg-gray.light cursor-pointer`      |
| Cell Text  | `text-sm text-text.dark`                  |
| Border     | `border-b border-gray.dark`               |

---

### 📊 Charts / Stats / Metrics

Use bright, meaningful hues for categories:

* **Primary Series**: `#7646eb` (accent)
* **Secondary**: `#af0505` (highlight)
* **Tertiary**: `#3b3a52` (gray dark)
* Use `text-white` or `text-light` labels on dark charts.

---

### 🧠 UX Notes

* Use `focus:outline-none focus:ring-2` for keyboard navigable elements.
* Always validate `hover:` and `focus:` contrast.
* For dark mode, flip background + text colors and validate contrast again.
* Use `transition-all duration-200` on interactive components like buttons, dropdowns, tabs, etc.

---

## 🧪 Optional Tailwind Plugin Extensions

Add these if you want more design control:

```bash
npm i tailwindcss-animate @tailwindcss/forms @tailwindcss/typography
```
