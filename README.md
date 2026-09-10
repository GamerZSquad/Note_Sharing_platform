# StudySphere

The app lives in [`studysphere/`](./studysphere).

```bash
cd studysphere
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Requires PostgreSQL (`DATABASE_URL` + `DIRECT_URL`). See [`studysphere/.env.example`](./studysphere/.env.example) and [`studysphere/docs/VERCEL_MIGRATION.md`](./studysphere/docs/VERCEL_MIGRATION.md).

Then open http://localhost:3000
