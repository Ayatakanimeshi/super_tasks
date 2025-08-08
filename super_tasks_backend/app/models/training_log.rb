class TrainingLog < ApplicationRecord
  belongs_to :user
  belongs_to :training_menu
end
