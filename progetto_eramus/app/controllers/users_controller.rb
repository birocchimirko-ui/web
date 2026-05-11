class UsersController < ApplicationController
  # CORRETTO: Il nome deve coincidere con quello in ApplicationController
  before_action :authorize_request, except: [:create]
  before_action :authorize_admin, except: [:create]

  # GET /users
  def index
    users = User.includes(:role).all

    if params[:search].present?
      search_query = "%#{params[:search]}%"
      users = users.where(
        "username LIKE ? OR email LIKE ? OR nome LIKE ? OR cognome LIKE ?", 
        search_query, search_query, search_query, search_query
      )
    end

    @users = users.order(created_at: :desc).page(params[:page]).per(10)

    render json: {
      users: @users.as_json(include: :role),
      meta: {
        current_page: @users.current_page,
        total_pages: @users.total_pages,
        total_count: @users.total_count
      }
    }
  end

  # POST /users
  def create
    @user = User.new(user_params)
    
    # Gestione UUID per ruolo di default
    if @user.role_id.blank?
      @user.role_id = Role.find_by(nome_ruolo: 'operatore')&.id
    end

    @user.stato_account = true if @user.stato_account.nil?

    if @user.save
      render json: { message: "Utente creato con successo", user: @user }, status: :created
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /users/:id
  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      render json: { message: "Utente aggiornato correttamente", user: @user.as_json(include: :role) }
    else
      render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /users/:id/toggle_status
  def toggle_status
    @user = User.find(params[:id])
    @user.update(stato_account: !@user.stato_account)
    render json: { message: "Stato modificato", stato_account: @user.stato_account }
  end

  private

  def user_params
    params.require(:user).permit(
      :nome, :cognome, :username, :email, :password, 
      :data_di_nascita, :role_id, :ultimo_login, :stato_account
    )
  end
end