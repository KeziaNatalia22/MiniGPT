import { Sequelize, DataTypes, Model, Optional } from 'sequelize'

export interface ListRoomChatAttributes {
  id: number
  title: string
  meta?: any
  createdAt?: Date
  updatedAt?: Date
}

export interface ListRoomChatCreationAttributes extends Optional<ListRoomChatAttributes, 'id'> {}

export class ListRoomChat extends Model<ListRoomChatAttributes, ListRoomChatCreationAttributes> implements ListRoomChatAttributes {
  public id!: number
  public title!: string
  public meta?: any

  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export function initListRoomChat(sequelize: Sequelize) {
  ListRoomChat.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      title: { type: DataTypes.STRING(255), allowNull: false },
      meta: { type: DataTypes.JSONB, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'listroomchat',
      sequelize,
      timestamps: true,
    }
  )
  return ListRoomChat
}
