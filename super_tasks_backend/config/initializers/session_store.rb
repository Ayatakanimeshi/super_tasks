Rails.application.config.session_store :cookie_store,
  key: '_super_tasks_session',
  secure: true,
  httponly: true, 
  same_site: :none