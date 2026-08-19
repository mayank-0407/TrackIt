# 📊 TrackIt – Expense Tracker  

**TrackIt** is a full-stack expense tracking application built with **Next.js, TypeScript, TailwindCSS, and MongoDB**.  
It allows users to register, verify their email, log in, and manage their expenses with accounts and categories.  

---

## ✨ Features  

- 🔐 **Authentication** – Signup & Login with email verification  
- 📧 **Email Verification** – Secure account activation via Gmail (SMTP / App Password)  
- 🏦 **Accounts Management** – Add multiple accounts (Bank, Wallet, etc.)  
- 🗂️ **Categories** – Organize expenses into categories  
- 💸 **Expense Tracking** – Add, edit, and delete expenses  
- 📊 **Dashboard** – Track spending visually  
- 👤 **Profile Management** – Edit profile & change password  

---

## 🛠️ Tech Stack  

- **Frontend:** Next.js 14 (App Router) + TypeScript + TailwindCSS  
- **Backend:** Next.js API Routes  
- **Database:** MongoDB (Mongoose ODM)  
- **Auth & Security:** JWT + bcrypt + Nodemailer (Gmail SMTP)  
- **Deployment:** Vercel  

---

## ⚙️ Installation & Setup  

### 1. Clone the repo  
```bash
git clone https://github.com/yourusername/trackit.git
cd trackit
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
Create a .env.local file in root:

# Mongo
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

ENCRYPTION_KEY=
JWT_SECRET=

BASE_URL=https://trackit.mayankaggarwal.me

EMAIL_USER=
EMAIL_PASS=
```

⚠️ Note: For Gmail, enable 2FA and create an App Password. Normal Gmail password won’t work.

### 4. Run the app locally
```bash
npm run dev
```

Open http://localhost:3000

### Mobile app

The Expo React Native client lives in `mobile/` and uses the same API and MongoDB data as the web app.

```bash
cd mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to the reachable web app URL
npm start
```

Use your computer's LAN IP instead of `localhost` when testing on a physical device. The mobile client supports sign-in, live balances, accounts, transaction history, and adding expenses.

### 5. Deploy on Vercel

- Push code to GitHub
- Import project into Vercel
- Add environment variables in Vercel Dashboard → Settings → Environment Variables
- Deploy 🚀

---
## 📧 Email Setup

TrackIt uses Nodemailer + Gmail SMTP for sending verification emails.
If you face issues on Vercel:

- Use App Password instead of your Gmail password.
- Or switch to Resend / SendGrid (recommended for production).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the repo
2. Create a branch:
```bash
git checkout -b feature/your-feature
```

3. Commit changes:
```bash
git commit -m "Added new feature"
```

4. Push to branch:
```bash
git push origin feature/your-feature
```

5. Create a Pull Request
