class MentorTaskLog < ApplicationRecord
  belongs_to :user
  belongs_to :mentor_task

  validates :completed, inclusion: { in: [true, false] }, allow_nil: true
end
