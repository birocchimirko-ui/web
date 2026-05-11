class DashboardController < ApplicationController
  # before_action :authenticate_user! 

  def stats
    # 1. Conteggio utenti
    totale_utenti = User.count

    # 2. Conteggio prodotti
    totale_prodotti = Product.count

    #  Calcolo valore totale 
    valore_inventario = Product.sum("price * quantity")

    #  Ultimi 5 movimenti
    # Uso StockMovement e associazione :operator
    ultimi_movimenti = StockMovement.includes(:product, :operator).order(created_at: :desc).limit(5).map do |m|
      {
        created_at: m.created_at,
        product_name: m.product&.name || "Prodotto eliminato",
        tipo: m.movement_type, # CORRETTO: nello schema è movement_type
        quantita: m.quantity,   # CORRETTO: nello schema è quantity
        # m.operator si riferisce all'associazione belongs_to :operator
        executor_name: m.operator&.username || "Sistema" 
      }
    end

    #  Prodotti per categoria, soluzione per la mancanza di una tabella categories creata solo nel frontend
    prodotti_per_categoria = Product.all.group_by { |p| p.name.split('-').first.strip }.map do |cat, prods|
      {
        nome: cat,
        quantita: prods.count
      }
    end

    # Risposta finale
    render json: {
      totaleUtenti: totale_utenti,
      totaleProdotti: totale_prodotti,
      valoreInventario: valore_inventario,
      ultimiMovimenti: ultimi_movimenti,
      prodottiPerCategoria: prodotti_per_categoria
    }
  end
end