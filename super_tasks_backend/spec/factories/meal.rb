FactoryBot.define do
  factory :meal_menu do
    name { "Chicken Breast 100g" }
    time_category { "lunch" }
    food_category { "protein" }
    calories { 165.0 }
  end

  factory :meal_log do
    association :user
    association :meal_menu
    amount { 1.0 }
    meal_date { Time.current }
  end
end
