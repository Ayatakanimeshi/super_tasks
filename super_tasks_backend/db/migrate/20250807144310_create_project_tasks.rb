class CreateProjectTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :project_tasks do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.string :status
      t.datetime :due_date

      t.timestamps
    end
  end
end
