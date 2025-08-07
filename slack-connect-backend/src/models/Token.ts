import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

interface TokenAttributes {
  team_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

export class Token extends Model<TokenAttributes> implements TokenAttributes {
  public team_id!: string;
  public access_token!: string;
  public refresh_token!: string;
  public expires_at!: Date;
}

Token.init(
  {
    team_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tokens',
  }
);
