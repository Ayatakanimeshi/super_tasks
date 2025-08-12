require "test_helper"

class MealLogTest < ActiveSupport::TestCase
  test "valid fixture" do
    assert meal_logs(:one).valid?
  end

  test "requires meal_date" do
    log = meal_logs(:one).dup
    log.meal_date = nil
    assert_not log.valid?
    assert_includes log.errors.attribute_names, :meal_date
  end

  test "amount must be >= 0 if present" do
    log = meal_logs(:one).dup
    log.amount = -1
    assert_not log.valid?
    assert_includes log.errors.attribute_names, :amount
  end
end
