class StudyLog < ApplicationRecord
  belongs_to :user
  belongs_to :study_goal
end
