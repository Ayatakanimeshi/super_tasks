class CreateProjectLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :project_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :project_task, null: false, foreign_key: true
      t.float :work_time
      t.datetime :log_date

      t.timestamps
    end
  end
end
