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
    // Meta WhatsApp Business API credentials
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.WHATSAPP_WEBHOOK_SECRET
    // Fallback to Twilio credentials
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
      
      // Try Meta WhatsApp Business API first
      if (this.accessToken && this.phoneNumberId) {
        console.log('🔄 Using Meta WhatsApp Business API')
        try {
          const result = await this.sendMetaWhatsAppMessage(phoneNumber, message)
          return result
        } catch (metaError) {
          console.log('⚠️ Meta WhatsApp API failed, falling back to Twilio...')
          console.error('Meta API Error:', metaError.message)
          
          // If Meta API fails, try Twilio as fallback
          if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom) {
            console.log('🔄 Falling back to Twilio WhatsApp API')
            
            // Check if using sandbox number
            const isSandbox = this.twilioWhatsAppFrom === 'whatsapp:+14155238886'
            
            if (isSandbox) {
              console.log('⚠️  Using Twilio Sandbox. User must join sandbox first.')
              console.log('📱 Instructions: Send "join <sandbox-keyword>" to +1 415 523 8886')
            }
            
            const result = await this.sendTwilioWhatsAppMessage(phoneNumber, message)
            
            // Add sandbox instructions to response if needed
            if (isSandbox) {
              result.sandboxInstructions = {
                required: true,
                message: 'Para receber mensagens do WhatsApp, primeiro envie "join <palavra-chave>" para +1 415 523 8886',
                sandboxNumber: '+1 415 523 8886'
              }
            }
            
            return result
          } else {
            // No fallback available, throw original Meta error
            throw metaError
          }
        }
      }
      // Direct Twilio fallback if no Meta credentials
      else if (this.twilioAccountSid && this.twilioAuthToken && this.twilioWhatsAppFrom) {
        console.log('🔄 Using Twilio WhatsApp API')
        
        // Check if using sandbox number
        const isSandbox = this.twilioWhatsAppFrom === 'whatsapp:+14155238886'
        
        if (isSandbox) {
          console.log('⚠️  Using Twilio Sandbox. User must join sandbox first.')
          console.log('📱 Instructions: Send "join <sandbox-keyword>" to +1 415 523 8886')
        }
        
        const result = await this.sendTwilioWhatsAppMessage(phoneNumber, message)
        
        // Add sandbox instructions to response if needed
        if (isSandbox) {
          result.sandboxInstructions = {
            required: true,
            message: 'Para receber mensagens do WhatsApp, primeiro envie "join <palavra-chave>" para +1 415 523 8886',
            sandboxNumber: '+1 415 523 8886'
          }
        }
        
        return result
      } 
      // Development simulation
      else {
        console.log('📱 [WhatsApp Simulation] No API credentials configured')
        console.log(`📱 Message to ${phoneNumber}:`)
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
      
      // Check for common errors
      if (error.message && error.message.includes('not a valid WhatsApp user')) {
        throw new Error('Número não encontrado no WhatsApp ou não habilitado para receber mensagens')
      } else if (error.message && error.message.includes('sandbox')) {
        throw new Error('Usuário precisa se juntar ao sandbox do Twilio primeiro. Envie "join <palavra-chave>" para +1 415 523 8886')
      }
      
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
   * Send message via Meta WhatsApp Business API
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message text
   * @returns {Promise<Object>} - API response
   */
  async sendMetaWhatsAppMessage(phoneNumber, message) {
    if (!this.accessToken || !this.phoneNumberId) {
      throw new Error('Meta WhatsApp Business API credentials not configured')
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '')
    // Ensure number has country code (Brazil +55 by default)
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    
    console.log(`🔄 Sending WhatsApp message via Meta API to ${formattedNumber}`)
    console.log(`📝 Message: ${message}`)
    
    const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedNumber,
        text: {
          body: message
        }
      })
    })

    const result = await response.json()
    
    console.log(`📊 Meta API Response Status: ${response.status}`)
    console.log(`📊 Meta API Response:`, result)
    
    if (!response.ok) {
      console.error(`❌ Meta WhatsApp API error:`, result)
      
      // Handle specific error cases
      if (result.error?.code === 131026) {
        throw new Error('Número de telefone não é um usuário válido do WhatsApp')
      } else if (result.error?.code === 131047) {
        throw new Error('Re-engagement message não foi enviado')
      } else if (result.error?.message) {
        throw new Error(`Meta WhatsApp API error: ${result.error.message}`)
      } else {
        throw new Error('Erro desconhecido ao enviar mensagem WhatsApp')
      }
    }

    console.log(`✅ Message sent with ID: ${result.messages?.[0]?.id}`)
    
    return {
      success: true,
      messageId: result.messages?.[0]?.id,
      status: 'queued',
      whatsappLink: this.generateWhatsAppLink(phoneNumber, '')
    }
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
    
    console.log(`🔄 Sending WhatsApp message to ${formattedTo}`)
    console.log(`📝 Message: ${message}`)
    
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
    
    console.log(`📊 Twilio Response Status: ${response.status}`)
    console.log(`📊 Twilio Response:`, result)
    
    if (!response.ok) {
      console.error(`❌ Twilio error: ${result.message}`, result)
      throw new Error(`Twilio WhatsApp API error: ${result.message || 'Unknown error'}`)
    }

    console.log(`✅ Message queued with SID: ${result.sid}`)
    
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
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