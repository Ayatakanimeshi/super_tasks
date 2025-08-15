module RequestHelpers
  def json
    JSON.parse(response.body)
  rescue
    {}
  end

  # /api/csrf を叩いてトークンとCookieを得る
  def fetch_csrf!
    get "/api/csrf"
    expect(response).to have_http_status(:ok)
    json["csrfToken"]
  end

  # 認証ヘッダ（CSRF）を付けるためのヘッダ生成
  def auth_headers(csrf_token)
    { "CONTENT_TYPE" => "application/json", "X-CSRF-Token" => csrf_token }
  end

  # ユーザーでログイン（railsセッション + CSRFを正しく扱う）
  def login_as!(user, password: "password123")
    csrf = fetch_csrf!
    post "/api/login",
      params: { email: user.email, password: password }.to_json,
      headers: auth_headers(csrf)
    expect(response).to have_http_status(:ok)
    # ログイン後はCSRFがローテーションされるため、取り直して返す
    fetch_csrf!
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end
