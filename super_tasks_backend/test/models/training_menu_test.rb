require "test_helper"

class TrainingMenuTest < ActiveSupport::TestCase
  def setup
    @menu = training_menus(:one)
  end

  test "valid fixture" do
    assert @menu.valid?
  end

  test "invalid without name" do
    @menu.name = nil
    assert_not @menu.valid?
  end

  test "invalid without category" do
    @menu.category = nil
    assert_not @menu.valid?
  end
end
