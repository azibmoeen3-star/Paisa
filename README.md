# OK Backend

This is the backend Express application for the OK project.

## Features

- Express server with centralized routing
- MongoDB models for users and transactions
- User referrals tracking
- Deposit and withdraw operations
- Transaction history for each user

## Setup

1. Copy the environment example:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Then fill in:
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start MongoDB locally or set `MONGODB_URI` in `.env`.
4. Run the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/users/register` - register with `username`, `phone`, `password`, and optional `referredBy`
- `POST /api/users/login` - login with `phone` and `password`
- `GET /api/users/providers` - list payment providers for deposit
- `GET /api/users/:id` - get user profile
- `POST /api/users/:id/deposit-request` - create deposit request with `provider`, `amount`, `transactionId`, `accountDetails`, and optional `receipt` file upload
- `POST /api/users/:id/withdraw-request` - create withdraw request with `amount` and `accountDetails`
- `GET /api/users/:id/transactions` - get user transaction history
- `GET /api/users/:id/deposits` - get deposit requests for a user
- `GET /api/users/:id/withdraws` - get withdraw requests for a user
- `POST /api/users/:id/avatar` - upload user profile image and save Cloudinary URL
- `GET /api/admin/deposits` - admin list pending deposit requests
- `POST /api/admin/deposits/:id/approve` - admin approve deposit and add money to user
- `GET /api/admin/withdraws` - admin list pending withdraw requests
- `POST /api/admin/withdraws/:id/approve` - admin approve withdraw and deduct money from user

## User model fields

- `name`
- `email`
- `password`
- `money`
- `referralsCount`
- `referralIds`
- `referredBy`

## Notes

- `deposit` and `withdraw` operations create transaction records.
- Withdrawals will fail if the user has insufficient funds.
