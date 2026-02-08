# Ride Hailing API

API de covoiturage : inscription/connexion Rider et Driver, création de course, estimation, annulation, historique et flux conducteur (arrivée, démarrage, fin de course).

---

## Lancer le projet

### Prérequis

- Node.js (v18+)
- MongoDB
- Variables d’environnement (fichier `.env` à la racine)

### Variables d’environnement

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL="mongodb://localhost:27017/ride_hailing"
JWT_SECRET="votre_secret_jwt"
PORT=7600
```

### Installation et démarrage

```bash
# Installer les dépendances
npm install

# Générer le client Prisma (fait automatiquement après install)
npx prisma generate

# Appliquer le schéma à la base MongoDB
npx prisma db push

# Lancer en développement
npm run dev
```

Le serveur tourne par défaut sur **http://localhost:7600**.

### Autres commandes

```bash
npm run build      # Compiler TypeScript → dist/
npm start          # Lancer en production (node dist/server.js)
npm run seed       # Peupler la BDD (si script seed présent)
```

---

## Base URL des API

Toutes les routes sont préfixées par :

```
http://localhost:7600/api
```

L’authentification se fait par **cookie** (`token`) ou **header** `Authorization: Bearer <token>` (après login/register).

---

## Endpoints

### Rider – Auth  
**Préfixe :** `POST/GET /api/rider/auth`

| Méthode | Route | Auth | Description |
|--------|--------|------|-------------|
| POST | `/api/rider/auth/register` | Non | Inscription rider |
| POST | `/api/rider/auth/login` | Non | Connexion rider |
| GET | `/api/rider/auth/me` | Oui | Profil du rider connecté |
| POST | `/api/rider/auth/logout` | - | Déconnexion |

---

### Rider – Ride  
**Préfixe :** `POST/GET /api/rider/ride`

| Méthode | Route | Auth | Description |
|--------|--------|------|-------------|
| POST | `/api/rider/ride/estimate` | Oui | Estimation : `distance`, `eta` (min), `price`. Body : `startLat`, `startLng`, `endLat`, `endLng` |
| POST | `/api/rider/ride/create` | Oui | Créer une course (body : mêmes coordonnées). Statut initial : MATCHING |
| POST | `/api/rider/ride/cancel` | Oui | Annuler une course. Body : `rideId`, `reason` (obligatoire si statut ≠ MATCHING) |
| GET | `/api/rider/ride/history` | Oui | Historique des courses du rider (ordre création DESC) |

---

### Driver – Auth  
**Préfixe :** `POST/GET /api/driver/auth`

| Méthode | Route | Auth | Description |
|--------|--------|------|-------------|
| POST | `/api/driver/auth/register` | Non | Inscription driver |
| POST | `/api/driver/auth/login` | Non | Connexion driver |
| GET | `/api/driver/auth/me` | Oui | Profil du driver connecté |
| POST | `/api/driver/auth/logout` | - | Déconnexion |

---

### Driver – Ride  
**Préfixe :** `POST/PUT/GET /api/driver/ride`

| Méthode | Route | Auth | Description |
|--------|--------|------|-------------|
| GET | `/api/driver/ride/offers` | Oui | Liste des offres de course pour le driver |
| POST | `/api/driver/ride/confirm-ride` | Oui | Accepter une offre. Body : `driverId`, `rideId` |
| PUT | `/api/driver/ride/update-location` | Oui | Mettre à jour position. Body : `lat`, `lng` |
| POST | `/api/driver/ride/arrived` | Oui | Marquer “arrivé”. Body : `rideId`. Statut : DRIVER_ASSIGNED → ARRIVED |
| POST | `/api/driver/ride/start` | Oui | Démarrer la course. Body : `rideId`. Statut : ARRIVED → ONGOING, `startDate` renseigné |
| POST | `/api/driver/ride/complete` | Oui | Terminer la course. Body : `rideId`. Statut : ONGOING → COMPLETED, `endDate` + driver AVAILABLE |

---

### Partagé / Public (sans auth)

| Méthode | Route | Description |
|--------|--------|-------------|
| GET | `/api/ride/:rideId/events` | Liste chronologique des événements de la course (RideEvent) |
| GET | `/api/share/:rideId` | Infos publiques de partage : `status`, `eta`, `driver` (id, fullName, email) ou null |

---

## Exemples de body (JSON)

**Estimation / Création de course**

```json
{
  "startLat": 48.8566,
  "startLng": 2.3522,
  "endLat": 48.8606,
  "endLng": 2.3376
}
```

**Annulation (si raison requise)**

```json
{
  "rideId": "...",
  "reason": "Changement de plans"
}
```

**Driver : arrivée / démarrage / fin**

```json
{
  "rideId": "..."
}
```

**Mise à jour position driver**

```json
{
  "lat": 48.85,
  "lng": 2.35
}
```

---

## Statuts de course (StatusRide)

- `MATCHING` – En recherche de conducteur  
- `DRIVER_ASSIGNED` – Conducteur assigné  
- `ARRIVED` – Conducteur arrivé au point de prise en charge  
- `ONGOING` – Course en cours  
- `COMPLETED` – Terminée  
- `CANCELLED` – Annulée  

## Événements (RideEvent)

Les actions importantes créent un événement : `REQUESTED`, `CANCELLED`, `DRIVER_ASSIGNED`, `ARRIVED`, `STARTED`, `COMPLETED`.
