class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products, id: :uuid do |t|
      t.string :name, null: false
      t.text :description
      t.integer :quantity, default: 0
      t.decimal :price, precision: 10, scale: 2
      t.integer :min_threshold, default: 30
      t.references :product_type, null: false, foreign_key: true, type: :uuid
      t.references :creator, null: false, type: :uuid, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
