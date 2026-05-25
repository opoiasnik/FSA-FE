# FSA Rental Frontend

Angular frontend for the FSA Rental application. It provides the user-facing rental marketplace, owner dashboard, profile management, viewing request flow, messaging, and favourites.

## Technology Stack

- Angular 19
- TypeScript 5.7
- PrimeNG 19
- PrimeIcons
- Angular OAuth2 OIDC
- Leaflet
- RxJS
- Nginx production runtime

## Main Screens

| Route | Purpose |
| --- | --- |
| `/home` | Landing/search entry page with featured listings. |
| `/listings` | Listing search, filters, sorting, pagination, and map previews. |
| `/listings/:id` | Listing detail, gallery, owner contact, favourite action, viewing request. |
| `/listings/create` | Owner listing wizard. |
| `/listings/:id/edit` | Owner listing edit flow. |
| `/favourites` | Saved listings. |
| `/viewings` | User or owner viewing request management. |
| `/messages` and `/messages/:id` | Conversations and messages. |
| `/profile` | Profile, avatar, email verification, notification settings. |
| `/owner` | Owner dashboard with listings, requests, stats, and CSV export. |
| `/login` | Login form. |
| `/register` | Registration form. |

## Feature Areas

- Authentication and role-based navigation.
- Registration with field-level Keycloak error handling.
- Global HTTP error handling and PrimeNG toast notifications.
- Listing cards, detail pages, gallery, location map, and listing wizard.
- Favourite store shared across home, search, detail, and favourites pages.
- Viewing request creation and owner approval/rejection/cancellation.
- Conversation and message UI.
- Profile forms, avatar upload, verification, and notification settings.
- Owner dashboard actions with status toasts and CSV export.

## Local Development

Install dependencies:

```sh
npm install
```

Run dev server:

```sh
npm start
```

The frontend uses `proxy.conf.json`:

- `/api` -> `http://localhost:8080`
- `/realms` -> `http://localhost:8081`
- `/admin` -> `http://localhost:8081`

Open:

```text
http://localhost:4200
```

## Build

```sh
npm run build
```

Output:

```text
dist/fsa-rental-fe
```

Current known build warnings:

- Initial bundle exceeds the configured warning budget by a small amount.
- `leaflet` is a CommonJS dependency and Angular reports an optimization bailout warning.

## Authentication Configuration

Local environment:

```text
src/app/environments/environment.ts
```

Production environment:

```text
src/app/environments/environment.prod.ts
```

Expected Keycloak values:

| Setting | Value |
| --- | --- |
| Realm | `rental` |
| Client | `rental-client` |
| Roles | `USER`, `OWNER` |
| Local issuer | `http://localhost:8081/realms/rental` |

## Production Runtime

The frontend Docker image builds Angular and serves the static output through Nginx.

Important files:

- `Dockerfile`
- `nginx.conf`

Nginx proxies `/api/` to the backend Kubernetes service:

```text
http://fsa-be.app.svc.cluster.local:8080
```

## Error Feedback

The app uses PrimeNG toasts and field-level validation. Key business actions provide visible feedback:

- Login and registration.
- Listing publish/update.
- Favourites add/remove.
- Viewing request create/approve/reject/cancel.
- Profile save, avatar upload, email verification, notification preferences.
- Owner listing activate/deactivate/delete and CSV export.
- Message send.
- Share/copy listing link.
