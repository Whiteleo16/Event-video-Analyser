# EventLens Frontend

React + Vite frontend for the EventLens event-video analysis project.

## Features implemented in this frontend
- Login, registration, forgot-password screens using Supabase Auth.
- Protected application routes.
- Dashboard, analysis upload page, reports library and report detail page.
- Local video preview and basic file type/size validation.
- API client that attaches the current Supabase access token.
- UI areas prepared for backend detection frames, bounding boxes and activity timeline.
- PDF download client for a backend endpoint.

## Setup
1. Open this `frontend` folder in VS Code.
2. Create `.env.local` by copying `.env.example`.
3. Set `VITE_SUPABASE_URL` to your Supabase project's URL and
   `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key (or legacy `anon` key).
4. In terminal run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the URL printed by Vite, normally http://localhost:5173.

### Using another computer on the same network

`.env.local` is intentionally excluded from Git, so it will not be included when
you copy or clone the project. On each computer, create its own
`frontend/.env.local` from `.env.example` and enter the URL and publishable key
for the same Supabase project. Get these from the Supabase dashboard's project
API settings. Restart the Vite dev server after changing the file.

To use one running dev server from another device on your Wi-Fi, start Vite on
the host computer with `npm run dev`, then open
`http://<host-computer-LAN-IP>:5173` on the other device. Allow port 5173 through
the host computer's firewall for your private network if prompted. Do not expose
the development server to the public internet.

In Supabase Dashboard > Authentication > URL Configuration, add the app's
address to the allowed Redirect URLs, for example
`http://192.168.1.25:5173/**` (replace this with the host computer's LAN IP).
The signup confirmation link returns to the same address used to open the app.
If the host's LAN IP changes, update the allowed URL. You can also add
`http://localhost:5173/**` for use on the host computer itself.

Do not put your Supabase dashboard email or password in the app or environment
file. Users sign in through the app's Supabase Auth screen. Never expose a
service-role/secret key in frontend code or a `VITE_` variable. If the app is
being run separately on each computer, each copy needs its own `.env.local`.

## Supabase
Enable Email/Password in Supabase Authentication. Set the local Site URL and redirect URLs in Supabase Auth URL configuration. For email confirmation, confirm the email before signing in. Configure password reset redirect URLs too.

## Backend integration contract
This frontend expects these Flask endpoints:
- `POST /api/analyze` with multipart field `video`
- `GET /api/reports`
- `GET /api/reports/:id`
- `GET /api/reports/:id/pdf` returning PDF bytes

The analysis response may contain:
```json
{
  "annotated_frame_url": "https://...",
  "detections": [
    {"class_name": "person", "confidence": 0.91, "bbox": [12, 15, 42, 80]}
  ],
  "events": [
    {"activity_name": "presentation", "start_seconds": 12, "end_seconds": 44, "confidence": 0.78}
  ]
}
```
Bounding box coordinates in this UI are percentages (0–100) relative to the image. Convert pixel coordinates to percentages in the backend or adapt the component.

## Important
Until the Flask endpoints exist, dashboard/report pages will show a backend connection notice and analysis submission will fail with a network error. The UI and local video preview still work. Never place Supabase service-role/secret keys in `VITE_` variables or frontend code. Do not commit `.env.local`.
