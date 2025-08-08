class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name
      t.string :email
      t.string :password_digest
      t.string :gender
      t.date :birthday
      t.float :height
      t.float :weight

      t.timestamps
    end
    add_index :users, :email
  end
end
