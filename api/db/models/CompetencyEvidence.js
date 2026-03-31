import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CompetencyEvidence = sequelize.define('CompetencyEvidence', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    competencyId: { type: DataTypes.UUID, allowNull: true, field: 'competency_id' },
    sourceType: { type: DataTypes.STRING(40), allowNull: false, field: 'source_type' },
    sourceId: { type: DataTypes.UUID, allowNull: true, field: 'source_id' },
    evidenceText: { type: DataTypes.TEXT, allowNull: true, field: 'evidence_text' },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'competency_evidences',
    underscored: true
  });

  return CompetencyEvidence;
};
