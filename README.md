# 1998 Recording Studio

Setup super semplificato.

## Avvio in 1 comando (prima volta)
Dalla root del progetto:

```bash
make go
```

`make go` fa tutto:
- installa dipendenze (`pnpm` + `uv`)
- crea i file `.env` mancanti
- avvia Postgres
- esegue migrazioni
- esegue seed admin
- avvia API + frontend

## Avvio rapido (dalla seconda volta)
```bash
make start
```

## Stop servizi Docker
```bash
make db-down
```

## URL utili
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## Admin di default
- Email: `admin@1998studio.it`
- Password: `admin123`
