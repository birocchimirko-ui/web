Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get '/dashboard/stats', to: 'dashboard#stats'
  get '/stock_movements', to: 'stock_movements#index'
  get '/users', to: 'users#index'

  post "/login", to: "sessions#create"
  post "/signup", to: "users#create"
  # Rotte per il recupero password
  post "password/forgot", to: "passwords#forgot"
  post "password/reset", to: "passwords#reset"


  resources :products
  resources :stock_movements, only: [ :index, :create ]
  resources :users
  resources :access_logs, only: [ :index ]
  resources :product_types, only: [ :index ]

  
  # Defines the root path route ("/")
  # root "posts#index"
end
