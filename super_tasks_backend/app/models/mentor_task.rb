class MentorTask < ApplicationRecord
  has_many :mentor_task_logs, dependent: :destroy
  has_many :users, through: :mentor_task_logs

  validates :name, presence: true, length: { maximum: 255 }
end
