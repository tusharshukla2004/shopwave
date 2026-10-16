# ShopWave frontend

The frontend is a JavaScript React single-page application built with Vite.

## Run locally

```bash
npm ci
npm run dev
```

Vite serves the app at <http://localhost:5173>. Configure the backend API URL
with `VITE_API_URL` in a local `.env` file; it defaults to
`http://localhost:5000/api`.

## Build

```bash
npm run build
npm run start
```

`npm run start` previews the production build locally; deploy the generated
`dist` directory with a static-file host for production.
