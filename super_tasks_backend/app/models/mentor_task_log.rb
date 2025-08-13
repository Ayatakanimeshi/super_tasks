class MentorTaskLog < ApplicationRecord
  belongs_to :user, inverse_of: mentor_task_logs
  belongs_to :mentor_task, inverse_of: mentor_task_logs

  validates :completed, inclusion: { in: [true, false] }, allow_nil: true
end
