class CreateAccessLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :access_logs, id: :uuid do |t|
      t.references :utente, null: false, type: :uuid, foreign_key: { to_table: :users }
      t.datetime :data_accesso
      t.string :esito
      t.string :indirizzo_ip

      t.timestamps
    end
  end
end
