# File Tree: Ride-hailing

```
├── 📁 prisma
│   └── 📄 schema.prisma
├── 📁 src
│   ├── 📁 modules
│   │   ├── 📁 admin
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 auth.controller.ts
│   │   │   ├── 📁 middleware
│   │   │   │   └── 📄 auth.ts
│   │   │   └── 📁 routes
│   │   │       └── 📄 auth.route.ts
│   │   ├── 📁 driver
│   │   │   ├── 📁 controllers
│   │   │   │   ├── 📄 auth.controller.ts
│   │   │   │   └── 📄 ride.controller.ts
│   │   │   ├── 📁 middleware
│   │   │   │   └── 📄 auth.ts
│   │   │   └── 📁 routes
│   │   │       ├── 📄 auth.route.ts
│   │   │       └── 📄 ride.route.ts
│   │   ├── 📁 ride
│   │   │   ├── 📁 controllers
│   │   │   │   ├── 📄 rideEvents.controller.ts
│   │   │   │   └── 📄 share.controller.ts
│   │   │   └── 📁 routes
│   │   │       ├── 📄 ride.route.ts
│   │   │       └── 📄 share.route.ts
│   │   └── 📁 rider
│   │       ├── 📁 controllers
│   │       │   ├── 📄 auth.controller.ts
│   │       │   └── 📄 ride.controller.ts
│   │       ├── 📁 jobs
│   │       │   └── 📄 driverMatching.cron.ts
│   │       ├── 📁 middleware
│   │       │   └── 📄 auth.ts
│   │       ├── 📁 routes
│   │       │   ├── 📄 auth.route.ts
│   │       │   └── 📄 ride.route.ts
│   │       └── 📁 utils
│   │           ├── 📁 validation
│   │           │   ├── 📄 auth.ts
│   │           │   └── 📄 ride.ts
│   │           └── 📄 helperfunctions.ts
│   ├── 📁 routes
│   │   └── 📄 route.ts
│   ├── 📁 scripts
│   │   └── 📄 seed.ts
│   ├── 📁 types
│   │   └── 📄 index.d.ts
│   ├── 📁 uploads
│   ├── 📁 utils
│   │   ├── 📁 validation
│   │   │   ├── 📄 auth.ts
│   │   │   └── 📄 validationResult.ts
│   │   └── 📄 client.ts
│   ├── 📄 app.ts
│   └── 📄 server.ts
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 prisma.config.ts
└── ⚙️ tsconfig.json
```