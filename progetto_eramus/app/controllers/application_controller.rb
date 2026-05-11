class ApplicationController < ActionController::API
  # Prima di ogni azione, esegui il metodo authorize_request
  before_action :authorize_request

  attr_reader :current_user

  def registra_log(user, azione_ricevuta)
    AccessLog.create!(
      utente: user,
      esito: azione_ricevuta,
      indirizzo_ip: request.remote_ip,
      data_accesso: Time.current
    )
  rescue => e
    Rails.logger.error "Errore durante la registrazione del log: #{e.message}"
  end

  # Metodo per proteggere le rotte riservate agli admin
  def authorize_admin
    unless @current_user&.role&.nome_ruolo&.downcase == 'admin'
      render json: { error: "Accesso non autorizzato. Richiesti privilegi di amministratore." }, status: :forbidden
    end
  end

  private

  def authorize_request
    header = request.headers["Authorization"]
    token = header.split(" ").last if header.present?
    
    decoded = JsonWebToken.decode(token)

    if decoded
      @current_user = User.find(decoded[:user_id])
    else
      render json: { errors: "Accesso negato. Token non valido o mancante." }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound => e
    render json: { errors: "Utente non trovato" }, status: :unauthorized
  rescue JWT::DecodeError => e
    render json: { errors: "Token corrotto o scaduto" }, status: :unauthorized
  end
end
