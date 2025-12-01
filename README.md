# 🎄 Mangavent - Manga Advent Calendar

A fun, interactive advent calendar website featuring daily manga image reveals!

## Setup

1. Add your manga images to the `images/` folder
2. Name them by day number: `1.jpg`, `2.png`, `3.gif`, etc.
3. Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
4. Open `index.html` in a browser or host it on a web server

## Features

- ❄️ Animated snowflakes and twinkling stars
- 🔒 Days unlock automatically on the correct date in December
- ⭐ Tracks which days have been opened (saved in browser)
- 🎉 Confetti celebration when opening a new day
- 📱 Responsive design - works on desktop and mobile
- ✨ Cool animations and hover effects

## Configuration

In `script.js`, you can change:
- `CALENDAR_YEAR` - Set the year for the calendar (default: 2024)

## Testing

To test all days without waiting for December, uncomment this line in `script.js`:
```javascript
// return true;  // Uncomment this line
```

## Hosting

You can host this for free on:
- GitHub Pages
- Netlify
- Vercel
- Any static file host

Enjoy your manga advent calendar! 🎄✨
