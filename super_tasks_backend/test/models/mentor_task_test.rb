require "test_helper"

class MentorTaskTest < ActiveSupport::TestCase
  test "valid fixture" do
    assert mentor_tasks(:one).valid?
  end

  test "requires name" do
    t = MentorTask.new
    assert_not t.valid?
    assert_includes t.errors.attribute_names, :name
  end
end
