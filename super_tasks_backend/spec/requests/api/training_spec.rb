require "rails_helper"

RSpec.describe "Training API", type: :request do
  let!(:user) { create(:user) }
  let!(:menu) { create(:training_menu) }

  describe "認証必須" do
    it "未ログインでGET /api/training_logs は401" do
      get "/api/training_logs"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "CRUD" do
    it "自分のログを作成/取得できる" do
      csrf = login_as!(user)

      # 作成
      post "/api/training_logs", params: {
        training_log: {
          training_menu_id: menu.id, weight: 60, reps: 8,
          performed_at: Time.current.iso8601, duration_minutes: 40
        }
      }.to_json, headers: auth_headers(csrf)
      expect(response).to have_http_status(:created)
      log_id = json["id"]

      # 一覧
      get "/api/training_logs"
      expect(response).to have_http_status(:ok)
      expect(json.first["id"]).to eq(log_id)

      # 期間フィルタ
      get "/api/training_logs", params: { from: Date.today.to_s, to: Date.today.to_s }
      expect(response).to have_http_status(:ok)
      expect(json.size).to be >= 1
    end

    it "他ユーザーのログは更新できない（404想定）" do
      other = create(:user)
      foreign_log = create(:training_log, user: other, training_menu: menu)

      csrf = login_as!(user)
      patch "/api/training_logs/#{foreign_log.id}",
        params: { training_log: { reps: 10 } }.to_json,
        headers: auth_headers(csrf)

      expect(response.status).to be_in([403,404])
    end
  end

  describe "メニューのバリデーション" do
    it "nameなしは422" do
      csrf = login_as!(user)
      post "/api/training_menus", params: {
        training_menu: { name: "", category: "chest" }
      }.to_json, headers: auth_headers(csrf)
      expect(response.status).to eq(422)
    end
  end
end
