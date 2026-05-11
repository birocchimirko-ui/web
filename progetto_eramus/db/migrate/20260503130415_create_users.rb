class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users, id: :uuid do |t|
      t.references :role, type: :uuid, null: false, foreign_key: true
      t.string :username, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :nome
      t.string :cognome
      t.date :data_di_nascita
      t.integer :tentativi_login_falliti, default: 0
      t.boolean :stato_account, default: true
      t.datetime :ultimo_login

      t.timestamps
    end
     add_index :users, :username, unique: true
     add_index :users, :email, unique: true
    # questi comandi servono per garantire l'univocità dei due parametri
  end
end
