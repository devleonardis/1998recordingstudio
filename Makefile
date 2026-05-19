.PHONY: install env init go start dev api web db-up db-down migrate seed api-sync

PNPM := npm exec --yes pnpm --

install:
	$(PNPM) install
	$(MAKE) api-sync

api-sync:
	cd apps/api && uv sync

env:
	@test -f apps/api/.env || cp apps/api/.env.example apps/api/.env
	@test -f apps/web/.env.local || cp apps/web/.env.example apps/web/.env.local

db-up:
	docker compose up -d postgres
	@echo "Waiting for postgres healthcheck..."
	@attempts=0; \
	until [ $$attempts -ge 60 ]; do \
		status=$$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' studio-postgres 2>/dev/null || true); \
		if [ "$$status" = "healthy" ] || [ "$$status" = "running" ]; then \
			echo "Postgres is $$status"; \
			break; \
		fi; \
		attempts=$$((attempts+1)); \
		sleep 1; \
	done; \
	if [ $$attempts -ge 60 ]; then \
		echo "Postgres did not become ready in time"; \
		docker compose logs postgres; \
		exit 1; \
	fi

db-down:
	docker compose down

migrate:
	$(MAKE) api-sync
	cd apps/api && uv run python -m alembic upgrade head

seed:
	$(MAKE) api-sync
	cd apps/api && uv run python -m app.seed

api:
	$(MAKE) api-sync
	cd apps/api && uv run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

web:
	$(PNPM) --filter web dev

init: install env

start: env db-up migrate seed
	( cd apps/api && uv run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 ) & $(PNPM) --filter web dev

go: init start

dev: start
