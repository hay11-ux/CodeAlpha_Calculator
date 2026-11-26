# Calculette

A simple, keyboard-friendly calculator built with plain HTML, CSS and JavaScript. No build step and no dependencies.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup: screen, keypad and status pill |
| `styles.css` | Dark theme with mint and amber accents, responsive layout |
| `script.js` | Calculator logic, click handling and keyboard support |

## Run it

Keep the three files in the same folder and open `index.html` in a browser. The fonts (Manrope and DM Mono) load from Google Fonts. Offline, the page falls back to Arial and the system monospace font.

## Features

- Addition, subtraction, multiplication and division, with standard precedence (`2 + 3 × 4` gives `14`)
- Percent key, delete (`DEL`) and clear (`AC`)
- Continue from a result by pressing an operator, or start fresh by typing a digit
- Pending operator stays highlighted
- Floating-point noise is rounded away (`0.1 + 0.2` gives `0.3`)
- Divide by zero shows an error state and clears on the next key
- Numbers are capped at 15 digits, and the display shrinks and scrolls for long expressions

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0-9`, `.` | Enter numbers |
| `+` `-` `*` `/` | Operators |
| `Enter` or `=` | Calculate |
| `%` | Percent |
| `Backspace` | Delete last character |
| `Esc` or `C` | Clear |

## How it works

`script.js` builds the expression as a string (for example `5+3*2`) and evaluates it with `Function` when you press `=`. The input handler only lets digits, decimal points and the four operators into that string, so nothing else can reach `Function`. Results are rounded to 12 significant digits and converted to plain decimals before being reused.

## Known limits

- A negative number can only be entered by typing `-` first. There is no `+/-` key.
- Typing an operator right after another operator replaces it, so `2*-3` becomes `2-3`.
- Results are limited to 12 significant digits, so very large products lose precision in the last digits.