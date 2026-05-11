class SessionsController < ApplicationController
  skip_before_action :authorize_request, only: [:create]

  def create
    login_param = params[:login] || params[:username] || params[:email]
    user = User.find_by("username = ? OR email = ?", login_param, login_param)

    if user.nil?
      # Per sicurezza non logghiamo se l'utente non esiste, o logghiamo con utente_id: nil
      render json: { error: "Credenziali non valide" }, status: :unauthorized
      return
    end

    # Controllo se l'account è bloccato (Requisito 4.1)
    unless user.stato_account
      registra_log(user, "Fallito") 
      render json: { error: "Account bloccato. Contatta l'amministratore." }, status: :forbidden
      return
    end

    if user.authenticate(params[:password])
      user.update(tentativi_login_falliti: 0)
      registra_log(user, "Successo") 

      token = JsonWebToken.encode(user_id: user.id, role: user.role.nome_ruolo)

      render json: {
        token: token,
        user: { id: user.id, username: user.username, role: user.role.nome_ruolo }
      }, status: :ok
    else
      user.registra_fallimento! # Questo metodo deve incrementare il contatore e bloccare a 5
      registra_log(user, "Fallito")
      render json: { error: "Credenziali non valide" }, status: :unauthorized
    end
  end

  private

  # Funzione helper per creare il log
  def registra_log(user, esito)
    AccessLog.create(
      utente: user,
      data_accesso: Time.current,
      esito: esito,
      indirizzo_ip: request.remote_ip
    )
  end
end