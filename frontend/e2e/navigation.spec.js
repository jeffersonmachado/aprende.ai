import { expect, test } from '@playwright/test';
import { installCommonRoutes, loginAsAdmin } from './support/journey-fixtures.js';

test('navegação autenticada expõe mapa da jornada e dashboard de competências', async ({ page }) => {
  await installCommonRoutes(page);
  await loginAsAdmin(page);

  await page.goto('/journey-map');
  await expect(page).toHaveURL(/\/journey-map/);
  await expect(page.getByRole('heading', { name: 'Mapa da jornada' })).toBeVisible();
  await expect(page.getByText('Capítulos e fases')).toBeVisible();
  await expect(page.getByText('Briefing · Missão · Consequência · Plot Twist · Reflexão · Resultado · Próximo passo')).toBeVisible();

  await page.goto('/competency-dashboard');
  await expect(page).toHaveURL(/\/competency-dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard de competências' })).toBeVisible();
  await expect(page.getByText('Leitura consolidada')).toBeVisible();
  await expect(page.locator('strong').filter({ hasText: 'Tomada de decisão' }).first()).toBeVisible();
  await expect(page.getByText('Repetir ciclos curtos com checagem explícita de trade-offs.')).toBeVisible();
  await expect(page.getByText('Competências observadas')).toBeVisible();
});

test('dashboard principal expõe resumo adaptativo e navega para a jornada adaptativa', async ({ page }) => {
  await installCommonRoutes(page);
  await loginAsAdmin(page);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Seu dashboard de aprendizagem' })).toBeVisible();
  await expect(page.getByText('Resumo da jornada adaptativa')).toBeVisible();
  await expect(page.getByText('Negociação adaptativa')).toBeVisible();

  await page.getByRole('link', { name: 'Abrir jornada adaptativa' }).click();

  await expect(page).toHaveURL(/\/adaptive-journey/);
  await expect(page.getByText('Jornada adaptativa oficial')).toBeVisible();
  await expect(page.getByText('Capítulo de negociação consultiva')).toBeVisible();
});