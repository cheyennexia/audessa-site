# Audessa Landing Page

This is the static landing page for **Audessa**, a Chrome extension that turns articles into audio. The site is built with plain HTML, CSS, and JavaScript, featuring a responsive design, glassmorphic UI elements, and a static product mockup.

## How to Run Locally

Since this is a static site, you can serve it locally using any basic HTTP server.

If you have Python installed, run the following command from the project root directory:

```bash
python3 -m http.server 3000
```

Then open your browser and navigate to `http://localhost:3000`.

## How to Build and Deploy

This project requires no build step (no Webpack, Vite, or npm dependencies). It is ready for production as-is.

To deploy, simply upload the contents of this directory to any static hosting provider, such as:
- **GitHub Pages**
- **Netlify** (drag and drop the folder)
- **Vercel**
- **Cloudflare Pages**
- **AWS S3 / CloudFront**

## File Structure Overview

- `index.html` — The main landing page containing the Hero, Available Now, Coming Soon, How It Works, Demo Mockup, Pricing, and Footer sections.
- `styles.css` — All styling for the site, including responsive layouts, animations, and the custom demo player mockup.
- `app.js` — Minimal JavaScript for handling the waitlist modal and basic interactions.
- `logo.png` — The Audessa brand logo.
- `hero-bg.webp` — The warm bokeh background image used in the hero section.
- `sound-wave-pattern.webp` — The background pattern used in the "How Audessa Works" section.
- `privacy.html` — Placeholder for the Privacy Policy page.
- `terms.html` — Placeholder for the Terms of Service page.
