# ProofEd - Complete Render Deployment Guide

This guide will walk you through deploying the entire ProofEd application on Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
4. **Gmail Account** - For email service (or any SMTP service)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and sign up
3. Complete the registration

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Choose **Free (M0)** tier
3. Select a cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., `proofed-cluster`)
5. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Create Database User
1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `proofed-admin` (or your choice)
5. Password: Click "Autogenerate Secure Password" and **SAVE IT** (you'll need it)
6. Database User Privileges: "Atlas admin" (or "Read and write to any database")
7. Click "Add User"

### 1.4 Configure Network Access
1. In Security section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) - This allows Render to connect
4. Click "Confirm"

### 1.5 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string (looks like: `mongodb+srv://proofed-admin:<password>@proofed-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. **Replace `<password>` with your database user password**
6. **Save this complete connection string** - You'll use it in Render

---

## 📧 Step 2: Set Up Gmail App Password (for Email Service)

### 2.1 Enable 2-Step Verification
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Under "How you sign in to Google", enable "2-Step Verification" if not already enabled

### 2.2 Generate App Password
1. Still in Security settings, search for "App passwords" or go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other (Custom name)" as device
4. Name it "ProofEd"
5. Click "Generate"
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
7. **Save this password** - You'll use it as `EMAIL_PASS` in Render

---

## 🚀 Step 3: Deploy Backend on Render

### 3.1 Create New Web Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click "New +" button (top right)
3. Select "Web Service"

### 3.2 Connect Repository
1. If first time, click "Connect account" and authorize Render to access your GitHub
2. Select your repository: `ProofEd` (or your repo name)
3. Click "Connect"

### 3.3 Configure Backend Service
Fill in the following settings:

- **Name**: `proofed-backend` (or your choice)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Select **Free** (or paid if preferred)

### 3.4 Add Environment Variables
Click "Add Environment Variable" and add each of these:

```
PORT = 5000
```

```
NODE_ENV = production
```

```
MONGO_URI = mongodb+srv://proofed-admin:YOUR_PASSWORD@proofed-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
⚠️ Replace `YOUR_PASSWORD` and the cluster URL with your actual MongoDB connection string

```
JWT_SECRET = generate_a_long_random_string_here_minimum_32_characters
```
💡 Generate a secure random string (you can use: `openssl rand -base64 32` or any online generator)

```
FRONTEND_URL = https://your-frontend-app.onrender.com
```
⚠️ **Update this after deploying frontend** (we'll come back to this)

```
EMAIL_HOST = smtp.gmail.com
```

```
EMAIL_PORT = 587
```

```
EMAIL_USER = your_email@gmail.com
```
⚠️ Use the Gmail address you created the app password for

```
EMAIL_PASS = abcd efgh ijkl mnop
```
⚠️ Use the 16-character app password from Step 2

```
EMAIL_FROM = your_email@gmail.com
```
⚠️ Same as EMAIL_USER

### 3.5 Deploy
1. Scroll down and click "Create Web Service"
2. Render will start building and deploying (takes 5-10 minutes)
3. Wait for deployment to complete
4. **Copy the service URL** (e.g., `https://proofed-backend.onrender.com`)
5. Save this URL - you'll need it for frontend configuration

---

## 🎨 Step 4: Deploy Frontend on Render

### 4.1 Create New Static Site
1. In Render dashboard, click "New +"
2. Select "Static Site"

### 4.2 Connect Repository
1. Select the same repository: `ProofEd`
2. Click "Connect"

### 4.3 Configure Frontend Service
Fill in the following:

- **Name**: `proofed-frontend` (or your choice)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `frontend` ⚠️ **IMPORTANT**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` ⚠️ **IMPORTANT**

### 4.4 Add Environment Variable
Click "Add Environment Variable":

```
VITE_API_URL = https://proofed-backend.onrender.com
```
⚠️ Replace `proofed-backend.onrender.com` with your actual backend URL from Step 3

### 4.5 Deploy
1. Click "Create Static Site"
2. Render will build and deploy (takes 3-5 minutes)
3. Wait for deployment to complete
4. **Copy the frontend URL** (e.g., `https://proofed-frontend.onrender.com`)

---

## 🔄 Step 5: Update Backend Environment Variable

Now that frontend is deployed, update the backend's `FRONTEND_URL`:

1. Go to your backend service in Render dashboard
2. Click on "Environment" tab
3. Find `FRONTEND_URL` variable
4. Click the edit icon (pencil)
5. Update the value to your frontend URL: `https://proofed-frontend.onrender.com`
6. Click "Save Changes"
7. Render will automatically redeploy (takes 2-3 minutes)

---

## 👤 Step 6: Create Admin User

You need to create an admin user to approve universities. You have two options:

### Option A: Using Render Shell (Recommended)
1. Go to your backend service in Render
2. Click on "Shell" tab
3. Run:
   ```bash
   cd backend
   node src/scripts/createAdmin.js
   ```
4. Enter email and password when prompted

### Option B: Run Locally
1. In your local project, go to `backend` folder
2. Create a `.env` file with:
   ```env
   MONGO_URI=your_production_mongo_uri_from_render
   ```
3. Run:
   ```bash
   node src/scripts/createAdmin.js
   ```
4. Enter email and password when prompted

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Frontend
1. Visit your frontend URL: `https://proofed-frontend.onrender.com`
2. Check browser console (F12) for any errors
3. The page should load without errors

### 7.2 Test Backend
1. Visit: `https://proofed-backend.onrender.com/api/admin/pending-universities`
2. Should return JSON (may require authentication)
3. If you see JSON response, backend is working

### 7.3 Test Complete Flow
1. **University Signup**:
   - Go to frontend URL
   - Click "University Signup"
   - Fill in university details
   - Submit

2. **Email Verification**:
   - Check email for OTP
   - Enter OTP and verify

3. **Connect Wallet**:
   - Connect MetaMask wallet
   - Submit wallet address

4. **Admin Approval**:
   - Go to `/admin/login` on frontend
   - Login with admin credentials
   - Approve the university

5. **Issue Certificate**:
   - Login to university dashboard
   - Issue a test certificate
   - Verify it works

---

## 🔧 Troubleshooting

### Backend Won't Start
- **Check logs**: Go to backend service → "Logs" tab
- **Verify environment variables**: Ensure all are set correctly
- **Check MongoDB connection**: Verify `MONGO_URI` is correct and network access allows 0.0.0.0/0
- **Check PORT**: Should be 5000

### Frontend Can't Connect to Backend
- **Verify `VITE_API_URL`**: Should match your backend URL exactly
- **Check CORS**: Ensure `FRONTEND_URL` in backend matches frontend URL
- **Check browser console**: Look for CORS or network errors

### Email Not Sending
- **Verify Gmail App Password**: Use the 16-character app password, not regular password
- **Check EMAIL_USER**: Should be full Gmail address
- **Check EMAIL_PASS**: No spaces in the app password (remove spaces if copied with spaces)
- **Check backend logs**: Look for email sending errors

### Database Connection Fails
- **Verify MONGO_URI**: Check the connection string format
- **Check network access**: MongoDB Atlas should allow 0.0.0.0/0
- **Verify password**: Ensure password in connection string matches database user password
- **Check cluster status**: Ensure cluster is running in MongoDB Atlas

### Build Fails
- **Check Node version**: Render uses Node 18+ by default
- **Check build logs**: Look for specific error messages
- **Verify dependencies**: Ensure all packages are in `package.json`

### Services Spin Down (Free Tier)
- **Render Free Tier**: Services spin down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Solution**: Consider upgrading to paid plan for production, or use a service like UptimeRobot to ping your services

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_minimum_32_characters
FRONTEND_URL=https://your-frontend-app.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-app.onrender.com
```

---

## 🎯 Quick Checklist

Before deploying:
- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created and password saved
- [ ] Network access configured (0.0.0.0/0)
- [ ] MongoDB connection string ready
- [ ] Gmail app password generated
- [ ] JWT secret generated

After deploying backend:
- [ ] Backend URL copied
- [ ] All environment variables set
- [ ] Backend deployment successful
- [ ] Backend logs show no errors

After deploying frontend:
- [ ] Frontend URL copied
- [ ] VITE_API_URL set to backend URL
- [ ] Frontend deployment successful
- [ ] Frontend loads without errors

After configuration:
- [ ] FRONTEND_URL updated in backend
- [ ] Admin user created
- [ ] Complete flow tested
- [ ] Email service working

---

## 🌐 Custom Domain (Optional)

### For Backend:
1. Go to backend service → "Settings"
2. Scroll to "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

### For Frontend:
1. Go to frontend service → "Settings"
2. Scroll to "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` in backend to match

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render logs (Service → Logs tab)
3. Check MongoDB Atlas logs
4. Verify all environment variables are set correctly
5. Ensure all services are running (not spun down)

---

**Congratulations!** Your ProofEd application should now be fully deployed on Render! 🎉
