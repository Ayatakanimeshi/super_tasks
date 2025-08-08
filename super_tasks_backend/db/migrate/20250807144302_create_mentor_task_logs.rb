class CreateMentorTaskLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :mentor_task_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :mentor_task, null: false, foreign_key: true
      t.datetime :executed_at
      t.datetime :deadline
      t.boolean :completed

      t.timestamps
    end
  end
end
