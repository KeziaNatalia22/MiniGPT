import dotenv from 'dotenv'
dotenv.config()

import { Sequelize } from 'sequelize'
import { initListRoomChat, ListRoomChat } from './listroomchat'
import { initMessage, Message } from './message'

const DB_USERNAME = String(process.env.DB_USERNAME ?? process.env.DB_USER)
const _rawPassword = process.env.DB_PASSWORD
const DB_PASSWORD = _rawPassword 
const DB_NAME = String(process.env.DB_NAME)
const DB_HOST = String(process.env.DB_HOST)
const DB_PORT = Number(process.env.DB_PORT) 

// defensive check - pg SCRAM requires a string password when authenticating
if (typeof DB_PASSWORD !== 'string') {
  console.warn('DB_PASSWORD is not a string; coerced to string')
}

export const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
})

// Helpful debug log (do not print password in plain text)
console.debug(`Sequelize connecting to ${DB_NAME}@${DB_HOST}:${DB_PORT} as ${DB_USERNAME}`)

export const Models = {
  ListRoomChat: initListRoomChat(sequelize),
  Message: initMessage(sequelize),
}

// associations
Models.ListRoomChat.hasMany(Models.Message, { foreignKey: 'roomId', as: 'messages', onDelete: 'CASCADE' })
Models.Message.belongsTo(Models.ListRoomChat, { foreignKey: 'roomId', as: 'room' })

export { ListRoomChat, Message }

export async function initDb(options?: { sync?: boolean }) {
  if (options?.sync || process.env.DB_SYNC === 'true') {
    await sequelize.sync()
  }
}
