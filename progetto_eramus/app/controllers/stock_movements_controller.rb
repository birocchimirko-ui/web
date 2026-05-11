class StockMovementsController < ApplicationController
  before_action :authorize_request

  # GET /stock_movements
  def index
    # Carichiamo i movimenti includendo prodotto, operatore ed esecutore per evitare query N+1
    @stock_movements = StockMovement.includes(:product, :operator, :executor).order(created_at: :desc)

    # Filtro opzionale (es. /stock_movements?tipo=carico)
    if params[:tipo].present?
      @stock_movements = @stock_movements.where(movement_type: params[:tipo])
    end

    render json: @stock_movements.map { |m|
      {
        id: m.id,
        data: m.movement_date || m.created_at,
        prodotto: m.product&.name || "Prodotto eliminato",
        tipo: m.movement_type, 
        quantita: m.quantity,
        operatore: m.operator&.name || m.operator&.username || "N/D",
        esecutore: m.executor&.name || m.executor&.username || "N/D",
        note: m.notes
      }
    }
  end

  # POST /stock_movements
  def create
    @stock_movement = StockMovement.new(stock_movement_params)
    
    # LOGICA IDENTITÀ:
    # L'operatore è sempre l'utente loggato (@current_user)
    @stock_movement.operator_id = @current_user.id
    
    # L'esecutore viene dai parametri (scelto nel form), 
    # se non presente facciamo fallback sull'operatore stesso
    @stock_movement.executor_id ||= @current_user.id
    
    @stock_movement.movement_date ||= Time.current

    # Usiamo una transazione per garantire l'integrità dei dati
    ActiveRecord::Base.transaction do
      # 1. Verifichiamo prima se il movimento è valido (quantità > 0, etc.)
      if @stock_movement.valid?
        product = Product.find(@stock_movement.product_id)

        if @stock_movement.carico?
          # Logica Carico
          product.quantity += @stock_movement.quantity
        else
          # Logica Scarico con CONTROLLO GIACENZA
          if product.quantity < @stock_movement.quantity
            # Blocchiamo tutto se la merce non è sufficiente
            render json: { errors: ["Giacenza insufficiente per lo scarico. Disponibile: #{product.quantity}"] }, status: :unprocessable_entity
            raise ActiveRecord::Rollback # Interrompe la transazione senza crashare il server
            return
          end
          product.quantity -= @stock_movement.quantity
        end

        # Salviamo il movimento e aggiorniamo il prodotto
        @stock_movement.save!
        product.save!
        
        # Trigger per invio email se sotto soglia
        product.check_stock_threshold if product.respond_to?(:check_stock_threshold)
        
        render json: @stock_movement, status: :created
      else
        render json: { errors: @stock_movement.errors.full_messages }, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Prodotto non trovato" }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  rescue StandardError => e
    # Cattura eventuali errori imprevisti (Errore 500) e li logga
    logger.error "ERRORE CRITICO MOVIMENTO: #{e.message}"
    render json: { error: "Errore interno del server durante il salvataggio" }, status: :internal_server_error
  end

  private

  def stock_movement_params
    # Permettiamo esplicitamente l'executor_id inviato dal frontend
    params.require(:stock_movement).permit(
      :product_id, 
      :movement_type, 
      :quantity, 
      :movement_date, 
      :notes, 
      :executor_id
    )
  end
end