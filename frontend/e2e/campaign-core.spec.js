import { expect, test } from '@playwright/test';
import {
  buildDecisionOutcomes,
  buildJourneyRuntime,
  campaignChapters,
  campaignChaptersWithExpansion,
  campaignChaptersWithScale,
  campaignChaptersWithUnlock,
  installCommonRoutes,
  loginAsAdmin
} from './support/journey-fixtures.js';

function buildNoTwistChapters() {
  const chapters = JSON.parse(JSON.stringify(campaignChapters));
  chapters[0].phases[1].content.mission.choices.push({
    id: 'choice-3',
    label: 'Executar piloto controlado com checklist de mitigação',
    impact: 'Controla risco, preserva previsibilidade e evita ruptura adicional.'
  });
  return chapters;
}

function buildChapterThreeNoTwistChapters() {
  const chapters = JSON.parse(JSON.stringify(campaignChaptersWithUnlock));
  chapters[2].phases[1].content.mission.choices.push({
    id: 'choice-33',
    label: 'Sincronizar parceiros em checkpoint curto antes do posicionamento público',
    impact: 'Preserva coordenação, reduz ruído externo e evita ruptura desnecessária.'
  });
  return chapters;
}

function buildChapterFourNoTwistChapters() {
  const chapters = JSON.parse(JSON.stringify(campaignChaptersWithExpansion));
  chapters[3].phases[1].content.mission.choices.push({
    id: 'choice-43',
    label: 'Publicar checkpoint enxuto com compromissos verificáveis antes de ampliar a narrativa',
    impact: 'Sustenta previsibilidade, evita sobrepromessa e preserva espaço de ajuste sem ativar nova ruptura.'
  });
  return chapters;
}

function buildChapterFiveNoTwistChapters() {
  const chapters = JSON.parse(JSON.stringify(campaignChaptersWithScale));
  chapters[4].phases[1].content.mission.choices.push({
    id: 'choice-53',
    label: 'Expandir a escala com checkpoints auditáveis por onda antes da institucionalização total',
    impact: 'Mantém a consistência sob controle, reduz sobrecarga institucional e evita ruptura adicional durante a expansão.'
  });
  return chapters;
}

function buildChapterFourStartProgress() {
  return {
    chapterId: 'capitulo-3',
    phaseId: 'progression',
    unlockedChapterIds: ['capitulo-1', 'capitulo-2', 'capitulo-3'],
    completedPhaseKeys: [
      'capitulo-1:briefing',
      'capitulo-1:mission',
      'capitulo-1:consequence',
      'capitulo-1:plot-twist',
      'capitulo-1:reflection',
      'capitulo-1:phase-result',
      'capitulo-1:progression',
      'capitulo-2:briefing',
      'capitulo-2:mission',
      'capitulo-2:consequence',
      'capitulo-2:plot-twist',
      'capitulo-2:reflection',
      'capitulo-2:phase-result',
      'capitulo-2:progression',
      'capitulo-3:briefing',
      'capitulo-3:mission',
      'capitulo-3:consequence',
      'capitulo-3:plot-twist',
      'capitulo-3:reflection',
      'capitulo-3:phase-result'
    ],
    visitedPhaseKeys: [
      'capitulo-1:briefing',
      'capitulo-1:mission',
      'capitulo-1:consequence',
      'capitulo-1:plot-twist',
      'capitulo-1:reflection',
      'capitulo-1:phase-result',
      'capitulo-1:progression',
      'capitulo-2:briefing',
      'capitulo-2:mission',
      'capitulo-2:consequence',
      'capitulo-2:plot-twist',
      'capitulo-2:reflection',
      'capitulo-2:phase-result',
      'capitulo-2:progression',
      'capitulo-3:briefing',
      'capitulo-3:mission',
      'capitulo-3:consequence',
      'capitulo-3:plot-twist',
      'capitulo-3:reflection',
      'capitulo-3:phase-result',
      'capitulo-3:progression'
    ],
    totalPhases: 28,
    totalChapters: 4
  };
}

function buildChapterFiveStartProgress() {
  return {
    chapterId: 'capitulo-4',
    phaseId: 'progression',
    unlockedChapterIds: ['capitulo-1', 'capitulo-2', 'capitulo-3', 'capitulo-4'],
    completedPhaseKeys: [
      'capitulo-1:briefing',
      'capitulo-1:mission',
      'capitulo-1:consequence',
      'capitulo-1:plot-twist',
      'capitulo-1:reflection',
      'capitulo-1:phase-result',
      'capitulo-1:progression',
      'capitulo-2:briefing',
      'capitulo-2:mission',
      'capitulo-2:consequence',
      'capitulo-2:plot-twist',
      'capitulo-2:reflection',
      'capitulo-2:phase-result',
      'capitulo-2:progression',
      'capitulo-3:briefing',
      'capitulo-3:mission',
      'capitulo-3:consequence',
      'capitulo-3:plot-twist',
      'capitulo-3:reflection',
      'capitulo-3:phase-result',
      'capitulo-3:progression',
      'capitulo-4:briefing',
      'capitulo-4:mission',
      'capitulo-4:consequence',
      'capitulo-4:plot-twist',
      'capitulo-4:reflection',
      'capitulo-4:phase-result'
    ],
    visitedPhaseKeys: [
      'capitulo-1:briefing',
      'capitulo-1:mission',
      'capitulo-1:consequence',
      'capitulo-1:plot-twist',
      'capitulo-1:reflection',
      'capitulo-1:phase-result',
      'capitulo-1:progression',
      'capitulo-2:briefing',
      'capitulo-2:mission',
      'capitulo-2:consequence',
      'capitulo-2:plot-twist',
      'capitulo-2:reflection',
      'capitulo-2:phase-result',
      'capitulo-2:progression',
      'capitulo-3:briefing',
      'capitulo-3:mission',
      'capitulo-3:consequence',
      'capitulo-3:plot-twist',
      'capitulo-3:reflection',
      'capitulo-3:phase-result',
      'capitulo-3:progression',
      'capitulo-4:briefing',
      'capitulo-4:mission',
      'capitulo-4:consequence',
      'capitulo-4:plot-twist',
      'capitulo-4:reflection',
      'capitulo-4:phase-result',
      'capitulo-4:progression'
    ],
    totalPhases: 35,
    totalChapters: 5
  };
}

test('fluxo principal da campanha percorre as fases explícitas', async ({ page }) => {
  await installCommonRoutes(page);
  await loginAsAdmin(page);

  await expect(page.locator('h3').filter({ hasText: 'Lançamento de produto crítico' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/mission/);
  await expect(page.getByText('Painel central de decisão')).toBeVisible();

  await page.getByRole('button', { name: 'Segmentar rollout e alinhar expectativa' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/consequence/);
  await expect(page.getByText('A decisão reduziu risco imediato e preservou confiança executiva.')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/plot-twist/);
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/reflection/);
  await page.getByRole('textbox').fill('Aprendi a reduzir risco antes de ampliar escopo.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/phase-result/);
  await expect(page.getByText('Score da fase: 84')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/progression/);
  await expect(page.getByText('Refinar comunicação executiva')).toBeVisible();
  await expect(page.getByText('badge-stakeholder-sync')).toBeVisible();
});

test('fluxo alternativo expõe consequência e twist de maior risco para uma decisão agressiva', async ({ page }) => {
  await installCommonRoutes(page);
  await loginAsAdmin(page);

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/mission/);

  await page.getByRole('button', { name: 'Forçar lançamento total hoje' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Forçar lançamento total hoje')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 58')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/consequence/);
  await expect(page.getByText('A decisão acelerou a entrega, mas elevou a pressão operacional e desgastou a reputação do rollout.')).toBeVisible();
  await expect(page.getByText('+13')).toBeVisible();
  await expect(page.getByText('+9')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/plot-twist/);
  await expect(page.getByText('Operação entra em contenção')).toBeVisible();
  await expect(page.getByText('A operação entrou em contenção após o lançamento integral e exigiu resposta imediata.')).toBeVisible();
  await expect(page.getByText('Redefinir escopo de estabilização e explicitar o plano de mitigação.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/reflection/);
  await page.getByRole('textbox').fill('Percebi que aceleração sem mitigação explícita amplia risco e cobra confiança do time.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/phase-result/);
  await expect(page.getByText('Score da fase: 58')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/progression/);
  await expect(page.getByText('Reforçar leitura de risco operacional')).toBeVisible();
  await expect(page.getByText('Reduza pressão e recupere confiança antes de buscar novo ganho de velocidade.')).toBeVisible();
});

test('fase de plot twist segue neutra quando a decisão não dispara ruptura ativa', async ({ page }) => {
  const chapters = buildNoTwistChapters();
  const decisionOutcomes = {
    ...buildDecisionOutcomes(),
    'choice-3': {
      decision: {
        id: 'decision-choice-3',
        label: 'Executar piloto controlado com checklist de mitigação',
        qualityScore: 73
      },
      consequence: {
        narrative: 'A decisão controlou o rollout, manteve previsibilidade e evitou escalada desnecessária de tensão.',
        delta: { stakeholder_trust: 4, execution_risk: -3, time_pressure: -2 },
        worldAfter: {
          tension_level: 50,
          stakeholder_trust: 72,
          budget: 61,
          morale: 66,
          time_pressure: 72,
          learning_confidence: 61,
          team_alignment: 69,
          market_perception: 60,
          execution_risk: 45
        }
      },
      runtime: {
        activePhaseId: 'consequence',
        latestDecision: {
          id: 'decision-choice-3',
          label: 'Executar piloto controlado com checklist de mitigação',
          qualityScore: 73
        },
        latestConsequence: {
          narrative: 'A decisão controlou o rollout, manteve previsibilidade e evitou escalada desnecessária de tensão.',
          delta: { stakeholder_trust: 4, execution_risk: -3, time_pressure: -2 },
          worldAfter: {
            tension_level: 50,
            stakeholder_trust: 72,
            budget: 61,
            morale: 66,
            time_pressure: 72,
            learning_confidence: 61,
            team_alignment: 69,
            market_perception: 60,
            execution_risk: 45
          }
        },
        latestTwist: null,
        result: {
          phaseScore: 73,
          mastery: 69,
          xpAwarded: 29,
          badgeSummary: 'Sem nova badge nesta rodada.'
        },
        progression: {
          nextFocus: 'Consolidar mitigação antes de escalar',
          recommendation: 'Mantenha o ritmo controlado e documente os sinais que autorizam a próxima expansão.'
        }
      }
    }
  };

  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({ chapters }),
    decisionOutcomes
  });
  await loginAsAdmin(page);

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/mission/);

  await page.getByRole('button', { name: 'Executar piloto controlado com checklist de mitigação' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Executar piloto controlado com checklist de mitigação')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 73')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/consequence/);
  await expect(page.getByText('A decisão controlou o rollout, manteve previsibilidade e evitou escalada desnecessária de tensão.')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/plot-twist/);
  await expect(page.getByText('Sem twist ativo neste momento')).toBeVisible();
  await expect(page.getByText('Status:')).toBeVisible();
  await expect(page.getByText('idle')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/reflection/);
  await page.getByRole('textbox').fill('O piloto mostrou que controlar escopo e mitigar cedo evita ruptura desnecessária.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/phase-result/);
  await expect(page.getByText('Score da fase: 73')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-1\/progression/);
  await expect(page.getByText('Consolidar mitigação antes de escalar')).toBeVisible();
  await expect(page.getByText('Mantenha o ritmo controlado e documente os sinais que autorizam a próxima expansão.')).toBeVisible();
});

test('progressão desbloqueia o próximo capítulo e navega para o briefing seguinte', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-1',
        phaseId: 'briefing',
        unlockedChapterIds: ['capitulo-1'],
        completedPhaseKeys: [],
        visitedPhaseKeys: ['capitulo-1:briefing'],
        totalPhases: 7,
        totalChapters: 2
      }
    })
  });

  await loginAsAdmin(page);
  await page.goto('/campaign/capitulo-1/progression');

  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/briefing/);
  await expect(page.locator('h3').filter({ hasText: 'Comitê executivo em alerta' }).first()).toBeVisible();
  await expect(page.getByText(/capítulos\s*2\s*\/\s*3/i)).toBeVisible();
});

test('segundo capítulo expõe briefing e decisão própria com feedback executivo específico', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'briefing',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing'
        ],
        totalPhases: 7,
        totalChapters: 2
      }
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/briefing/);
  await page.goto('/campaign/capitulo-2/briefing');

  await expect(page.locator('h3').filter({ hasText: 'Comitê executivo em alerta' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/mission/);
  await expect(page.getByText('Resposta executiva coordenada')).toBeVisible();
  await page.getByRole('button', { name: 'Centralizar narrativa com comitê reduzido' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Centralizar narrativa com comitê reduzido')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 87')).toBeVisible();
});

test('segundo capítulo percorre consequência, twist, reflexão, resultado e progressão', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'briefing',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing'
        ],
        totalPhases: 7,
        totalChapters: 2
      }
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/briefing/);
  await page.goto('/campaign/capitulo-2/briefing');

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/mission/);

  await page.getByRole('button', { name: 'Centralizar narrativa com comitê reduzido' }).click();
  await expect(page.getByText('Score de qualidade: 87')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/consequence/);
  await expect(page.getByText('A decisão concentrou a comunicação executiva, elevou alinhamento e reduziu dispersão política.')).toBeVisible();
  await expect(page.getByText('+9')).toBeVisible();
  await expect(page.getByText('+8')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/plot-twist/);
  await expect(page.getByText('Conselho pede narrativa única em 30 minutos')).toBeVisible();
  await expect(page.getByText('Sintetizar a mensagem central e assumir os limites da decisão diante do conselho.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que alinhamento executivo perde força quando a narrativa não explicita limites e trade-offs.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/phase-result/);
  await expect(page.getByText('Score da fase: 87')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/progression/);
  await expect(page.getByText('Consolidar comunicação executiva em ambientes de alta pressão')).toBeVisible();
  await expect(page.getByText('Mantenha a narrativa unificada e amplie repertório para checkpoints ainda mais curtos.')).toBeVisible();
  await expect(page.getByText('badge-executive-alignment')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
});

test('segundo capítulo cobre o fechamento alternativo com narrativa fragmentada e ruído político', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'briefing',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing'
        ],
        totalPhases: 7,
        totalChapters: 2
      }
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/briefing/);
  await page.goto('/campaign/capitulo-2/briefing');

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/mission/);

  await page.getByRole('button', { name: 'Distribuir porta-vozes sem narrativa única' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Distribuir porta-vozes sem narrativa única')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 54')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/consequence/);
  await expect(page.getByText('A decisão acelerou a exposição externa, mas fragmentou a mensagem e aumentou ruído político.')).toBeVisible();
  await expect(page.getByText('+11')).toBeVisible();
  await expect(page.getByText('-8')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/plot-twist/);
  await expect(page.getByText('Dissonância pública entre áreas')).toBeVisible();
  await expect(page.getByText('Reunificar a mensagem e redistribuir papéis antes do próximo contato externo.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/reflection/);
  await page.getByRole('textbox').fill('Percebi que velocidade sem coerência narrativa gera ruído político e dificulta coordenação executiva.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/phase-result/);
  await expect(page.getByText('Score da fase: 54')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-2\/progression/);
  await expect(page.getByText('Recuperar coerência narrativa entre áreas')).toBeVisible();
  await expect(page.getByText('Reduza a fragmentação e volte a explicitar uma linha única de comunicação.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
});

test('progressão do segundo capítulo desbloqueia o terceiro e conclui o fechamento multi-capítulo', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'progression',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result',
          'capitulo-2:progression'
        ],
        totalPhases: 21,
        totalChapters: 3
      }
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/progression/);
  await page.goto('/campaign/capitulo-2/progression');

  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/briefing/);
  await expect(page.locator('h3').filter({ hasText: 'Ecossistema externo pressiona resposta coordenada' }).first()).toBeVisible();
  await expect(page.getByText(/capítulos\s*3\s*\/\s*3/i)).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/mission/);
  await expect(page.getByText('Coordenação de crise com parceiros estratégicos')).toBeVisible();

  await page.getByRole('button', { name: 'Criar war room com mensagem única e checkpoints curtos' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Criar war room com mensagem única e checkpoints curtos')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 91')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/consequence/);
  await expect(page.getByText('A decisão alinhou liderança, parceiros e operação em uma cadência única, reduzindo ruído e fortalecendo governança.')).toBeVisible();
  await expect(page.getByText('+10')).toBeVisible();
  await expect(page.getByText('+8')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/plot-twist/);
  await expect(page.getByText('Parceiro exige pronunciamento conjunto imediato')).toBeVisible();
  await expect(page.getByText('Consolidar os limites da resposta e alinhar portavozes em um único roteiro executivo.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que coordenação transversal precisa de cadência única, narrativa explícita e governança visível sob pressão externa.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/phase-result/);
  await expect(page.getByText('Score da fase: 91')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/progression/);
  await expect(page.getByText('Consolidar governança contínua entre liderança e parceiros')).toBeVisible();
  await expect(page.getByText('Transforme a cadência de crise em ritual de governança para preservar alinhamento no pós-incidente.')).toBeVisible();
  await expect(page.getByText('badge-crisis-orchestrator')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 3 cobre a variante negativa com desalinhamento entre parceiros até o encerramento', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithUnlock,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'progression',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result',
          'capitulo-2:progression'
        ],
        totalPhases: 21,
        totalChapters: 3
      }
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/progression/);
  await page.goto('/campaign/capitulo-2/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/mission/);
  await page.getByRole('button', { name: 'Responder por frentes separadas com autonomia local' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Responder por frentes separadas com autonomia local')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 57')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/consequence/);
  await expect(page.getByText('A resposta distribuiu autonomia rapidamente, mas gerou inconsistências externas e ampliou a fricção entre parceiros.')).toBeVisible();
  await expect(page.getByText('+12')).toBeVisible();
  await expect(page.getByText('-6')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/plot-twist/);
  await expect(page.getByText('Parceiros divergem em público sobre a estratégia')).toBeVisible();
  await expect(page.getByText('Recentralizar a coordenação, explicitar papéis e suspender falas paralelas até nova convergência.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que autonomia sem coordenação explícita amplifica inconsistência externa e fragiliza confiança entre parceiros.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/phase-result/);
  await expect(page.getByText('Score da fase: 57')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/progression/);
  await expect(page.getByText('Restabelecer comando único com parceiros externos')).toBeVisible();
  await expect(page.getByText('Recupere alinhamento antes de ampliar autonomia para evitar escalada de inconsistência pública.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 3 segue neutro quando a coordenação evita ruptura ativa entre parceiros', async ({ page }) => {
  const chapters = buildChapterThreeNoTwistChapters();
  const decisionOutcomes = {
    ...buildDecisionOutcomes(),
    'choice-33': {
      decision: {
        id: 'decision-choice-33',
        label: 'Sincronizar parceiros em checkpoint curto antes do posicionamento público',
        qualityScore: 79
      },
      consequence: {
        narrative: 'A decisão sincronizou parceiros críticos, preservou clareza externa e evitou escalada prematura de tensão.',
        delta: { stakeholder_trust: 6, team_alignment: 7, execution_risk: -4 },
        worldAfter: {
          tension_level: 47,
          stakeholder_trust: 75,
          budget: 61,
          morale: 68,
          time_pressure: 69,
          learning_confidence: 66,
          team_alignment: 80,
          market_perception: 66,
          execution_risk: 44
        }
      },
      runtime: {
        activePhaseId: 'consequence',
        latestDecision: {
          id: 'decision-choice-33',
          label: 'Sincronizar parceiros em checkpoint curto antes do posicionamento público',
          qualityScore: 79
        },
        latestConsequence: {
          narrative: 'A decisão sincronizou parceiros críticos, preservou clareza externa e evitou escalada prematura de tensão.',
          delta: { stakeholder_trust: 6, team_alignment: 7, execution_risk: -4 },
          worldAfter: {
            tension_level: 47,
            stakeholder_trust: 75,
            budget: 61,
            morale: 68,
            time_pressure: 69,
            learning_confidence: 66,
            team_alignment: 80,
            market_perception: 66,
            execution_risk: 44
          }
        },
        latestTwist: null,
        result: {
          phaseScore: 79,
          mastery: 74,
          xpAwarded: 31,
          badgeSummary: 'Sem nova badge nesta rodada.'
        },
        progression: {
          nextFocus: 'Consolidar checkpoints de alinhamento entre parceiros',
          recommendation: 'Mantenha a cadência curta de alinhamento e formalize gatilhos antes de ampliar exposição externa.'
        }
      }
    }
  };

  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters,
      campaignProgress: {
        chapterId: 'capitulo-2',
        phaseId: 'progression',
        unlockedChapterIds: ['capitulo-1', 'capitulo-2'],
        completedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result'
        ],
        visitedPhaseKeys: [
          'capitulo-1:briefing',
          'capitulo-1:mission',
          'capitulo-1:consequence',
          'capitulo-1:plot-twist',
          'capitulo-1:reflection',
          'capitulo-1:phase-result',
          'capitulo-1:progression',
          'capitulo-2:briefing',
          'capitulo-2:mission',
          'capitulo-2:consequence',
          'capitulo-2:plot-twist',
          'capitulo-2:reflection',
          'capitulo-2:phase-result',
          'capitulo-2:progression'
        ],
        totalPhases: 21,
        totalChapters: 3
      }
    }),
    decisionOutcomes
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-2\/progression/);
  await page.goto('/campaign/capitulo-2/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/mission/);
  await page.getByRole('button', { name: 'Sincronizar parceiros em checkpoint curto antes do posicionamento público' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Sincronizar parceiros em checkpoint curto antes do posicionamento público')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 79')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/consequence/);
  await expect(page.getByText('A decisão sincronizou parceiros críticos, preservou clareza externa e evitou escalada prematura de tensão.')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/plot-twist/);
  await expect(page.getByText('Sem twist ativo neste momento')).toBeVisible();
  await expect(page.getByText('idle')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/reflection/);
  await page.getByRole('textbox').fill('Percebi que checkpoints curtos e alinhamento explícito entre parceiros reduzem ruído sem exigir escalada adicional.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/phase-result/);
  await expect(page.getByText('Score da fase: 79')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-3\/progression/);
  await expect(page.getByText('Consolidar checkpoints de alinhamento entre parceiros')).toBeVisible();
  await expect(page.getByText('Mantenha a cadência curta de alinhamento e formalize gatilhos antes de ampliar exposição externa.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 3 desbloqueia o quarto capítulo e inicia recuperação de mercado com governança própria', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithExpansion,
      campaignProgress: buildChapterFourStartProgress()
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-3\/progression/);
  await page.goto('/campaign/capitulo-3/progression');

  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/briefing/);
  await expect(page.locator('h3').filter({ hasText: 'Mercado exige prova de consistência após a crise' }).first()).toBeVisible();
  await expect(page.getByText(/capítulos\s*4\s*\/\s*4/i)).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/mission/);
  await expect(page.getByText('Institucionalizar governança com sinais públicos de consistência')).toBeVisible();

  await page.getByRole('button', { name: 'Publicar marcos de governança com cadência executiva e indicadores compartilhados' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Publicar marcos de governança com cadência executiva e indicadores compartilhados')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 89')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/consequence/);
  await expect(page.getByText('A decisão transformou a recuperação em rotina observável, elevando previsibilidade e confiança de mercado sem reabrir tensão interna.')).toBeVisible();
  await expect(page.getByText('+10')).toBeVisible();
  await expect(page.getByText('-6')).toBeVisible();
});

test('capítulo 4 cobre fechamento negativo quando a retomada pública supera a disciplina operacional', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithExpansion,
      campaignProgress: buildChapterFourStartProgress()
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-3\/progression/);
  await page.goto('/campaign/capitulo-3/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/mission/);
  await page.getByRole('button', { name: 'Comunicar retomada ampla sem ritual operacional estável' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Comunicar retomada ampla sem ritual operacional estável')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 55')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/consequence/);
  await expect(page.getByText('A narrativa de retomada ganhou velocidade, mas ficou sem lastro operacional suficiente e reacendeu dúvidas sobre consistência.')).toBeVisible();
  await expect(page.getByText('+10')).toBeVisible();
  await expect(page.getByText('-5')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/plot-twist/);
  await expect(page.getByText('Mercado questiona a sustentação da retomada')).toBeVisible();
  await expect(page.getByText('Reduzir a promessa pública e reconstruir a base operacional antes de ampliar a exposição.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que a narrativa de recuperação sem prova operacional reabre escrutínio e enfraquece a confiança que o capítulo anterior construiu.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/phase-result/);
  await expect(page.getByText('Score da fase: 55')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/progression/);
  await expect(page.getByText('Reconstruir prova operacional antes de ampliar narrativa externa')).toBeVisible();
  await expect(page.getByText('Reforce a cadência interna e recupere evidências de consistência antes de prometer escala ao mercado.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 4 segue neutro quando a recuperação prioriza checkpoints verificáveis sem sobrepromessa', async ({ page }) => {
  const chapters = buildChapterFourNoTwistChapters();
  const decisionOutcomes = {
    ...buildDecisionOutcomes(),
    'choice-43': {
      decision: {
        id: 'decision-choice-43',
        label: 'Publicar checkpoint enxuto com compromissos verificáveis antes de ampliar a narrativa',
        qualityScore: 77
      },
      consequence: {
        narrative: 'A decisão manteve o mercado informado com compromissos verificáveis, preservando previsibilidade sem elevar a pressão por promessas amplas.',
        delta: { stakeholder_trust: 5, market_perception: 6, execution_risk: -3, team_alignment: 4 },
        worldAfter: {
          tension_level: 45,
          stakeholder_trust: 79,
          budget: 61,
          morale: 70,
          time_pressure: 67,
          learning_confidence: 68,
          team_alignment: 82,
          market_perception: 71,
          execution_risk: 41
        }
      },
      runtime: {
        activePhaseId: 'consequence',
        latestDecision: {
          id: 'decision-choice-43',
          label: 'Publicar checkpoint enxuto com compromissos verificáveis antes de ampliar a narrativa',
          qualityScore: 77
        },
        latestConsequence: {
          narrative: 'A decisão manteve o mercado informado com compromissos verificáveis, preservando previsibilidade sem elevar a pressão por promessas amplas.',
          delta: { stakeholder_trust: 5, market_perception: 6, execution_risk: -3, team_alignment: 4 },
          worldAfter: {
            tension_level: 45,
            stakeholder_trust: 79,
            budget: 61,
            morale: 70,
            time_pressure: 67,
            learning_confidence: 68,
            team_alignment: 82,
            market_perception: 71,
            execution_risk: 41
          }
        },
        latestTwist: null,
        result: {
          phaseScore: 77,
          mastery: 73,
          xpAwarded: 30,
          badgeSummary: 'Sem nova badge nesta rodada.'
        },
        progression: {
          nextFocus: 'Expandir transparência com cadência verificável',
          recommendation: 'Sustente checkpoints pequenos, com compromisso mensurável, antes de ampliar a narrativa de recuperação para todo o mercado.'
        }
      }
    }
  };

  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters,
      campaignProgress: buildChapterFourStartProgress()
    }),
    decisionOutcomes
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-3\/progression/);
  await page.goto('/campaign/capitulo-3/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/mission/);
  await page.getByRole('button', { name: 'Publicar checkpoint enxuto com compromissos verificáveis antes de ampliar a narrativa' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Publicar checkpoint enxuto com compromissos verificáveis antes de ampliar a narrativa')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 77')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/consequence/);
  await expect(page.getByText('A decisão manteve o mercado informado com compromissos verificáveis, preservando previsibilidade sem elevar a pressão por promessas amplas.')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/plot-twist/);
  await expect(page.getByText('Sem twist ativo neste momento')).toBeVisible();
  await expect(page.getByText('idle')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/reflection/);
  await page.getByRole('textbox').fill('Percebi que transparência progressiva com compromissos verificáveis preserva confiança sem reabrir pressão desnecessária.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/phase-result/);
  await expect(page.getByText('Score da fase: 77')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-4\/progression/);
  await expect(page.getByText('Expandir transparência com cadência verificável')).toBeVisible();
  await expect(page.getByText('Sustente checkpoints pequenos, com compromisso mensurável, antes de ampliar a narrativa de recuperação para todo o mercado.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 4 desbloqueia o quinto capítulo e conclui a escala institucional com fechamento completo', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithScale,
      campaignProgress: buildChapterFiveStartProgress()
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-4\/progression/);
  await page.goto('/campaign/capitulo-4/progression');

  await expect(page.getByRole('button', { name: 'Desbloquear próximo capítulo' })).toBeVisible();
  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/briefing/);
  await expect(page.locator('h3').filter({ hasText: 'Ecossistema cobra consistência em escala institucional' }).first()).toBeVisible();
  await expect(page.getByText(/capítulos\s*5\s*\/\s*5/i)).toBeVisible();

  await page.getByRole('button', { name: 'Iniciar missão' }).click();
  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/mission/);
  await expect(page.getByText('Escalar rituais de governança para toda a rede crítica')).toBeVisible();

  await page.getByRole('button', { name: 'Orquestrar rituais integrados com métricas comuns e revisão executiva cruzada' }).click();
  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Orquestrar rituais integrados com métricas comuns e revisão executiva cruzada')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 93')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/consequence/);
  await expect(page.getByText('A decisão escalou a governança com disciplina comum entre frentes, consolidando confiança institucional e reduzindo assimetrias de execução.')).toBeVisible();
  await expect(page.getByText('+11')).toBeVisible();
  await expect(page.getByText('-8')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/plot-twist/);
  await expect(page.getByText('Parceiro-chave antecipa auditoria conjunta da nova cadência institucional')).toBeVisible();
  await expect(page.getByText('Conectar métricas, responsabilização e trilhas de decisão em um ritual comum auditável por toda a rede crítica.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que a escala institucional só permanece confiável quando métricas, revisão executiva e execução distribuída operam no mesmo ritual auditável.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/phase-result/);
  await expect(page.getByText('Score da fase: 93')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/progression/);
  await expect(page.getByText('Preservar resiliência institucional com auditoria contínua da governança')).toBeVisible();
  await expect(page.getByText('Congele o aprendizado em rituais auditáveis e mantenha revisão cruzada para evitar regressão de consistência na escala.')).toBeVisible();
  await expect(page.getByText('badge-systemic-leadership')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 5 cobre fechamento negativo quando a escala amplia autonomia sem revisão institucional comum', async ({ page }) => {
  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters: campaignChaptersWithScale,
      campaignProgress: buildChapterFiveStartProgress()
    })
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-4\/progression/);
  await page.goto('/campaign/capitulo-4/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/mission/);
  await page.getByRole('button', { name: 'Expandir autonomia de escala sem revisão institucional compartilhada' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Expandir autonomia de escala sem revisão institucional compartilhada')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 56')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/consequence/);
  await expect(page.getByText('A escala avançou rápido, mas sem revisão institucional comum surgiram assimetrias de execução e sinais de fragilidade sistêmica.')).toBeVisible();
  await expect(page.getByText('+11')).toBeVisible();
  await expect(page.getByText('-6')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/plot-twist/);
  await expect(page.getByText('A rede expõe critérios divergentes de governança em plena expansão')).toBeVisible();
  await expect(page.getByText('Suspender a expansão assimétrica e recentralizar a cadência crítica antes de retomar escala.')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/reflection/);
  await page.getByRole('textbox').fill('Aprendi que expansão institucional sem revisão comum devolve assimetria ao sistema e enfraquece a coerência construída nos capítulos anteriores.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/phase-result/);
  await expect(page.getByText('Score da fase: 56')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/progression/);
  await expect(page.getByText('Reunificar revisão institucional antes de ampliar escala')).toBeVisible();
  await expect(page.getByText('Retome a revisão cruzada e reduza assimetria decisória antes de expandir a governança para toda a rede.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});

test('capítulo 5 segue neutro quando a escala avança por ondas auditáveis sem ruptura sistêmica', async ({ page }) => {
  const chapters = buildChapterFiveNoTwistChapters();
  const decisionOutcomes = {
    ...buildDecisionOutcomes(),
    'choice-53': {
      decision: {
        id: 'decision-choice-53',
        label: 'Expandir a escala com checkpoints auditáveis por onda antes da institucionalização total',
        qualityScore: 81
      },
      consequence: {
        narrative: 'A decisão escalou a governança em ondas controladas, preservando coerência institucional e evitando sobrecarga de coordenação.',
        delta: { stakeholder_trust: 6, market_perception: 7, execution_risk: -4, team_alignment: 5 },
        worldAfter: {
          tension_level: 43,
          stakeholder_trust: 82,
          budget: 61,
          morale: 72,
          time_pressure: 65,
          learning_confidence: 70,
          team_alignment: 84,
          market_perception: 75,
          execution_risk: 39
        }
      },
      runtime: {
        activePhaseId: 'consequence',
        latestDecision: {
          id: 'decision-choice-53',
          label: 'Expandir a escala com checkpoints auditáveis por onda antes da institucionalização total',
          qualityScore: 81
        },
        latestConsequence: {
          narrative: 'A decisão escalou a governança em ondas controladas, preservando coerência institucional e evitando sobrecarga de coordenação.',
          delta: { stakeholder_trust: 6, market_perception: 7, execution_risk: -4, team_alignment: 5 },
          worldAfter: {
            tension_level: 43,
            stakeholder_trust: 82,
            budget: 61,
            morale: 72,
            time_pressure: 65,
            learning_confidence: 70,
            team_alignment: 84,
            market_perception: 75,
            execution_risk: 39
          }
        },
        latestTwist: null,
        result: {
          phaseScore: 81,
          mastery: 76,
          xpAwarded: 33,
          badgeSummary: 'Sem nova badge nesta rodada.'
        },
        progression: {
          nextFocus: 'Ampliar escala com cadência auditável por ondas',
          recommendation: 'Mantenha a institucionalização em ondas curtas, com checkpoints auditáveis, antes de consolidar a escala total da rede.'
        }
      }
    }
  };

  await installCommonRoutes(page, {
    journeyRuntime: buildJourneyRuntime({
      chapters,
      campaignProgress: buildChapterFiveStartProgress()
    }),
    decisionOutcomes
  });

  await loginAsAdmin(page, /\/campaign\/capitulo-4\/progression/);
  await page.goto('/campaign/capitulo-4/progression');

  await page.getByRole('button', { name: 'Desbloquear próximo capítulo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/briefing/);
  await page.getByRole('button', { name: 'Iniciar missão' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/mission/);
  await page.getByRole('button', { name: 'Expandir a escala com checkpoints auditáveis por onda antes da institucionalização total' }).click();

  await expect(page.getByText('Decisão registrada')).toBeVisible();
  await expect(page.locator('.campaign-feedback-callout').getByText('Expandir a escala com checkpoints auditáveis por onda antes da institucionalização total')).toBeVisible();
  await expect(page.getByText('Score de qualidade: 81')).toBeVisible();
  await page.getByRole('button', { name: 'Ver consequência' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/consequence/);
  await expect(page.getByText('A decisão escalou a governança em ondas controladas, preservando coerência institucional e evitando sobrecarga de coordenação.')).toBeVisible();
  await page.getByRole('button', { name: 'Seguir' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/plot-twist/);
  await expect(page.getByText('Sem twist ativo neste momento')).toBeVisible();
  await expect(page.getByText('idle')).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/reflection/);
  await page.getByRole('textbox').fill('Percebi que institucionalizar por ondas auditáveis preserva coerência e reduz a chance de ruptura sistêmica durante a escala.');
  await page.getByRole('button', { name: 'Abrir resultado' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/phase-result/);
  await expect(page.getByText('Score da fase: 81')).toBeVisible();
  await page.getByRole('button', { name: 'Ver próximo passo' }).click();

  await expect(page).toHaveURL(/\/campaign\/capitulo-5\/progression/);
  await expect(page.getByText('Ampliar escala com cadência auditável por ondas')).toBeVisible();
  await expect(page.getByText('Mantenha a institucionalização em ondas curtas, com checkpoints auditáveis, antes de consolidar a escala total da rede.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir campanha' })).toBeVisible();
});