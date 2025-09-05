/**
 * WhatsApp Integration Service
 * This service handles WhatsApp message sending and bot integration.
 * 
 * For production, replace with actual WhatsApp Business API integration.
 */

// Mock WhatsApp Business API client
// In production, replace with actual WhatsApp Business API client
class WhatsAppService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    // Twilio credentials
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    this.twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM
  }

  /**
   * Send a verification code via WhatsApp
   * @param {string} phoneNumber - The phone number (e.g., +5511999999999)
   * @param {string} code - The 6-digit verification code
   * @param {Object} user - User object (if existing user)
   * @returns {Promise<Object>} - Result of the operation
   */
  async sendVerificationCode(phoneNumber, code, user = null) {
    try {
      const message = this.buildVerificationMessage(code, user)
      
      if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom) {
        // Production/Development: Use Twilio WhatsApp API
        return await this.sendTwilioWhatsAppMessage(phoneNumber, message)
      } else {
        // Development: Log message and return success
        console.log(`📱 [WhatsApp Simulation] Message to ${phoneNumber}:`)
        console.log(message)
        console.log(`🔗 WhatsApp Link: ${this.generateWhatsAppLink(phoneNumber, code)}`)
        
        return {
          success: true,
          messageId: `mock_${Date.now()}`,
          whatsappLink: this.generateWhatsAppLink(phoneNumber, code)
        }
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      throw error
    }
  }

  /**
   * Send a welcome message to new users
   * @param {string} phoneNumber - The phone number
   * @param {string} userName - User's name
   * @returns {Promise<Object>} - Result of the operation
   */
  async sendWelcomeMessage(phoneNumber, userName) {
    try {
      const message = this.buildWelcomeMessage(userName)
      
      if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom) {
        return await this.sendTwilioWhatsAppMessage(phoneNumber, message)
      } else {
        console.log(`📱 [WhatsApp Simulation] Welcome message to ${phoneNumber}:`)
        console.log(message)
        
        return {
          success: true,
          messageId: `welcome_${Date.now()}`
        }
      }
    } catch (error) {
      console.error('WhatsApp welcome message error:', error)
      throw error
    }
  }

  /**
   * Send order confirmation via WhatsApp
   * @param {string} phoneNumber - The phone number
   * @param {Object} order - Order details
   * @returns {Promise<Object>} - Result of the operation
   */
  async sendOrderConfirmation(phoneNumber, order) {
    try {
      const message = this.buildOrderConfirmationMessage(order)
      
      if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom) {
        return await this.sendTwilioWhatsAppMessage(phoneNumber, message)
      } else {
        console.log(`📱 [WhatsApp Simulation] Order confirmation to ${phoneNumber}:`)
        console.log(message)
        
        return {
          success: true,
          messageId: `order_${Date.now()}`
        }
      }
    } catch (error) {
      console.error('WhatsApp order confirmation error:', error)
      throw error
    }
  }

  /**
   * Build verification code message
   * @param {string} code - Verification code
   * @param {Object} user - User object (if existing)
   * @returns {string} - Formatted message
   */
  buildVerificationMessage(code, user) {
    if (user) {
      return `🛒 Olá ${user.name || 'Cliente'}!

Seu código de acesso à Feirajá é: *${code}*

Cole este código no site para acessar seus produtos frescos.

O código expira em 5 minutos.

🥕 Feirajá - Produtos frescos direto do produtor`
    } else {
      return `🥕 Bem-vindo à Feirajá!

Seu código de verificação é: *${code}*

Cole este código no site para confirmar seu cadastro e começar a receber produtos frescos direto do produtor.

O código expira em 5 minutos.

🌱 Feirajá - A feira na sua casa`
    }
  }

  /**
   * Build welcome message for new users
   * @param {string} userName - User's name
   * @returns {string} - Formatted message
   */
  buildWelcomeMessage(userName) {
    return `🎉 Bem-vindo à Feirajá, ${userName}!

Seu cadastro foi realizado com sucesso! 

Agora você pode:
• Explorar nossos produtos frescos
• Configurar sua cesta personalizada
• Receber produtos direto do produtor

🥕 Produtos sempre frescos
🚚 Entrega na sua casa
🌱 Direto do produtor

Obrigado por fazer parte da nossa comunidade!

Feirajá - A feira na sua casa`
  }

  /**
   * Build order confirmation message
   * @param {Object} order - Order details
   * @returns {string} - Formatted message
   */
  buildOrderConfirmationMessage(order) {
    return `✅ Pedido confirmado!

Olá ${order.customerName}!

Seu pedido #${order.id} foi confirmado com sucesso.

💰 Total: R$ ${order.total.toFixed(2)}
📅 Entrega prevista: ${order.deliveryDate}
📍 Endereço: ${order.address}

Acompanhe seu pedido no site da Feirajá.

🥕 Obrigado por escolher produtos frescos!

Feirajá - A feira na sua casa`
  }

  /**
   * Generate WhatsApp web link with pre-filled message
   * @param {string} phoneNumber - Phone number
   * @param {string} code - Verification code
   * @returns {string} - WhatsApp link
   */
  generateWhatsAppLink(phoneNumber, code) {
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    const message = encodeURIComponent(`Código: ${code}`)
    return `https://wa.me/${cleanNumber}?text=${message}`
  }

  /**
   * Send message via Twilio WhatsApp API
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message text
   * @returns {Promise<Object>} - API response
   */
  async sendTwilioWhatsAppMessage(phoneNumber, message) {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioWhatsAppFrom) {
      throw new Error('Twilio WhatsApp API credentials not configured')
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '')
    const formattedTo = `whatsapp:+${cleanNumber}`
    
    // Create basic auth string
    const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64')
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: this.twilioWhatsAppFrom,
        To: formattedTo,
        Body: message
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(`Twilio WhatsApp API error: ${result.message || 'Unknown error'}`)
    }

    return {
      success: true,
      messageId: result.sid,
      whatsappLink: this.generateWhatsAppLink(phoneNumber, '')
    }
  }

  /**
   * Verify webhook signature (for production)
   * @param {string} signature - X-Hub-Signature-256 header
   * @param {string} body - Request body
   * @returns {boolean} - Whether signature is valid
   */
  verifyWebhookSignature(signature, body) {
    if (!process.env.WHATSAPP_WEBHOOK_SECRET) {
      return false
    }

    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    return signature === `sha256=${expectedSignature}`
  }

  /**
   * Process incoming webhook from WhatsApp (for production)
   * @param {Object} webhookData - Webhook payload
   * @returns {Promise<void>}
   */
  async processIncomingWebhook(webhookData) {
    console.log('Processing WhatsApp webhook:', webhookData)
    
    // Handle different types of incoming messages
    const entry = webhookData.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    
    if (value?.messages) {
      for (const message of value.messages) {
        await this.handleIncomingMessage(message, value)
      }
    }

    if (value?.statuses) {
      for (const status of value.statuses) {
        await this.handleMessageStatus(status, value)
      }
    }
  }

  /**
   * Handle incoming messages from users
   * @param {Object} message - Message data
   * @param {Object} value - Webhook value
   */
  async handleIncomingMessage(message, value) {
    const phoneNumber = message.from
    const messageText = message.text?.body
    
    console.log(`Incoming message from ${phoneNumber}: ${messageText}`)
    
    // Handle common user responses
    if (messageText && /código|codigo/i.test(messageText)) {
      // User might be sharing verification code - log for debugging
      console.log(`User ${phoneNumber} sent potential verification code: ${messageText}`)
    }
  }

  /**
   * Handle message delivery status updates
   * @param {Object} status - Status data
   * @param {Object} value - Webhook value
   */
  async handleMessageStatus(status, value) {
    console.log(`Message ${status.id} status: ${status.status}`)
    
    // Update delivery status in database if needed
    // This could be used to track message delivery rates
  }
}

// Export singleton instance
export default new WhatsAppService()