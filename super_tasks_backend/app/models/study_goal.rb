class StudyGoal < ApplicationRecord
  belongs_to :user, inverse_of: :study_goals
  has_many :study_logs, dependent: :destroy, inverse_of: :study_goals

  validates :name, presence: true
  validates :target_hours, numericality: { allow_nil: true,  only_integer: true, greater_than_or_equal_to: 0}
  validates :completed, inclusion: { in: [true,false] }, allow_nil: true
end
