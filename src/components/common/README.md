# Common Components

## PasswordInput
Reusable password input field with show/hide toggle, accessible and styled with Tailwind. Used in login, registration, and other forms.

**Props:**
- `id`, `name`, `value`, `onChange`, `className`, `placeholder`, `autoComplete`, `required`, `aria-label`, `aria-required`, `label`, `showLabel`, `iconClassName`

## FormikPasswordField
Formik-compatible password field with show/hide toggle and error message display.

**Props:**
- `id`, `name`, `className`, `placeholder`, `autoComplete`, `aria-label`, `aria-required`, `label`, `showLabel`, `iconClassName`, `showErrorMessage`, `errorClassName`

---

Both components use Heroicons for the eye/lock icons and are fully accessible (keyboard, ARIA, focus states).
