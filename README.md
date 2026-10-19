# Pipomori

Mobile game portal prototype with a forest theme: splash screen with a wooden loader, phone number + OTP sign-in (demo), Home / Games / Profile, levels, an operator-billed daily subscription with subscribe/unsubscribe (simulated), and Indonesian/English copy.

- `index.html` — markup only (splash, launcher, Home / Games / Profile views, game sheet, login)
- `css/` — `base.css` (tokens, wordmark, wooden loader, splash), `views.css` (Home / Games / Profile), `ui.css` (dialogs, login, subscription, ambient motion, tab bar, game sheet)
- `js/` — plain scripts loaded in order: `i18n.js` (ID/EN copy), `data.js` (games, categories, avatars), `state.js` (store + helpers), `views.js` (renderers), `ui.js` (confetti, dialogs), `auth.js` (phone/OTP login, subscription, logout), `motion.js` (tilt, parallax, scroll reveal), `app.js` (language, routing, tab bar, launcher, trending deck, boot)
- `assets/` — images

To run it locally:

```sh
python3 -m http.server 5173
```

Then open http://127.0.0.1:5173/.
