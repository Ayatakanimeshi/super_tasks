# test/integration/registrations_flow_test.rb
require "test_helper"

class RegistrationsFlowTest < ActionDispatch::IntegrationTest
  test "registers_and_auto_logs_in" do
    # 1) CSRFトークンを取得（同一クライアント＝同一セッション）
    get api_csrf_path
    assert_response :success
    token = JSON.parse(response.body)["csrfToken"]
    assert token.present?, "csrfToken should be present"

    # 2) 取得したトークンを X-CSRF-Token ヘッダに付けてサインアップ
    assert_difference "User.count", +1 do
      post api_signup_path,
        params: {
          user: {
            name: "Newbie",
            email: "new@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        },
        as: :json,
        headers: { "X-CSRF-Token" => token }
    end
    assert_response :created

    body = JSON.parse(response.body)
    assert_equal "new@example.com", body.dig("user", "email")

    # 3) セッションが張れているか確認
    get api_me_path
    assert_response :success
    me = JSON.parse(response.body)
    assert_equal "new@example.com", me.dig("user", "email")
  end
end
