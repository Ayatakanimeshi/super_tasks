class ProjectLog < ApplicationRecord
  belongs_to :user
  belongs_to :project_task
end
