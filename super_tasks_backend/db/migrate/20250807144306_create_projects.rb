class CreateProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :projects do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name
      t.text :description
      t.string :status
      t.datetime :deadline

      t.timestamps
    end
  end
end
