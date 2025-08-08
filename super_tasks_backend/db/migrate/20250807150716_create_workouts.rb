class CreateWorkouts < ActiveRecord::Migration[7.1]
  def change
    create_table :workouts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.integer :duration
      t.integer :burned_calories
      t.datetime :performed_at

      t.timestamps
    end
  end
end
