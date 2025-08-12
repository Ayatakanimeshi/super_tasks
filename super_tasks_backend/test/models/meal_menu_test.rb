require "test_helper"

class MealMenuTest < ActiveSupport::TestCase
  test "valid fixture" do
    assert meal_menus(:one).valid?
  end

  test "invalid without name" do
    m = meal_menus(:one).dup
    m.name = nil
    assert_not m.valid?
    assert_includes m.errors.attribute_names, :name
  end

  test "calories must be >= 0 if present" do
    m = meal_menus(:one).dup
    m.calories = -10
    assert_not m.valid?
    assert_includes m.errors.attribute_names, :calories
  end
end
