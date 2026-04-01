import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MentorState = sequelize.define('MentorState', {
    id: { type: DataTypes.UUID, primaryKey: true },
    tenantId: { type: DataTypes.UUID, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    journeyStateId: { type: DataTypes.UUID, allowNull: true, field: 'journey_state_id' },
    lastMessage: { type: DataTypes.TEXT, allowNull: true, field: 'last_message' },
    tone: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'coach' },
    context: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'mentor_states',
    underscored: true
  });

  return MentorState;
};
