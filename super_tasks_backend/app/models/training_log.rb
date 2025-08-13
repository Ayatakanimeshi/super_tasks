class TrainingLog < ApplicationRecord
  belongs_to :user,          inverse_of: :training_logs
  belongs_to :training_menu, optional: true, inverse_of: :training_logs

  validates :performed_at, presence: true
  validates :reps, numericality: { allow_nil: true, only_integer: true, greater_than_or_equal_to: 0 }
  validates :weight, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }
  validates :duration_minutes, numericality: { allow_nil: true, only_integer: true, greater_than_or_equal_to: 0 }
end
