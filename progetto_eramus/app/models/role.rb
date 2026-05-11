class Role < ApplicationRecord
  has_many :users
  validates :nome_ruolo, inclusion: { in: %w(admin operatore) }
end
