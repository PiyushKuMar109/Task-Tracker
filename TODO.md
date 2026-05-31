

# TODO - 404 Not Found fix (frontend ↔ backend)

- [ ] Confirm how production is setting `VITE_API_URL` (or missing env causes wrong baseURL)
- [ ] Make axios baseURL robust: default to `import.meta.env.VITE_API_URL` but ensure it points to backend **including** `/api`
- [ ] Normalize requests to always use `/api/...` (or always omit `/api` from baseURL and prefix in requests)
- [ ] Add a one-line debug log (optional) to print resolved `API_BASE_URL`
- [ ] Run frontend build/lint and do a quick manual request test

