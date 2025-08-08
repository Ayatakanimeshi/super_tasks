class CreateMealMenus < ActiveRecord::Migration[7.1]
  def change
    create_table :meal_menus do |t|
      t.string :name
      t.string :time_category
      t.string :food_category
      t.float :calories

      t.timestamps
    end
  end
end
