class PasswordsController < ApplicationController
  # Permettiamo l'accesso a chi ha perso la password e quindi non può essere loggato
  skip_before_action :authenticate_request

  # FASE 1: Richiesta del reset (L'utente inserisce l'email nel frontend)
  def forgot
    if params[:email].blank?
      return render json: { error: "Inserisci un indirizzo email." }, status: :bad_request
    end

    user = User.find_by(email: params[:email])

    if user.present?
      # Generiamo un token unico e salviamo l'orario di invio
      user.update(
        reset_password_token: SecureRandom.urlsafe_base64,
        reset_password_sent_at: Time.current
      )
      # Inviamo l'email usando il Mailer che abbiamo creato
      UserMailer.reset_password_email(user).deliver_now
    end

    # Risposta generica per sicurezza (non confermiamo se l'email esiste davvero)
    render json: { message: "Se l'indirizzo è registrato, riceverai le istruzioni a breve." }, status: :ok
  end

  # FASE 2: Cambio effettivo (L'utente usa il link ricevuto via mail)
  def reset
    token = params[:token].to_s
    user = User.find_by(reset_password_token: token)

    # Controllo critico: il token deve esistere ed essere stato inviato da meno di 60 minuti
    if user.present? && user.reset_password_sent_at > 1.hour.ago
      if user.update(password: params[:password], reset_password_token: nil)
        render json: { message: "Password aggiornata con successo!" }, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Il link è scaduto o non è valido. Richiedine uno nuovo." }, status: :unauthorized
    end
  end
end
