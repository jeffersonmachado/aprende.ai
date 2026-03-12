import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AIMessage = sequelize.define('AIMessage', {
    id: { type: DataTypes.UUID, primaryKey: true },
    aiSessionId: { type: DataTypes.UUID, allowNull: false, field: 'ai_session_id' },
    senderType: { type: DataTypes.STRING(20), allowNull: false, field: 'sender_type' },
    messageText: { type: DataTypes.TEXT, allowNull: false, field: 'message_text' },
    messageJson: { type: DataTypes.JSONB, allowNull: true, field: 'message_json' },
    tokenUsageInput: { type: DataTypes.INTEGER, allowNull: true, field: 'token_usage_input' },
    tokenUsageOutput: { type: DataTypes.INTEGER, allowNull: true, field: 'token_usage_output' }
  }, {
    tableName: 'ai_messages',
    underscored: true
  });

  return AIMessage;
};
