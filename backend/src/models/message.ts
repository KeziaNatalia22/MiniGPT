import { Sequelize, DataTypes, Model, Optional } from 'sequelize'

export interface MessageAttributes {
  id: number
  roomId: number
  role: 'user' | 'ai'
  text: string
  metadata?: any
  createdAt?: Date
  updatedAt?: Date
}

export interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number
  public roomId!: number
  public role!: 'user' | 'ai'
  public text!: string
  public metadata?: any

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export function initMessage(sequelize: Sequelize) {
  Message.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      roomId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      role: { type: DataTypes.ENUM('user', 'ai'), allowNull: false, defaultValue: 'user' },
      text: { type: DataTypes.TEXT, allowNull: false },
      metadata: { type: DataTypes.JSONB, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'messages',
      sequelize,
      timestamps: true,
    }
  )
  return Message
}
