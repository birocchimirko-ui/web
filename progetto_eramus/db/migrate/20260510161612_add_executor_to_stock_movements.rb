class AddExecutorToStockMovements < ActiveRecord::Migration[8.1]
  def change
    add_column :stock_movements, :executor_id, :uuid
  end
end
