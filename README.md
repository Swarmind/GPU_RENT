
  # Rental GPU Service Prototype

  This is a code bundle for Rental GPU Service Prototype. The original project is available at https://www.figma.com/design/rlNEvs055Kwpq7SEC5U0Yg/Rental-GPU-Service-Prototype.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Docker Deployment Notes

  The production Docker image serves SPA via Nginx and includes:
  - `try_files ... /index.html` fallback, so browser reload on non-root routes does not return `404`.
  - Same-origin reverse proxies:
    - `/api/*` -> `https://api.anthive.ai/*`
    - `/auth/*` -> `https://auth.swarmind.ai/*`
  - Cookie domain rewrite on `/auth/*` so auth cookie is first-party for frontend host.

  ## Optional Build-Time Overrides

  You can override API hosts at build time with Vite env vars:
  - `VITE_API_BASE_URL` (default: `/api`)
  - `VITE_AUTH_API_BASE_URL` (default: `/auth`)
  
