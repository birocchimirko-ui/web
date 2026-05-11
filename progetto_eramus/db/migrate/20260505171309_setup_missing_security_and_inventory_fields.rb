class SetupMissingSecurityAndInventoryFields < ActiveRecord::Migration[8.1]
  def change
    # 1. Campi per il Password Reset (Mancanti nella tabella Users)
    # Servono per il requisito della validità di 1 ora
    add_column :users, :reset_password_token, :string
    add_column :users, :reset_password_sent_at, :datetime
    add_index :users, :reset_password_token, unique: true

    # 2. Campo per il Soft Delete dei PRODOTTI (Mancante nella tabella Products)
    # Fondamentale per non rompere lo storico dei movimenti
    add_column :products, :active, :boolean, default: true, null: false
  end
end
