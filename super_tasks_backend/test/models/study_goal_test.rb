require "test_helper"

class StudyGoalTest < ActiveSupport::TestCase
  def setup
    @goal = study_goals(:one)
  end

  test "valid fixture" do
    assert @goal.valid?
  end

  test "invalid without name" do
    @goal.name = nil
    assert_not @goal.valid?
    assert_includes @goal.errors[:name], "can't be blank"
  end

  test "invalid without user" do
    @goal.user = nil
    assert_not @goal.valid?
    assert_includes @goal.errors[:user], "must exist"
  end

  test "target_hours must be integer >= 0 if present" do
    @goal.target_hours = -1
    assert_not @goal.valid?
    @goal.target_hours = 1.5
    assert_not @goal.valid?
    @goal.target_hours = 0
    assert @goal.valid?
  end

  test "completed must be boolean if present" do
    @goal.completed = true
    assert @goal.valid?
    @goal.completed = false
    assert @goal.valid?
    @goal.completed = nil
    assert @goal.valid?  # allow_nil
  end
end
