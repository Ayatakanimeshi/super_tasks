class User < ApplicationRecord
  has_secure_password

  has_many :training_logs, dependent: :destroy
  has_many :meal_logs,     dependent: :destroy
  has_many :study_goals,   dependent: :destroy
  has_many :mentor_task_logs, dependent: :destroy
  has_many :mentor_tasks, through: :mentor_task_logs

  VALID_EMAIL = /\A[^@\s]+@[^@\s]+\z/
  validates :email, presence: true, format: { with: VALID_EMAIL }, uniqueness: true
  validates :password, length: { minimum: 8 }, if: -> { password.present? }
end
