FactoryBot.define do
  factory :mentor_task do
    name { "面談準備" }
    description { "候補者の職務経歴確認" }
    category { "recruit" }
  end

  factory :mentor_task_log do
    association :user
    association :mentor_task
    executed_at { Time.current }
    deadline { 1.day.from_now }
    completed { false }
  end
end
