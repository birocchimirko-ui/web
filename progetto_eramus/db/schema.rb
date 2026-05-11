# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_10_161612) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "access_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "data_accesso"
    t.string "esito"
    t.string "indirizzo_ip"
    t.datetime "updated_at", null: false
    t.uuid "utente_id", null: false
    t.index ["utente_id"], name: "index_access_logs_on_utente_id"
  end

  create_table "product_types", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "corpo_messaggio"
    t.datetime "created_at", null: false
    t.datetime "data_invio"
    t.string "esito_invio"
    t.datetime "updated_at", null: false
  end

  create_table "products", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.uuid "creator_id"
    t.text "description"
    t.integer "min_threshold"
    t.string "name"
    t.decimal "price"
    t.uuid "product_type_id", null: false
    t.integer "quantity"
    t.datetime "updated_at", null: false
    t.index ["product_type_id"], name: "index_products_on_product_type_id"
  end

  create_table "roles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "descrizione"
    t.string "nome_ruolo"
    t.datetime "updated_at", null: false
  end

  create_table "stock_movements", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.uuid "executor_id"
    t.datetime "movement_date"
    t.integer "movement_type"
    t.text "notes"
    t.uuid "operator_id"
    t.uuid "product_id", null: false
    t.integer "quantity"
    t.datetime "updated_at", null: false
    t.index ["product_id"], name: "index_stock_movements_on_product_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "cognome"
    t.datetime "created_at", null: false
    t.date "data_di_nascita"
    t.string "email", null: false
    t.string "nome"
    t.string "password_digest", null: false
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.uuid "role_id", null: false
    t.boolean "stato_account", default: true
    t.integer "tentativi_login_falliti", default: 0
    t.datetime "ultimo_login"
    t.datetime "updated_at", null: false
    t.string "username", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role_id"], name: "index_users_on_role_id"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "access_logs", "users", column: "utente_id"
  add_foreign_key "products", "product_types"
  add_foreign_key "stock_movements", "products"
  add_foreign_key "users", "roles"
end
