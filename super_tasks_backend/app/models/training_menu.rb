class TrainingMenu < ApplicationRecord
  has_many :training_logs, dependent: :nullify

  validates :name, presence: true
  validates :category, presence: true
end
