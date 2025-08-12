require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "valid with email and password" do
    u = User.new(email: "ok@example.com", password: "Password123!")
    assert u.valid?
  end

  test "invalid without email" do
    u = User.new(password: "Password123!")
    assert_not u.valid?
  end

  test "invalid email format" do
    u = User.new(email: "bad@", password: "Password123!")
    assert_not u.valid?
  end

  test "password must be 8+" do
    u = User.new(email: "x@example.com", password: "short")
    assert_not u.valid?
  end
end