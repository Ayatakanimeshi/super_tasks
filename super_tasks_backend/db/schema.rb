# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_08_07_150822) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "journal_entries", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.text "content"
    t.date "written_on"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_journal_entries_on_user_id"
  end

  create_table "meal_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "meal_menu_id", null: false
    t.float "amount"
    t.datetime "meal_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meal_menu_id"], name: "index_meal_logs_on_meal_menu_id"
    t.index ["user_id"], name: "index_meal_logs_on_user_id"
  end

  create_table "meal_menus", force: :cascade do |t|
    t.string "name"
    t.string "time_category"
    t.string "food_category"
    t.float "calories"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "meals", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.integer "calories"
    t.datetime "eaten_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_meals_on_user_id"
  end

  create_table "mentor_task_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "mentor_task_id", null: false
    t.datetime "executed_at"
    t.datetime "deadline"
    t.boolean "completed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mentor_task_id"], name: "index_mentor_task_logs_on_mentor_task_id"
    t.index ["user_id"], name: "index_mentor_task_logs_on_user_id"
  end

  create_table "mentor_tasks", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "project_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "project_task_id", null: false
    t.float "work_time"
    t.datetime "log_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_task_id"], name: "index_project_logs_on_project_task_id"
    t.index ["user_id"], name: "index_project_logs_on_user_id"
  end

  create_table "project_tasks", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.string "name"
    t.text "description"
    t.string "status"
    t.datetime "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_tasks_on_project_id"
  end

  create_table "projects", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.text "description"
    t.string "status"
    t.datetime "deadline"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "study_goals", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "category"
    t.integer "target_hours"
    t.boolean "completed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "study_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "study_goal_id", null: false
    t.float "hours"
    t.datetime "study_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["study_goal_id"], name: "index_study_logs_on_study_goal_id"
    t.index ["user_id"], name: "index_study_logs_on_user_id"
  end

  create_table "tasks", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title"
    t.text "description"
    t.date "due_date"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "training_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "training_menu_id", null: false
    t.float "weight"
    t.integer "reps"
    t.datetime "training_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["training_menu_id"], name: "index_training_logs_on_training_menu_id"
    t.index ["user_id"], name: "index_training_logs_on_user_id"
  end

  create_table "training_menus", force: :cascade do |t|
    t.string "name"
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_project_tasks", force: :cascade do |t|
    t.bigint "user_project_id", null: false
    t.string "title"
    t.text "description"
    t.date "due_date"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_project_id"], name: "index_user_project_tasks_on_user_project_id"
  end

  create_table "user_projects", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_user_projects_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.string "gender"
    t.date "birthday"
    t.float "height"
    t.float "weight"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email"
  end

  create_table "weight_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.float "weight"
    t.datetime "logged_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_weight_logs_on_user_id"
  end

  create_table "workouts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name"
    t.integer "duration"
    t.integer "burned_calories"
    t.datetime "performed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_workouts_on_user_id"
  end

  add_foreign_key "journal_entries", "users"
  add_foreign_key "meal_logs", "meal_menus"
  add_foreign_key "meal_logs", "users"
  add_foreign_key "meals", "users"
  add_foreign_key "mentor_task_logs", "mentor_tasks"
  add_foreign_key "mentor_task_logs", "users"
  add_foreign_key "project_logs", "project_tasks"
  add_foreign_key "project_logs", "users"
  add_foreign_key "project_tasks", "projects"
  add_foreign_key "projects", "users"
  add_foreign_key "study_logs", "study_goals"
  add_foreign_key "study_logs", "users"
  add_foreign_key "tasks", "users"
  add_foreign_key "training_logs", "training_menus"
  add_foreign_key "training_logs", "users"
  add_foreign_key "user_project_tasks", "user_projects"
  add_foreign_key "user_projects", "users"
  add_foreign_key "weight_logs", "users"
  add_foreign_key "workouts", "users"
end
