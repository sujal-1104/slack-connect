import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface ScheduledMessageAttributes {
  id?: number;
  team_id: string;
  channel_id: string;
  text: string;
  send_at: Date;
  sent?: boolean;
}

export class ScheduledMessage extends Model<ScheduledMessageAttributes> implements ScheduledMessageAttributes {
  public id!: number;
  public team_id!: string;
  public channel_id!: string;
  public text!: string;
  public send_at!: Date;
  public sent!: boolean;
}

ScheduledMessage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    team_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    send_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'scheduled_messages',
  }
);
