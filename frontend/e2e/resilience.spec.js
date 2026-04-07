import { expect, test } from '@playwright/test';
import { installCommonRoutes } from './support/journey-fixtures.js';

async function loginWithoutAutoAssert(page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@aprende.ai');
  await page.getByLabel('Senha').fill('admin123');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('sessão expirada no bootstrap redireciona para login com aviso visível', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('aprende_ai_token', 'token-expirado');
  });

  await installCommonRoutes(page, { unauthorizedOnAuthMe: true });

  await page.goto('/journey-map');

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible();
  await expect(page.getByText('Sua sessao expirou. Faca login novamente para continuar a jornada.')).toBeVisible();
});

test('dashboard de competências exibe erro quando a API falha', async ({ page }) => {
  await installCommonRoutes(page, { competencyRequestFails: true });

  await loginWithoutAutoAssert(page);
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/briefing/);

  await page.goto('/competency-dashboard');

  await expect(page).toHaveURL(/\/competency-dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard de competências' })).toBeVisible();
  await expect(page.getByText('Falha no dashboard de competências')).toBeVisible();
});

test('falha do runtime principal mantém a rota protegida e expõe erro visível', async ({ page }) => {
  await installCommonRoutes(page, { journeyRuntimeFails: true });

  await loginWithoutAutoAssert(page);

  await expect(page).toHaveURL(/\/campaign/);
  await expect(page.getByText('Falha ao carregar runtime da jornada.')).toBeVisible();
});

test('falha do runtime do journey-engine aparece no briefing sem derrubar a rota', async ({ page }) => {
  await installCommonRoutes(page, { engineRuntimeFails: true });

  await loginWithoutAutoAssert(page);

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/briefing/);
  await expect(page.getByText('Falha ao carregar o runtime do journey engine.')).toBeVisible();
  await expect(page.locator('h3').filter({ hasText: 'Lançamento de produto crítico' }).first()).toBeVisible();
});

test('falha ao iniciar fase atual aparece no briefing', async ({ page }) => {
  await installCommonRoutes(page, { startPhaseFails: true });

  await loginWithoutAutoAssert(page);

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/briefing/);
  await expect(page.getByText('Falha ao iniciar a fase atual.')).toBeVisible();
});

test('falha ao finalizar fase mantém resultado aberto e expõe erro', async ({ page }) => {
  await installCommonRoutes(page, { finalizeFails: true });

  await loginWithoutAutoAssert(page);
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/briefing/);

  await page.goto('/campaign/capitulo-1/phase-result');
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/phase-result/);
  await expect(page.getByText('Score da fase: 84')).toBeVisible();

  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/phase-result/);
  await expect(page.getByText('Falha ao finalizar a fase.')).toBeVisible();
});