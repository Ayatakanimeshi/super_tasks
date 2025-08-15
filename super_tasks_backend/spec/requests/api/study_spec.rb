require "rails_helper"

RSpec.describe "Study API", type: :request do
  let!(:user) { create(:user) }
  let!(:goal) { create(:study_goal, user: user) }

  it "自分のgoal/logを扱える" do
    csrf = login_as!(user)

    # goal一覧
    get "/api/study_goals"
    expect(response).to have_http_status(:ok)
    expect(json.first["id"]).to eq(goal.id)

    # log作成
    post "/api/study_logs", params: {
      study_log: { study_goal_id: goal.id, hours: 1.5, study_date: Time.current.iso8601 }
    }.to_json, headers: auth_headers(csrf)
    expect(response).to have_http_status(:created)
  end

  it "他人のgoalを指定したlog作成は404" do
    other = create(:user)
    other_goal = create(:study_goal, user: other)
    csrf = login_as!(user)

    post "/api/study_logs", params: {
      study_log: { study_goal_id: other_goal.id, hours: 1.0, study_date: Time.current.iso8601 }
    }.to_json, headers: auth_headers(csrf)

    expect(response.status).to eq(404)
  end

  it "hoursが負数なら422（バリデーション例）" do
    csrf = login_as!(user)
    post "/api/study_logs", params: {
      study_log: { study_goal_id: goal.id, hours: -1, study_date: Time.current.iso8601 }
    }.to_json, headers: auth_headers(csrf)
    expect(response.status).to eq(422).or be_between(400,422)
  end
end
