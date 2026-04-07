import { resolveTwistCandidate } from '../modules/journey-engine/twist-engine.service.js';

describe('twist-engine.service', () => {
  test('mantém twist existente quando ainda não está resolvido', () => {
    const existingTwist = { id: 'twist-1', kind: 'context_shift', status: 'triggered' };

    const result = resolveTwistCandidate({
      worldState: { execution_risk: 90 },
      existingTwist,
      mission: null
    });

    expect(result).toBe(existingTwist);
  });

  test('retorna deadline_reduction quando execution_risk está alto', () => {
    const result = resolveTwistCandidate({
      worldState: { execution_risk: 72 },
      existingTwist: null,
      mission: null
    });

    expect(result.kind).toBe('deadline_reduction');
  });

  test('retorna new_stakeholder quando stakeholder_trust está baixo', () => {
    const result = resolveTwistCandidate({
      worldState: { stakeholder_trust: 34 },
      existingTwist: null,
      mission: null
    });

    expect(result.kind).toBe('new_stakeholder');
  });

  test('retorna new_information quando a missão declara optional trigger correspondente', () => {
    const result = resolveTwistCandidate({
      worldState: { execution_risk: 40, stakeholder_trust: 60, tension_level: 40 },
      existingTwist: null,
      mission: { optionalTwistTriggers: ['new_information'] }
    });

    expect(result.kind).toBe('new_information');
  });

  test('retorna null quando nenhuma condição de twist é atendida', () => {
    const result = resolveTwistCandidate({
      worldState: { execution_risk: 40, stakeholder_trust: 60, tension_level: 40 },
      existingTwist: null,
      mission: { optionalTwistTriggers: ['context_shift'] }
    });

    expect(result).toBeNull();
  });
});