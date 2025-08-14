class Api::RegistrationsController < ApplicationController
  skip_before_action :require_login, only: :create

  def create
    user = User.new(user_params)

    if user.save
      reset_session
      session[:user_id] = user.id

      render json: {
        ok: true,
        user: { id: user.id, email: user.email, name: user.name }
      }, status: :created
    else
      render json: {
        ok: false,
        errors: user.errors.to_hash(true) # { email: ["has already been taken"], ... }
      }, status: :unprocessable_entity
    end
  end

  private

  # 受け入れる属性を明示（mass assignment防止）
  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
end
