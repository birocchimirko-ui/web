class User < ApplicationRecord
  # Relazione: ogni utente deve avere un ruolo
  belongs_to :role

  has_many :access_logs

  has_secure_password

  # Validazioni di base
  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :nome, :cognome, presence: true

  # Regex per: 1 Maiuscola, 1 Miniscola, 1 Numero, 1 Carattere Speciale, min 8 caratteri
  validates :password, format: { 
    with: /\A(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*?,;.:_+]).{8,}\z/,
    message: "deve contenere almeno 8 caratteri, una maiuscola, un numero e un carattere speciale"
  }, if: -> { password.present? }

  def registra_fallimento!
    increment!(:tentativi_login_falliti)
    if tentativi_login_falliti >= 5
      update(stato_account: false)
    end
  end

  # Metodo per resettare il contatore dopo un login riuscito
  def reset_tentativi!
    update(tentativi_login_falliti: 0)
  end

  # Metodo per controllare se l'utente può provare a loggarsi
  def attivo?
    stato_account == true
  end
end
