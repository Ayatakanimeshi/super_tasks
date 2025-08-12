class MealLog < ApplicationRecord
  belongs_to :user
  belongs_to :meal_menu

  validates :meal_date, presence: true
  validates :amount, numericality: { allow_nil: true, greater_than_or_equal_to: 0 }
end
