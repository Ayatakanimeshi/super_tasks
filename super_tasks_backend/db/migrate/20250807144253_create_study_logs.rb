class CreateStudyLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :study_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :study_goal, null: false, foreign_key: true
      t.float :hours
      t.datetime :study_date

      t.timestamps
    end
  end
end
