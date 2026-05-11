class CreateStockMovements < ActiveRecord::Migration[8.1]
  def change
    create_table :stock_movements, id: :uuid do |t|
      t.references :product, null: false, foreign_key: true, type: :uuid
      t.integer :movement_type, null: false 
      t.integer :quantity, null: false     
      t.datetime :movement_date, null: false
      t.references :operator, null: false, type: :uuid, foreign_key: { to_table: :users }
      t.text :notes

      t.timestamps
    end
  end
end
