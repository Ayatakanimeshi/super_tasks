class MealLog < ApplicationRecord
  belongs_to :user, inverse_of: :meal_logs
  belongs_to :meal_menu, inverse_of: :meal_logs

  validates :meal_date, presence: true
  validates :amount, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }
end
