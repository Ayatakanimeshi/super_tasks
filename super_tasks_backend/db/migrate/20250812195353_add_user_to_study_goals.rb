class AddUserToStudyGoals < ActiveRecord::Migration[7.1]
  def change
    add_reference :study_goals, :user, null: false, foreign_key: true
  end
end
