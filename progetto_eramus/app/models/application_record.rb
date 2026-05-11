class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # la riga sotto  serve per ordinare i vari utenti per tempo di creazione quando chiami last o first
  self.implicit_order_column ="created_at"
end
