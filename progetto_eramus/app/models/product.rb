class Product < ApplicationRecord
  # --- RELAZIONI ---
  belongs_to :product_type, dependent: :destroy
  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  has_many :stock_movements, dependent: :destroy

  # Permette di salvare i dati della spedizione insieme al prodotto
  accepts_nested_attributes_for :product_type

  # --- VALIDAZIONI ---
  
  # 1. Presenza obbligatoria
  validates :name, presence: true
  validates :creator, presence: true
  validates :product_type, presence: true

  # 2. Quantità: non può essere negativa (Requisito Gestione Inventario)
  validates :quantity, presence: true, numericality: { 
    greater_than_or_equal_to: 0, 
    only_integer: true 
  }

  # 3. Prezzo: deve essere un numero positivo (anche decimale)
  validates :price, presence: true, numericality: { 
    greater_than_or_equal_to: 0 
  }

  # 4. Soglia minima: serve per le notifiche email automatiche
  validates :min_threshold, presence: true, numericality: { 
    greater_than_or_equal_to: 0, 
    only_integer: true 
  }

  # --- LOGICA ---

  def last_executor_name
    last_movement = self.stock_movements.order(created_at: :desc).first
    # Recuperiamo lo username dell'esecutore (executor)
    last_movement&.executor&.username || "Nessuno"
  end

  scope :active, -> { where(active: true) }

  # Metodo per il controllo scorte (da richiamare dopo ogni movimento)
  def check_stock_threshold
    if quantity <= (min_threshold || 0)
      # In futuro qui innescheremo l'invio della mail
      Rails.logger.warn "🚨 ALLERTA SCORTE: #{name} è sotto la soglia minima (#{quantity} <= #{min_threshold})"
      UserMailer.avviso_soglia_minima(self).deliver_now
    end
  end
end
