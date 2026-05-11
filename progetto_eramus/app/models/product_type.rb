class ProductType < ApplicationRecord
  has_one :product

  # Definiamo gli stati ammessi
  ESTI = ["transito", "consegnato", "problema"].freeze

  before_save :imposta_messaggio_automatico

  private

  def imposta_messaggio_automatico
    case esito_invio
    when "transito"
      self.corpo_messaggio = "in transito"
    when "consegnato"
      self.corpo_messaggio = "consegna riuscita con successo"
    when "problema"
      # Non sovrascriviamo se è già stato scritto qualcosa a mano
      self.corpo_messaggio = "Specificare il problema..." if corpo_messaggio.blank?
    end
  end
end