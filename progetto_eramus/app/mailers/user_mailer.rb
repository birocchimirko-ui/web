class UserMailer < ApplicationMailer
  default from: "notifiche@tuo-sistema-agid.it"

  # 1. Benvenuto: Inviata quando viene creato un nuovo utente
  def benvenuto_email(user)
    @user = user
    @url  = "http://localhost:3001/login" # URL del tuo frontend Next.js
    mail(to: @user.email, subject: "Benvenuto nel Sistema di Gestione Inventario")
  end

  # 2. Reset Password: Inviata per il recupero
  def reset_password_email(user)
    @user = user
    # Il link punta al frontend Next.js passando il token che abbiamo creato nel DB
    @url  = "http://localhost:3001/reset-password?token=#{@user.reset_password_token}"
    mail(to: @user.email, subject: "Istruzioni per il reset della password")
  end

  # 3. Soglia Minima: Inviata all'admin per l'inventario
  def avviso_soglia_minima(product)
    @product = product
    @admin_email = "admin@esempio.it" # Cambiala con la tua vera mail
    mail(to: @admin_email, subject: "⚠️ Scorta critica: #{@product.name}")
  end
end
