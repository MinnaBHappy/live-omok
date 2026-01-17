# 오목 (Omok) - Five in a Row Game

A beautiful web-based Omok (Gomoku/Five in a Row) game with animated sky background, game recording, and sharing features.

![Omok Game Preview](https://via.placeholder.com/800x400?text=Omok+Game+Preview)

## ✨ Features

- **Realistic Omok Board**: Traditional 15x15 board with wooden texture and star points (천원)
- **Animated Sky Background**: Beautiful moving clouds with the board floating in the sky
- **Game Recording**: Record every move automatically
- **Replay Function**: Watch your game from the beginning with adjustable speed
- **Highlight Video**: Generate a video of your game that you can download and share
- **Save & Load**: Save games to local files and load them later
- **URL Sharing**: Share your game via URL - others can view your game by opening the link

## 🎮 How to Play

1. **Black plays first** - Click on any intersection to place a stone
2. **Take turns** - Black and white alternate placing stones
3. **Win condition** - First player to get 5 stones in a row (horizontal, vertical, or diagonal) wins
4. **Undo** - Press `Ctrl+Z` or click the undo button to take back a move

## 🎬 Recording & Sharing

### Replay Your Game
- Click the **▶️ 리플레이** button to watch your game from the beginning
- Adjust playback speed using the dropdown menu

### Generate Highlight Video
- Click the **🎥 하이라이트 영상** button to create a downloadable video
- The video will be saved as a `.webm` file

### Save Locally
- Click **💾 로컬 저장** to save the game as a JSON file
- Click **📂 불러오기** to load a previously saved game

### Share via URL
- Click **🔗 URL 공유** to copy a shareable link
- Send the link to anyone - they can view your game!

---

## 🚀 Deployment Options (Windows 10 - Secure & Easy)

Since this is a **static website** (HTML, CSS, JavaScript only), you can deploy it for free using cloud services. This means:
- ✅ **No security risks** - Your PC is never exposed to the internet
- ✅ **No server management** - The hosting service handles everything
- ✅ **Free hosting** - All options below have free tiers
- ✅ **HTTPS included** - Automatic security certificates

### Option 1: GitHub Pages (Recommended for Beginners)

**Step 1: Create a GitHub Account**
1. Go to [github.com](https://github.com) and sign up for a free account

**Step 2: Create a New Repository**
1. Click the **+** button in the top right → **New repository**
2. Name it `omok-game` (or any name you like)
3. Make sure **Public** is selected
4. Click **Create repository**

**Step 3: Upload Your Files**
1. On your new repository page, click **uploading an existing file**
2. Drag and drop these files:
   - `index.html`
   - `styles.css`
   - `main.js`
3. Click **Commit changes**

**Step 4: Enable GitHub Pages**
1. Go to your repository → **Settings** tab
2. In the left sidebar, click **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select the **main** branch and **/ (root)** folder
5. Click **Save**
6. Wait 1-2 minutes, then refresh the page
7. You'll see your site URL: `https://YOUR-USERNAME.github.io/omok-game/`

### Option 2: Netlify (Drag & Drop Deployment)

**Step 1: Prepare Your Files**
1. Create a folder on your computer called `omok-game`
2. Put all three files (`index.html`, `styles.css`, `main.js`) in this folder

**Step 2: Deploy to Netlify**
1. Go to [netlify.com](https://www.netlify.com) and sign up (free)
2. Click **Add new site** → **Deploy manually**
3. Drag and drop your `omok-game` folder onto the page
4. Done! Your site is live at a URL like `https://random-name-12345.netlify.app`

**Step 3: Custom Domain (Optional)**
1. Click **Site settings** → **Domain management**
2. Click **Add custom domain** if you have one
3. Or use **Edit site name** to change the random URL to something memorable

### Option 3: Vercel

**Step 1: Sign Up**
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub

**Step 2: Deploy**
1. Click **Add New** → **Project**
2. If you uploaded to GitHub (Option 1), select your repository
3. Or drag and drop your project folder
4. Click **Deploy**
5. Your site is live!

### Option 4: Cloudflare Pages

**Step 1: Sign Up**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and create an account

**Step 2: Deploy**
1. Click **Create a project**
2. Connect your GitHub repository, or upload directly
3. Click **Deploy site**
4. Your site URL: `https://your-project.pages.dev`

---

## 💻 Local Development (Optional)

If you want to test the game locally before deploying:

### Method 1: Using Visual Studio Code (Recommended)
1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension
3. Open the project folder in VS Code
4. Right-click on `index.html` → **Open with Live Server**
5. The game opens in your browser at `http://localhost:5500`

### Method 2: Using Python (If Installed)
```bash
# Python 3
cd path/to/omok-game
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

### Method 3: Using Node.js (If Installed)
```bash
# Install serve globally
npm install -g serve

# Run the server
cd path/to/omok-game
serve

# Open the URL shown in terminal
```

---

## 📁 Project Structure

```
omok-game/
├── index.html      # Main HTML file
├── styles.css      # Styles and animations
├── main.js         # Game logic
└── README.md       # This file
```

---

## 🎯 Game Controls

| Action | Control |
|--------|---------|
| Place Stone | Click on intersection |
| Undo Move | `Ctrl + Z` or Undo button |
| Start New Game | New Game button |
| Close Modal | `Escape` key or click outside |

---

## 🌐 Browser Support

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Internet Explorer (Not supported)

**Note**: Video recording works best in Chrome. Some browsers may have limited MediaRecorder support.

---

## 🛡️ Security Information

This game is completely **client-side** - meaning:

1. **No server required** - Everything runs in the browser
2. **No data collection** - Your games are not sent anywhere
3. **No cookies** - No tracking of any kind
4. **No PC exposure** - Your computer is never accessible from the internet

When you deploy to GitHub Pages, Netlify, Vercel, or Cloudflare:
- Only the static files are hosted on their servers
- Your personal computer remains completely isolated
- There's no way for anyone to "hack into" your PC through this game

---

## 📝 License

MIT License - Feel free to modify and share!

---

## 🎉 Enjoy Playing!

Have fun playing 오목 with your friends! Share your epic games using the URL sharing feature.

If you have any questions, feel free to open an issue on GitHub.
