require "rails_helper"

RSpec.describe "Meal API", type: :request do
  let!(:user) { create(:user) }
  let!(:menu) { create(:meal_menu) }

  it "ログイン必須" do
    get "/api/meal_logs"
    expect(response).to have_http_status(:unauthorized)
  end

  it "ログ作成→一覧→更新ができる" do
    csrf = login_as!(user)

    post "/api/meal_logs", params: {
      meal_log: { meal_menu_id: menu.id, amount: 1.5, meal_date: Time.current.iso8601 }
    }.to_json, headers: auth_headers(csrf)
    expect(response).to have_http_status(:created)
    id = json["id"]

    get "/api/meal_logs"
    expect(response).to have_http_status(:ok)
    expect(json.any? { |l| l["id"] == id }).to be true

    patch "/api/meal_logs/#{id}", params: {
      meal_log: { amount: 2.0 }
    }.to_json, headers: auth_headers(csrf)
    expect(response).to have_http_status(:ok)
    expect(json["amount"]).to eq(2.0)
  end

  it "不正なmenu_idで422" do
    csrf = login_as!(user)
    post "/api/meal_logs", params: {
      meal_log: { meal_menu_id: 999999, amount: 1, meal_date: Time.current.iso8601 }
    }.to_json, headers: auth_headers(csrf)
    expect(response.status).to be_in([404,422])
  end
end
