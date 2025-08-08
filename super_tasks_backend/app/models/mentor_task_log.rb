class MentorTaskLog < ApplicationRecord
  belongs_to :user
  belongs_to :mentor_task
end
