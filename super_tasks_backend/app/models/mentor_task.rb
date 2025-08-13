class MentorTask < ApplicationRecord
  has_many :mentor_task_logs, dependent: :destroy, inverse_of: mentor_task
  has_many :users, through: :mentor_task_logs, inverse_of: mentor_task

  validates :name, presence: true, length: { maximum: 255 }
end
