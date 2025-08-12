require "test_helper"

class TrainingLogTest < ActiveSupport::TestCase
  setup do
    @user = User.first || User.create!(email: "tlog@example.com", password: "Password123!")
  end

  test "valid with user and performed_at" do
    tl = TrainingLog.new(user: @user, performed_at: Time.current, reps: 10, weight: 40.0)
    assert tl.valid?
  end

  test "invalid without performed_at" do
    tl = TrainingLog.new(user: @user)
    assert_not tl.valid?
  end

  test "numeric constraints" do
    tl = TrainingLog.new(user: @user, performed_at: Time.current, reps: -1, weight: -5, duration_minutes: -10)
    assert_not tl.valid?
  end
end
