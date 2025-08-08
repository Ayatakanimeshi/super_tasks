class CreateMealLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :meal_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :meal_menu, null: false, foreign_key: true
      t.float :amount
      t.datetime :meal_date

      t.timestamps
    end
  end
end
