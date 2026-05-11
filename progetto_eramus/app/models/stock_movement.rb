class StockMovement < ApplicationRecord
  belongs_to :product
  belongs_to :operator, class_name: "User", foreign_key: "operator_id"
  belongs_to :executor, class_name: "User", foreign_key: "executor_id"

  # divisione dei movimenti carico e scarico con possibilità di aggiungerne altri
  enum :movement_type, { carico: 0, scarico: 1 }

  # validazioni

  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }

  validates :movement_date, presence: true

  validates :movement_type, presence: true

  validates :operator_id, presence: true

  validates :executor_id, presence: true

end
