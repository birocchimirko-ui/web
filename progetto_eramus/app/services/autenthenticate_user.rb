class AuthenticateUser
  def initialize(email, password, ip_address)
    @email = email
    @password = password
    @ip_address = ip_address
  end

  def call
    user = User.find_by(email: @email)

    # Usiamo 'stato_account' per vedere se è bloccato
    if user && user.stato_account == true
      if user.authenticate(@password)
        # Successo: reset dei TUOI campi
        user.update(tentativi_login_falliti: 0, ultimo_login: Time.current)
        log_access(user, "Successo")
        return { token: JsonWebToken.encode(user_id: user.id), user: user }
      else
        # Fallimento: incrementiamo il TUO contatore
        increment_failed_attempts(user)
        log_access(user, "Fallito - Password errata")
        return nil
      end
    end
    
    log_access(nil, "Fallito - Utente inesistente o account disattivato")
    nil
  end

  private

  def increment_failed_attempts(user)
    user.increment!(:tentativi_login_falliti)
    # Se arriva a 5, cambiamo lo stato_account a false (bloccato)
    if user.tentativi_login_falliti >= 5
      user.update(stato_account: false)
    end
  end

  def log_access(user, esito)
    AccessLog.create!(
      utente: user,
      data_accesso: Time.current,
      esito: esito,
      indirizzo_ip: @ip_address
    )
  end
end