class RenameTrainingLogsTrainingDateToPerformedAt < ActiveRecord::Migration[7.1]
  def up
    # 1) カラム名を揃える
    if column_exists?(:training_logs, :training_date) && !column_exists?(:training_logs, :performed_at)
      rename_column :training_logs, :training_date, :performed_at
    end

    # 2) 型を datetime に（必要なら）
    if column_exists?(:training_logs, :performed_at)
      # 既に date 型なら datetime へ変換
      change_column :training_logs, :performed_at, :datetime
    end

    # 3) NOT NULL & index（未設定なら）
    change_column_null :training_logs, :performed_at, false if column_exists?(:training_logs, :performed_at)
    add_index :training_logs, :performed_at unless index_exists?(:training_logs, :performed_at)
    add_index :training_logs, :user_id    unless index_exists?(:training_logs, :user_id)
  end

  def down
    # 可能な範囲で元に戻す（型までは厳密に戻さない運用でもOK）
    if column_exists?(:training_logs, :performed_at) && !column_exists?(:training_logs, :training_date)
      # index は自動で名前が変わっている可能性があるため、存在チェックだけ
      remove_index :training_logs, :performed_at if index_exists?(:training_logs, :performed_at)
      rename_column :training_logs, :performed_at, :training_date
      # 型戻しは省略 or 必要なら:
      # change_column :training_logs, :training_date, :date
      add_index :training_logs, :training_date unless index_exists?(:training_logs, :training_date)
    end
  end
end
