require "test_helper"

class MentorTaskLogTest < ActiveSupport::TestCase
  test "valid fixture" do
    assert mentor_task_logs(:one).valid?
  end

  test "requires belongs_to associations" do
    log = MentorTaskLog.new
    assert_not log.valid?
    assert_includes log.errors.attribute_names, :user
    assert_includes log.errors.attribute_names, :mentor_task
  end

  test "completed must be boolean if present" do
    log = mentor_task_logs(:one)
    log.completed = nil
    assert log.valid? # nil 許容

    log.completed = true
    assert log.valid?

    log.completed = false
    assert log.valid?
  end
end
