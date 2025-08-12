class StudyGoal < ApplicationRecord
  belongs_to :user
  has_many :study_logs, dependent: :destroy

  validates :name, presence: true
  validates :target_hours, numericality: { allow_nil: true,  only_integer: true, greater_than_or_equal_to: 0}
  validates :completed, inclusion: { in: [true,false] }, allow_nil: true
end
