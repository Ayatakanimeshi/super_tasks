class CreateStudyGoals < ActiveRecord::Migration[7.1]
  def change
    create_table :study_goals do |t|
      t.string :name
      t.text :description
      t.string :category
      t.integer :target_hours
      t.boolean :completed

      t.timestamps
    end
  end
end
