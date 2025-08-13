class TrainingMenu < ApplicationRecord
  has_many :training_logs, dependent: :nullify, inverse_of: :training_menu

  validates :name,     presence: true
  validates :category, presence: true
end