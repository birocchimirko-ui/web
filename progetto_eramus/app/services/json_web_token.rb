class JsonWebToken
  # Usiamo la chiave segreta di Rails per firmare i token
  SECRET_KEY = Rails.application.credentials.secret_key_base

  # Metodo per creare un token (Encoding)
  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  # Metodo per leggere un token (Decoding)
  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new decoded
  rescue
    nil
  end
end