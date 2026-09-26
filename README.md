# Chaitanya Impex CRM PWA

PWA CRM for Chaitanya Impex / SafeCare. Frontend is hosted on GitHub Pages. Backend uses Google Apps Script JSONP and the Google Sheet database.

## Frontend files
- `index.html` - UI and SafeCare logo presentation
- `app.js` - CRM screens and module logic
- `gas-api.js` - JSONP API client and session storage
- `manifest.json` - PWA metadata
- `sw.js` - service worker
- `icon-180.png`, `icon-192.png`, `icon-512.png` - PWA icons

## Backend
- `Code.gs` - Google Apps Script API
- Google Sheet ID is already set to the supplied spreadsheet ID.

## Important setup
1. Open Apps Script attached to the CRM spreadsheet or create a standalone Apps Script project.
2. Paste `Code.gs`.
3. Deploy as Web app: Execute as you / access Anyone.
4. Copy the Web App URL.
5. Open `gas-api.js` and replace `PASTE_YOUR_DEPLOYMENT_ID` with the deployment ID, keeping the `/exec` URL format.
6. Upload the seven frontend files to GitHub Pages.

## User passwords
`Users.Password_Hash` must contain a SHA-256 hash of the password. Do not store plain-text passwords.

## Current sheet tabs
Dashboard, Users, Websites, Lead_Sources, Pipeline_Stages, Companies, Contacts, Leads, Deals, Activities, Tasks, Products, Templates, Notes, Config.

## Logo
The UI references the SafeCare logo at `https://www.safe-care.in/designer/images/logo.png`. For GitHub Pages reliability, replace this remote reference with a locally downloaded copy of the logo if the client provides/authorizes the asset.
