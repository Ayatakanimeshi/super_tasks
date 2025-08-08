class CreateJournalEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :journal_entries do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.text :content
      t.date :written_on

      t.timestamps
    end
  end
end
