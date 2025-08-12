class StudyLog < ApplicationRecord
  belongs_to :user
  belongs_to :study_goal

  validates :study_date, presence: true
  validates :hours, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }

  validate :user_matches_goal

  private

  def user_matches_goal
    return if study_goal.nil? || user.nil?
    errors.add(:user, "must match study_goal.user") if study_goal.user_id != user_id
  end
end
