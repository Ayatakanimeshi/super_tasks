class StrengthenUsersConstraints < ActiveRecord::Migration[7.1]
  def change
# email: 既存 index 名でチェック（名前が一致すればスキップ）
    unless index_exists?(:users, :email, name: "index_users_on_email")
      add_index :users, :email, unique: true, name: "index_users_on_email"
    end

    # NOT NULL 制約はそのままでOK（存在チェック付き）
    change_column_null :users, :email, false if column_exists?(:users, :email)
    change_column_null :users, :password_digest, false if column_exists?(:users, :password_digest)
  end
end
