class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :exception

  before_action :set_csrf_cookie
  before_action :require_login
  
  rescue_from ActionController::InvalidAuthenticityToken do
    render json: { ok: false, error: 'invalid_csrf' }, status: :unprocessable_entity
  end

  helper_method :current_user

  def current_user
    @current_user ||= User.find_by(id: session[:user_id])
  end

  def require_login
    return if current_user
    render json: { ok: false, error: 'unauthorized' }, status: :unauthorized
  end

  private
  def set_csrf_cookie
    cookies['CSRF-TOKEN'] = 
    { value: form_authenticity_token, 
    same_site: :lax, 
    secure: Rails.env.production? }
  end

end
