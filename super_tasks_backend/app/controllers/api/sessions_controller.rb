class Api::SessionsController < ApplicationController
  skip_before_action :require_login, only: %i[create csrf me]
  
  def csrf
    render json: { csrfToken: form_authenticity_token }
  end

  def create # POST /api/login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      render json: { ok: true, user: { id: user.id, name: user.name, email: user.email } }
    else
      render json: { ok: false, error: 'invalid_credentials' }, status: :unauthorized
    end
  end

  def destroy # DELETE /api/logout
    reset_session
    render json: { ok: true }
  end

  def me # GET /api/me
    if current_user
      render json: { signedIn: true, user: { id: current_user.id, name: current_user.name, email: current_user.email } }
    else
      render json: { signedIn: false }, status: :unauthorized
    end
  end
end
