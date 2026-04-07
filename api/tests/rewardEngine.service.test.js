import { buildRewardPackage } from '../modules/journey-engine/reward-engine.service.js';

describe('reward-engine.service', () => {
  test('garante xp mínimo mesmo com momentum baixo', () => {
    const result = buildRewardPackage({
      worldDelta: { stakeholder_trust: -3 },
      mastery: 0,
      phaseId: 'mission'
    });

    expect(result.xpAwarded).toBe(8);
    expect(result.badges).toEqual([]);
  });

  test('concede badges de mastery e stabilizer quando os limiares são atendidos', () => {
    const result = buildRewardPackage({
      worldDelta: { stakeholder_trust: 12, morale: 10, execution_risk: -4 },
      mastery: 74,
      phaseId: 'mission'
    });

    expect(result.badges).toEqual(expect.arrayContaining(['mastery_pulse', 'world_stabilizer']));
    expect(result.badgeSummary).toContain('mastery_pulse');
    expect(result.badgeSummary).toContain('world_stabilizer');
  });

  test('concede badge phase_clear na fase progression', () => {
    const result = buildRewardPackage({
      worldDelta: { stakeholder_trust: 5 },
      mastery: 40,
      phaseId: 'progression'
    });

    expect(result.badges).toContain('phase_clear');
  });

  test('limita xp máximo a 90 em cenários muito positivos', () => {
    const result = buildRewardPackage({
      worldDelta: { stakeholder_trust: 50, morale: 40, team_alignment: 35 },
      mastery: 95,
      phaseId: 'mission'
    });

    expect(result.xpAwarded).toBe(90);
  });
});