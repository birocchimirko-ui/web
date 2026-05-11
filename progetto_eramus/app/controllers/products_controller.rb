class ProductsController < ApplicationController
  before_action :authorize_request
  before_action :set_product, only: [:show, :update, :destroy]

  # GET /products
  def index
    # Partiamo dai prodotti attivi includendo la tabella per le spedizioni
    products = Product.includes(:product_type).active

    # Filtro per "Tipo" (Buste, Carta, Toner) - Cerchiamo nella colonna 'name'
    if params[:tipo].present?
      products = products.where("name ILIKE ?", "%#{params[:tipo]}%")
    end

    # Ricerca libera per "Nome Commerciale/Provenienza" - Cerchiamo nella colonna 'description'
    if params[:search].present?
      products = products.where("description ILIKE ?", "%#{params[:search]}%")
    end

    # Ordinamento (Prezzo o Quantità)
    sort_column = params[:sort_by] || 'name'
    sort_direction = params[:direction] || 'asc'
    
    # Validazione base per l'ordinamento per evitare SQL injection
    valid_columns = ['name', 'price', 'quantity', 'created_at']
    sort_column = 'name' unless valid_columns.include?(sort_column)
    
    @products = products.order("#{sort_column} #{sort_direction}").page(params[:page]).per(10)

    render json: {
      products: @products.as_json(include: :product_type),
      meta: {
        total_pages: @products.total_pages,
        current_page: @products.current_page,
        total_count: @products.total_count
      }
    }
  end

  # GET /products/:id
  def show
    render json: @product.as_json(include: :product_type)
  end

  # POST /products
  def create
    @product = Product.new(product_params)
    @product.creator_id = @current_user.id
    esecutore_id = params[:product][:executor_id] || @current_user.id
    @product.active = true

    if @product.save
      if @product.quantity > 0
        
        nota_movimento = 
        if @product.product_type.esito_invio == "problema"
        "Carico parziale. Nota: #{@product.product_type.corpo_messaggio}"
      else "Carico iniziale merce consegnata."

       end

       StockMovement.create!(
        product: @product,
        quantity: @product.quantity,
        movement_type: :carico,
        movement_date: Time.current,
        operator_id: @current_user.id,
        executor_id: esecutore_id,
        notes: nota_movimento)

      end
      render json: @product, status: :created
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /products/:id
  def update
    old_quantity = @product.quantity

    if @product.update(product_params)
      new_quantity = @product.quantity
      diff = new_quantity - old_quantity

      # REGISTRAZIONE AUTOMATICA: Se la quantità è cambiata, crea un movimento
      if diff != 0
        StockMovement.create!(
          product: @product,
          quantity: diff.abs,
          movement_type: diff > 0 ? :carico : :scarico,
          movement_date: Time.current,
          operator_id: @current_user.id,
          notes: "Rettifica quantità da modifica anagrafica"
        )
      end

      @product.check_stock_threshold # Verifica se inviare avviso soglia
      render json: @product
    else
      render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /products/:id (ELIMINAZIONE LOGICA)
  def destroy
  @product = Product.find(params[:id])
  if @product.destroy
    render json: { message: "Prodotto eliminato con successo" }, status: :ok
  else
    render json: { errors: "Impossibile eliminare il prodotto" }, status: :unprocessable_entity
   
  end
end

  private

  def set_product
    @product = Product.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Prodotto non trovato" }, status: :not_found
  end

  def product_params
    # Permettiamo i campi necessari includendo product_type_id per le spedizioni
    params.require(:product).permit(
      :name, 
      :description, 
      :quantity, 
      :price, 
      :min_threshold,
      :executor_id, 
      product_type_attributes: [:id, :data_invio, :esito_invio, :corpo_messaggio]
    )
  end
end
