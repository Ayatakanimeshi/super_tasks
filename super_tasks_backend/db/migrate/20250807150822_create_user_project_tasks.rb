class CreateUserProjectTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :user_project_tasks do |t|
      t.references :user_project, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.date :due_date
      t.string :status

      t.timestamps
    end
  end
end
