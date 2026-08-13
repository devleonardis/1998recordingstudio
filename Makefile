.PHONY: install env web dev

PNPM := npm exec --yes pnpm --

install:
	$(PNPM) install

env:
	@test -f apps/web/.env.local || cp apps/web/.env.example apps/web/.env.local

web:
	$(PNPM) --filter web dev

dev: web
