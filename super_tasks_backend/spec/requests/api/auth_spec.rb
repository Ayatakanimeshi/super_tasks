require "rails_helper"

RSpec.describe "Auth API", type: :request do
  describe "POST /api/signup" do
    it "新規登録に成功する" do
      csrf = fetch_csrf!
      post "/api/signup", params: {
        user: { name: "Dev", email: "dev@example.com", password: "password123", password_confirmation: "password123" }
      }.to_json, headers: auth_headers(csrf)
      expect(response).to have_http_status(:created)
      expect(json["ok"]).to eq(true)
      expect(json["user"]["email"]).to eq("dev@example.com")
    end

    it "メール重複で422になる" do
      create(:user, email: "dup@example.com")
      csrf = fetch_csrf!
      post "/api/signup", params: {
        user: { name: "A", email: "dup@example.com", password: "password123", password_confirmation: "password123" }
      }.to_json, headers: auth_headers(csrf)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(json["errors"]["email"]).to be_present
    end
  end

  describe "POST /api/login & GET /api/me" do
    let!(:user) { create(:user, email: "me@example.com") }

    it "ログイン後に /api/me でsignedInがtrueになる" do
      login_as!(user)
      get "/api/me"
      expect(response).to have_http_status(:ok)
      expect(json["signedIn"]).to eq(true)
      expect(json["user"]["email"]).to eq("me@example.com")
    end

    it "未ログインだと /api/me は401" do
      get "/api/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
