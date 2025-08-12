class MealMenu < ApplicationRecord
  has_many :meal_logs, dependent: :restrict_with_exception

  validates :name, presence: true
  validates :calories, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }
end
