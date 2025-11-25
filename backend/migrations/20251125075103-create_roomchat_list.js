'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create `listroomchat` table to store chat rooms
    // Use a transaction so the migration is atomic
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'listroomchat',
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          // optional description or metadata
          meta: {
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

      // index on title for quick lookup
      await queryInterface.addIndex('listroomchat', ['title'], {
        name: 'idx_listroomchat_title',
        unique: false,
        transaction,
      })
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('listroomchat', 'idx_listroomchat_title', { transaction }).catch(() => {})
      await queryInterface.dropTable('listroomchat', { transaction })
    })
  }
};
