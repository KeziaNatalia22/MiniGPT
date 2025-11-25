'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create `messages` table linked to `listroomchat` (rooms)
    await queryInterface.sequelize.transaction(async (transaction) => {
      // create enum type for role (Sequelize will create a PG enum)
      await queryInterface.createTable(
        'messages',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          roomId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'listroomchat', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          role: {
            type: Sequelize.ENUM('user', 'ai'),
            allowNull: false,
            defaultValue: 'user',
          },
          text: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          metadata: {
            type: Sequelize.JSONB,
            allowNull: true,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        },
        { transaction }
      )

      // index to quickly fetch messages for a room in chronological order
      await queryInterface.addIndex('messages', ['roomId', 'createdAt'], {
        name: 'idx_messages_room_created',
        transaction,
      })
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('messages', 'idx_messages_room_created', { transaction }).catch(() => {})
      await queryInterface.dropTable('messages', { transaction })

      // remove enum type created by Sequelize for `role` if exists
      // the enum type name is usually "enum_<table>_<column>"
      try {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_role";', { transaction })
      } catch (e) {
        // ignore
      }
    })
  }
};
