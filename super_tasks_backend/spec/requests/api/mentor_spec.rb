require "rails_helper"

RSpec.describe "Mentor API", type: :request do
  let!(:user) { create(:user) }
  let!(:task) { create(:mentor_task) }

  it "ログ作成→overdueフィールド確認" do
    csrf = login_as!(user)

    post "/api/mentor_task_logs", params: {
      mentor_task_log: {
        mentor_task_id: task.id,
        executed_at: Time.current.iso8601,
        deadline: 1.day.ago.iso8601,
        completed: false
      }
    }.to_json, headers: auth_headers(csrf)
    expect(response).to have_http_status(:created)

    get "/api/mentor_task_logs?overdue=true"
    expect(response).to have_http_status(:ok)
    expect(json.first["overdue"]).to eq(true)
  end

  it "他人のログは更新不可" do
    other = create(:user)
    other_log = create(:mentor_task_log, user: other, mentor_task: task)
    csrf = login_as!(user)

    patch "/api/mentor_task_logs/#{other_log.id}", params: {
      mentor_task_log: { completed: true }
    }.to_json, headers: auth_headers(csrf)
    expect(response.status).to be_in([403,404])
  end
end
