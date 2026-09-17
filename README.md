# PetCare Assist

PetCare Assist is a mobile-first pet wellness companion for keeping a pet's activity, care routines, documents, rewards, and insurance-claim preparation in one place.

The project is designed around a simple principle: useful pet-care organization without pretending to be a veterinarian, insurer, or emergency service.

## Live app

**GitHub Pages:** https://w0l1-stack.github.io/petcare-assist/

## App pages

| Page | Link | Description |
|---|---|---|
| Home | https://w0l1-stack.github.io/petcare-assist/ | Overview of the pet journey, recent activity, quick actions, and care snapshot. |
| My Pet | https://w0l1-stack.github.io/petcare-assist/pet | Pet profile with identity, insurance details, care score, walks, wellness, and documents. |
| Activity | https://w0l1-stack.github.io/petcare-assist/activity | Start and finish walks, capture GPS distance when available, and review walk history. |
| Wellness | https://w0l1-stack.github.io/petcare-assist/wellness | Keep simple care routines, completed tasks, and wellness observations. |
| Rewards | https://w0l1-stack.github.io/petcare-assist/rewards | View PetCare Points, earning rules, and the points history. |
| Documents | https://w0l1-stack.github.io/petcare-assist/documents | Upload pet-care documents, review Gemini-extracted information, and identify missing or uncertain fields. |
| Assistant | https://w0l1-stack.github.io/petcare-assist/assistant | Ask the PetCare Assistant to explain user-provided pet-care information and documents. |

The page URLs are real client-side routes. GitHub Pages is configured with an SPA fallback so refreshing a route such as `/activity` does not fall back to a GitHub 404 page.

## What it does

- **Pet profile**: name, species, breed, date of birth, insurance details, and profile photo.
- **Walking & activity**: start and finish walks, capture browser GPS distance when available, fall back to a manual estimate when GPS is unavailable, and review activity history.
- **Care & wellness**: create care routines, mark tasks complete, and keep simple wellness observations.
- **Care & Activity Score**: a transparent, non-medical score based on recorded activity and care data. It does not diagnose health conditions.
- **Rewards**: earn PetCare Points from completed walks and review the points ledger. Points currently have no cash value and partner redemption is not implemented yet.
- **Documents**: upload supported pet-care documents for Gemini-assisted extraction, review extracted information, and identify missing or uncertain fields.
- **Assistant**: ask questions about user-provided pet-care information and documents. The assistant is intentionally constrained from diagnosing, prescribing treatment, or promising insurance coverage.
- **Claim preparation**: the backend structure includes claim drafts so verified pet information and documents can eventually be assembled into a reviewable insurance-claim package.

## Product boundaries

PetCare Assist is an organizational and preparation tool. It is not a veterinary diagnostic system, veterinary emergency service, insurance company, claims adjuster, or guarantee of reimbursement.

AI-extracted document information remains unverified until the user reviews and confirms it. The application should never invent missing medical, insurance, or pet information.

## Tech stack

- React
- Vite
- Express
- Node.js
- Gemini API via `@google/genai`
- Lucide React
- Browser Geolocation API
- Local browser persistence for the current prototype

## Architecture

The frontend lives in `src/` and communicates with the Express server for AI-assisted features.

Key frontend modules:

- `src/main.jsx` - application screens and UI state
- `src/styles.css` - mobile-first product styling and responsive layout
- `src/activity.js` - GPS tracking and distance calculation
- `src/score.js` - Care & Activity Score calculation
- `src/api.js` - frontend API helpers

Backend:

- `server/index.js` - Express API and Gemini integration
- `/api/health` - health check
- `/api/assistant` - pet-care assistant endpoint
- `/api/documents/analyze` - document extraction endpoint

## Gemini safety design

The backend keeps the Gemini API key server-side. The assistant is given a system instruction that limits it to explaining user-provided information, summarizing documents, identifying missing information, and organizing claim-preparation material.

The document endpoint requests structured JSON containing:

```json
{
  "document_type": "",
  "summary": "",
  "extracted_fields": {},
  "missing_information": [],
  "uncertain_information": [],
  "requires_user_verification": true
}
```

## Run locally

Install dependencies:

```bash
npm install
```

Create an environment variable for the server:

```bash
GEMINI_API_KEY=your_key_here
```

Start the frontend and API together:

```bash
npm run dev
```

Build the production frontend:

```bash
npm run build
```

Run the production server after building:

```bash
npm start
```

The development setup uses Vite for the frontend and Express for the API.

## Environment variables

`GEMINI_API_KEY` is required for Gemini-powered assistant and document-analysis features. Keep this key on the server and never expose it in client-side code.

## Current prototype status

The core mobile product shell, pet profile, activity tracking, wellness routines, rewards ledger, document upload/review flow, assistant UI, scoring logic, clean client-side routes, and GitHub Pages deployment configuration are implemented.

The next product layer is persistence and production hardening: authenticated users, database-backed records, a more complete claim-preparation workflow, editable document fields, real reward redemption, and stronger activity-history analytics.

## Repository

GitHub: https://github.com/W0l1-stack/petcare-assist

## License

This project does not currently declare a public open-source license. Unless a license is added to the repository, the source should be treated as all-rights-reserved by default.
