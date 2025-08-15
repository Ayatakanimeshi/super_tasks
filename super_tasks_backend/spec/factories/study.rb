FactoryBot.define do
  factory :study_goal do
    association :user
    name { "Java Bronze" }
    description { "公式テキスト1周" }
    category { "cert" }
    target_hours { 30 }
    completed { false }
  end

  factory :study_log do
    association :user
    association :study_goal
    hours { 1.5 }
    study_date { Time.current }
  end
end
