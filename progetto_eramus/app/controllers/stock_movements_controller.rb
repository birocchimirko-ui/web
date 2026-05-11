class StockMovementsController < ApplicationController
  before_action :authorize_request

  # --- NUOVO METODO PER LO STORICO ---
  def index
    # Carichiamo i movimenti includendo prodotto e operatore per evitare rallentamenti
    @stock_movements = StockMovement.includes(:product, :operator).order(created_at: :desc)

    # Filtro opzionale (es. /stock_movements?tipo=carico)
    if params[:tipo].present?
      @stock_movements = @stock_movements.where(movement_type: params[:tipo])
    end

    render json: @stock_movements.map { |m|
      {
        id: m.id,
        data: m.movement_date || m.created_at,
        prodotto: m.product&.name || "Prodotto eliminato",
        tipo: m.movement_type, # 'carico' o 'scarico'
        quantita: m.quantity,
        operatore: m.operator&.username || m.operator&.name || "N/D",
        note: m.notes
      }
    }
  end

  # --- IL TUO METODO CREATE (Invariato) ---
  def create
    @stock_movement = StockMovement.new(stock_movement_params)
    @stock_movement.operator_id = @current_user.id
    @stock_movement.movement_date ||= Time.current

    ActiveRecord::Base.transaction do
      if @stock_movement.save
        product = @stock_movement.product
        
        if @stock_movement.carico?
          product.quantity += @stock_movement.quantity
          
        else
          product.quantity -= @stock_movement.quantity
          if !@stock_movement.carico? && product.quantity < @stock_movement.quantity
            raise ActiveRecord::RecordInvalid.new(@stock_movement), "Giacenza insufficiente per lo scarico"
          end
        end

        product.save!
        product.check_stock_threshold if product.respond_to?(:check_stock_threshold)
        
        render json: @stock_movement, status: :created
      else
        render json: { errors: @stock_movement.errors.full_messages }, status: :unprocessable_entity
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: [e.message] }, status: :unprocessable_entity
  end

  private

  def stock_movement_params
    params.require(:stock_movement).permit(:product_id, :movement_type, :quantity, :movement_date, :notes, :executor_id)
  end
end