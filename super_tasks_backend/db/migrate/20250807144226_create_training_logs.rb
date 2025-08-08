class CreateTrainingLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :training_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :training_menu, null: false, foreign_key: true
      t.float :weight
      t.integer :reps
      t.datetime :training_date

      t.timestamps
    end
  end
end
