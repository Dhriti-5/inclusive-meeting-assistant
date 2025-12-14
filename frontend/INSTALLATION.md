# 🚀 Installation Instructions

Follow these steps to get your InclusiveMeet frontend up and running!

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **A code editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

---

## 📦 Installation Steps

### Method 1: Automated Setup (Recommended)

1. **Open PowerShell** in the frontend directory

2. **Run the setup script:**
   ```powershell
   .\setup.ps1
   ```

3. **Wait for installation** (takes 2-3 minutes)

4. **Done!** The script will:
   - Check Node.js installation
   - Install all dependencies
   - Create .env file
   - Show next steps

### Method 2: Manual Setup

1. **Open terminal** in the frontend directory

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # On Windows PowerShell:
   # Copy-Item .env.example .env
   ```

4. **Configure environment:**
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 🎯 Starting the Application

### Development Mode

```bash
npm run dev
```

**What happens:**
- Vite dev server starts
- App opens at `http://localhost:3000`
- Hot reload enabled (changes appear instantly)
- Terminal shows compilation status

**You should see:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Production Build

```bash
npm run build
```

**Output:** Optimized files in `dist/` folder

### Preview Production Build

```bash
npm run preview
```

**Output:** Serves production build at `http://localhost:4173`

---

## 🔍 Verification

### 1. Check Dependencies Installed

```bash
npm list --depth=0
```

**Expected output:** List of all packages

### 2. Check Development Server

1. Run `npm run dev`
2. Open `http://localhost:3000`
3. You should see the InclusiveMeet dashboard

### 3. Test Features

- [ ] Dashboard loads
- [ ] Theme toggle works (moon/sun icon)
- [ ] Join meeting card appears
- [ ] No console errors

---

## 🎨 VS Code Setup (Optional but Recommended)

### Install Recommended Extensions

Open Command Palette (`Ctrl+Shift+P`) and run:
```
Extensions: Show Recommended Extensions
```

Install:
1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind
4. **ES7+ React/Redux/React-Native snippets** - Code snippets

### Configure Settings

Settings are already configured in `.vscode/settings.json`:
- Format on save enabled
- ESLint auto-fix enabled
- Tailwind IntelliSense configured

---

## 📂 Project Structure Overview

After installation, you'll have:

```
frontend/
├── node_modules/        ✅ Installed dependencies
├── src/                 ✅ Source code
├── public/              ✅ Static assets
├── .env                 ✅ Environment config
├── package.json         ✅ Dependencies manifest
└── vite.config.js       ✅ Build configuration
```

---

## 🐛 Troubleshooting

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 3000 is already in use"

**Solution 1:** Kill the process using port 3000
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Solution 2:** Change port in `vite.config.js`:
```javascript
server: {
  port: 3001  // Use different port
}
```

### Issue: "EACCES: permission denied"

**Solution:** Run terminal as administrator

### Issue: "Module not found"

**Solution:** Delete and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Cannot find module '@/components/...'"

**Solution:** Restart the dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔧 Configuration Options

### Change API URL

Edit `.env`:
```env
VITE_API_URL=http://your-backend-url/api
```

### Change Port

Edit `vite.config.js`:
```javascript
server: {
  port: 3001,  // Your preferred port
}
```

### Enable HTTPS

Edit `vite.config.js`:
```javascript
server: {
  https: true,
}
```

---

## 📚 Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check code with ESLint
npm run lint:fix     # Fix ESLint issues

# Dependencies
npm install          # Install dependencies
npm update           # Update dependencies
npm outdated         # Check outdated packages
```

---

## 🎓 Next Steps After Installation

1. **Explore the UI**
   - Visit `http://localhost:3000`
   - Click around, test features
   - Toggle dark mode

2. **Read Documentation**
   - `README.md` - Full documentation
   - `QUICKSTART.md` - Quick start guide
   - `COMPONENT_GUIDE.md` - Component usage

3. **Test Components**
   - Check the dashboard
   - Try the meeting flow
   - Inspect network requests

4. **Connect Backend**
   - Ensure Python backend is running
   - Update `.env` with backend URL
   - Test API integration

5. **Customize Design**
   - Change colors in `tailwind.config.js`
   - Modify components in `src/components/`
   - Update branding

---

## 🆘 Getting Help

### Resources

1. **Documentation**
   - README.md
   - QUICKSTART.md
   - COMPONENT_GUIDE.md
   - PROJECT_SUMMARY.md

2. **Console Logs**
   - Open browser DevTools (F12)
   - Check Console tab
   - Check Network tab

3. **Terminal Output**
   - Read error messages
   - Check stack traces

### Common Solutions

- Clear browser cache
- Restart dev server
- Delete `node_modules` and reinstall
- Check `.env` file
- Verify backend is running

---

## ✅ Installation Checklist

Before proceeding, verify:

- [ ] Node.js v16+ installed
- [ ] npm installed
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file created and configured
- [ ] Dev server starts without errors
- [ ] App loads at `http://localhost:3000`
- [ ] No console errors
- [ ] Theme toggle works

---

## 🎉 Success!

If you see the InclusiveMeet dashboard at `http://localhost:3000`, **congratulations!** Your frontend is successfully installed and running.

**What's Next?**
- Start customizing components
- Connect to your Python backend
- Add new features
- Deploy to production

---

**Need more help?** Check the other documentation files or the inline code comments!

Happy coding! 🚀
