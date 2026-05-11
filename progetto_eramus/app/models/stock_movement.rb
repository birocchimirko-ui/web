class StockMovement < ApplicationRecord
  belongs_to :product
  belongs_to :operator, class_name: "User", foreign_key: "operator_id"
  belongs_to :executor, class_name: "User", foreign_key: "executor_id"

  # divisione dei movimenti carico e scarico con possibilità di aggiungerne altri
  enum :movement_type, { carico: 0, scarico: 1 }

  after_create :update_product_inventory

  # validazioni

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :movement_date, presence: true

  validates :movement_type, presence: true

  validates :operator_id, presence: true

  validates :executor_id, presence: true

  private

  def update_product_inventory
    if carico?
      product.increment!(:quantity, quantity)
    else
      product.decrement!(:quantity, quantity)
    end
  end

    # Richiama il controllo soglia che abbiamo scritto nel modello Product
    product.check_stock_threshold
  end
end
