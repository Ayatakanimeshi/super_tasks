FactoryBot.define do
  factory :training_menu do
    name { "Bench Press" }
    category { "chest" }
  end

  factory :training_log do
    association :user
    association :training_menu
    weight { 60.0 }
    reps { 8 }
    performed_at { Time.current }
    duration_minutes { 40 }
  end
end
