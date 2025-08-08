class CreateWeightLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :weight_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.float :weight
      t.datetime :logged_at

      t.timestamps
    end
  end
end
