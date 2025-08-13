class User < ApplicationRecord
  has_secure_password

  has_many :training_logs,    dependent: :destroy, inverse_of: :user
  has_many :meal_logs,        dependent: :destroy, inverse_of: :user
  has_many :study_goals,      dependent: :destroy, inverse_of: :user
  has_many :study_logs,       dependent: :destroy, inverse_of: :user
  has_many :mentor_tasks,     dependent: :destroy, inverse_of: :user
  has_many :mentor_task_logs, dependent: :destroy, inverse_of: :user
  has_many :tasks,            dependent: :destroy, inverse_of: :user

  VALID_EMAIL = /\A[^@\s]+@[^@\s]+\z/
  validates :email, presence: true, format: { with: VALID_EMAIL }, uniqueness: true
  validates :password, length: { minimum: 8 }, if: -> { password.present? }
end
