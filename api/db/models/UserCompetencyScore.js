import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserCompetencyScore = sequelize.define('UserCompetencyScore', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    competencyId: { type: DataTypes.UUID, allowNull: false, field: 'competency_id' },
    score: { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
    level: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'iniciante' },
    evidencesJson: { type: DataTypes.JSONB, allowNull: true, field: 'evidences_json' },
    evidenceCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'evidence_count' },
    lastEvaluatedAt: { type: DataTypes.DATE, allowNull: true, field: 'last_evaluated_at' }
  }, {
    tableName: 'user_competency_scores',
    underscored: true
  });

  return UserCompetencyScore;
};
