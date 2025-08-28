import express from 'express'
import twilio from 'twilio'

const router = express.Router()

// Webhook endpoint for user access tracking
router.post('/user-access', async (req, res) => {
  try {
    const { isFirstTime, timestamp, userAgent, visitData } = req.body
    
    console.log('🔔 User Access Webhook Triggered:', {
      isFirstTime,
      timestamp,
      userAgent: userAgent?.substring(0, 100) + '...' || 'Unknown',
      visitCount: visitData?.visitCount || 1
    })
    
    // Here you could:
    // 1. Log to analytics service
    // 2. Send to database
    // 3. Trigger marketing automation
    // 4. Send notifications
    // 5. Update user metrics
    
    if (isFirstTime) {
      console.log('🎉 New user detected! Triggering first-time user flow')
      
      // Example: Could trigger email welcome series
      // Could send to analytics with custom event
      // Could update user onboarding state
    } else {
      console.log('👋 Returning user detected! Visit count:', visitData?.visitCount || 'unknown')
      
      // Example: Could trigger retention campaigns
      // Could update user engagement metrics
    }
    
    // Respond with success
    res.json({
      success: true,
      message: 'User access webhook processed successfully',
      data: {
        isFirstTime,
        timestamp,
        processed: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Error processing user access webhook:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process user access webhook',
      message: error.message
    })
  }
})

// Twilio WhatsApp webhook endpoint for incoming messages
router.post('/whatsapp', async (req, res) => {
  try {
    console.log('📱 Twilio WhatsApp webhook received:', JSON.stringify(req.body, null, 2))
    
    const { From, Body, MessageSid } = req.body
    
    if (From && Body) {
      await handleIncomingTwilioWhatsAppMessage({
        from: From,
        body: Body,
        messageSid: MessageSid
      })
    }
    
    // Respond with TwiML (empty response means no automatic reply)
    res.set('Content-Type', 'text/xml')
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
    
  } catch (error) {
    console.error('❌ Error processing Twilio WhatsApp webhook:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process Twilio WhatsApp webhook',
      message: error.message
    })
  }
})

// Handle incoming Twilio WhatsApp message
async function handleIncomingTwilioWhatsAppMessage(message) {
  try {
    const { from, body, messageSid } = message
    const phoneNumber = from.replace('whatsapp:', '') // Remove whatsapp: prefix
    const messageText = body || ''
    
    console.log('📨 New Twilio WhatsApp message:', {
      from: phoneNumber,
      messageSid,
      message: messageText.substring(0, 100) + (messageText.length > 100 ? '...' : '')
    })
    
    await sendFereirajaLinkViaTwilio(phoneNumber, messageText)
    
  } catch (error) {
    console.error('❌ Error handling Twilio WhatsApp message:', error)
  }
}

// Send Feiraja link via Twilio WhatsApp
async function sendFereirajaLinkViaTwilio(phoneNumber, originalMessage) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
    const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.log('⚠️ Twilio credentials not configured')
      return
    }
    
    // Initialize Twilio client
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    // Create personalized response
    const responses = [
      {
        trigger: /ola|oi|hey|hello|hi/i,
        message: `Olá! 👋 Bem-vindo à Feiraja! 🥬🍅

Acesse nossa plataforma e descubra produtos frescos direto da roça:
🔗 https://feiraja.vercel.app

✨ O que você encontra:
• Frutas e verduras frescas
• Produtos orgânicos selecionados  
• Entrega em casa
• Preços direto do produtor

Primeira vez? Você será direcionado para montar sua cesta personalizada! 📦`
      },
      {
        trigger: /produto|comprar|cesta|feira/i,
        message: `🛒 Que ótimo! Você quer conhecer nossos produtos!

Acesse agora a Feiraja:
🔗 https://feiraja.vercel.app

🌱 Produtos frescos da roça
📦 Cestas personalizadas
🚚 Entrega gratuita
💚 Direto do produtor

Clique no link e monte sua primeira cesta! 🥕🥬`
      },
      {
        trigger: /preco|valor|quanto|custa/i,
        message: `💰 Nossos preços são direto do produtor!

Veja todos os valores na nossa plataforma:
🔗 https://feiraja.vercel.app

🏷️ Cestas a partir de R$ 25,00
📦 Tamanhos para toda família
🆓 Frete grátis
💳 Pagamento facilitado

Acesse e confira! 🛒`
      }
    ]
    
    // Find matching response or use default
    let responseMessage = `Olá! 👋 Obrigado pela mensagem!

Acesse a Feiraja e descubra produtos frescos da roça:
🔗 https://feiraja.vercel.app

🥬 Produtos orgânicos e frescos
📦 Cestas personalizadas  
🚚 Entrega em casa

Primeira visita? Você será direcionado para configurar sua cesta ideal! ✨`

    for (const response of responses) {
      if (response.trigger.test(originalMessage)) {
        responseMessage = response.message
        break
      }
    }
    
    // Send message via Twilio WhatsApp API
    const message = await client.messages.create({
      body: responseMessage,
      from: TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phoneNumber}`
    })
    
    console.log('✅ Twilio WhatsApp message sent successfully to', phoneNumber, 'SID:', message.sid)
    
    // Log the interaction for analytics
    console.log('📊 WhatsApp interaction logged:', {
      phoneNumber: phoneNumber.substring(0, 5) + '***', // Privacy
      timestamp: new Date().toISOString(),
      originalMessage: originalMessage.substring(0, 50) + (originalMessage.length > 50 ? '...' : ''),
      responseSent: true,
      messageSid: message.sid
    })
    
  } catch (error) {
    console.error('❌ Error sending Twilio WhatsApp message:', error)
  }
}

export default router