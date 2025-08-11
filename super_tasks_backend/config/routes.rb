Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  namespace :api do
    get    :csrf,        to: 'sessions#csrf'
    post   :login,       to: 'sessions#create'
    delete :logout,      to: 'session#destroy'
    get    :me,          to: 'sessions#me'
    get    :health_check, to: proc { [200, {}, [ { status: 'ok' }.to_json ]] }
  end
end
