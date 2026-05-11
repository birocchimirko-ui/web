class AccessLog < ApplicationRecord
 belongs_to :utente, class_name: "User", foreign_key: "utente_id"

  # Validazioni
  validates :data_accesso, presence: true
  validates :esito, inclusion: { in: %w[Successo Fallito] }
  validates :indirizzo_ip, presence: true
end
