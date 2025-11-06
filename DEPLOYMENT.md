# Vercel Deployment Guide for Ayursutra

This guide will help you deploy both the frontend and backend of Ayursutra to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. Git repository connected to GitHub

## Deployment Steps

### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

### Step 2: Login to Vercel

```powershell
vercel login
```

### Step 3: Deploy Backend

1. Navigate to the Backend directory:
```powershell
cd Backend
```

2. Deploy to Vercel:
```powershell
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `ayursutra-backend` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

4. After deployment, you'll get a URL like: `https://ayursutra-backend-xxxx.vercel.app`

5. **Important**: Add environment variables in Vercel Dashboard:
   - Go to your project settings on Vercel
   - Navigate to "Settings" → "Environment Variables"
   - Add all variables from `.env.example`:
     - `NODE_ENV` = `production`
     - `MONGODB_URI` = your MongoDB connection string
     - `JWT_SECRET` = your JWT secret
     - `JWT_EXPIRE` = `7d`
     - `FRONTEND_URL` = (will add after frontend deployment)
     - `GMAIL_USER` = your Gmail address
     - `GMAIL_APP_PASSWORD` = your Gmail app password

6. Redeploy to apply environment variables:
```powershell
vercel --prod
```

### Step 4: Deploy Frontend

1. Navigate back to root directory:
```powershell
cd ..
```

2. Update your local `.env` file with the backend URL:
```
VITE_API_URL=https://ayursutra-backend-xxxx.vercel.app/api
```

3. Deploy to Vercel:
```powershell
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `ayursutra-frontend` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

5. After deployment, you'll get a URL like: `https://ayursutra-frontend-xxxx.vercel.app`

6. **Important**: Add environment variables in Vercel Dashboard:
   - Go to your project settings on Vercel
   - Navigate to "Settings" → "Environment Variables"
   - Add:
     - `VITE_API_URL` = `https://ayursutra-backend-xxxx.vercel.app/api`
     - `VITE_APP_NAME` = `AyurSutra`
     - `VITE_APP_DESCRIPTION` = `Panchakarma Management System`

7. Redeploy to apply environment variables:
```powershell
vercel --prod
```

### Step 5: Update Backend CORS

1. Go back to your backend project on Vercel Dashboard
2. Update the `FRONTEND_URL` environment variable with your frontend URL:
   - `FRONTEND_URL` = `https://ayursutra-frontend-xxxx.vercel.app`

3. Redeploy the backend:
```powershell
cd Backend
vercel --prod
```

## Automatic Deployments

Once set up, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Custom Domain (Optional)

1. Go to your project on Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Update DNS settings as instructed by Vercel

## Troubleshooting

### Build Errors
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### API Connection Issues
- Verify `VITE_API_URL` in frontend matches backend URL
- Check `FRONTEND_URL` in backend matches frontend URL
- Ensure CORS is properly configured

### Database Connection Issues
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)

## Monitoring

- View logs: Vercel Dashboard → Your Project → Deployments → View Function Logs
- Monitor performance: Vercel Dashboard → Your Project → Analytics

## Support

For issues with Vercel deployment, visit: https://vercel.com/docs
