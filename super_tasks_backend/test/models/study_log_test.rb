require "test_helper"

class StudyLogTest < ActiveSupport::TestCase
  def setup
    @log = study_logs(:one)
  end

  test "valid fixture" do
    assert @log.valid?
  end

  test "requires study_date" do
    @log.study_date = nil
    assert_not @log.valid?
    assert_includes @log.errors[:study_date], "can't be blank"
  end

  test "hours must be >= 0 if present" do
    @log.hours = -0.1
    assert_not @log.valid?
    @log.hours = nil
    assert @log.valid?
    @log.hours = 0
    assert @log.valid?
  end

  test "belongs_to associations required" do
    @log.user = nil
    assert_not @log.valid?
    @log = study_logs(:one)
    @log.study_goal = nil
    assert_not @log.valid?
  end

  test "user must match study_goal.user" do
    # fixtures(:two) を使ってわざと不一致にする
    @log.user = users(:two)
    assert_not @log.valid?
    assert_includes @log.errors[:user], "must match study_goal.user"
  end
end
