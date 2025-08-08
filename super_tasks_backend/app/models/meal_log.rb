class MealLog < ApplicationRecord
  belongs_to :user
  belongs_to :meal_menu
end
