import express from 'express'

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

// WhatsApp webhook endpoint for incoming messages
router.post('/whatsapp', async (req, res) => {
  try {
    const { entry } = req.body
    
    console.log('📱 WhatsApp webhook received:', JSON.stringify(req.body, null, 2))
    
    // Handle WhatsApp webhook verification
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
      console.log('✅ WhatsApp webhook verification successful')
      return res.status(200).send(req.query['hub.challenge'])
    }
    
    // Process incoming messages
    if (entry && entry[0] && entry[0].changes) {
      for (const change of entry[0].changes) {
        if (change.value && change.value.messages) {
          for (const message of change.value.messages) {
            await handleIncomingWhatsAppMessage(message, change.value.metadata)
          }
        }
      }
    }
    
    res.status(200).json({ success: true, message: 'WhatsApp webhook processed' })
    
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process WhatsApp webhook',
      message: error.message
    })
  }
})

// WhatsApp webhook verification (GET request)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'feiraja_webhook_token'
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified')
    res.status(200).send(challenge)
  } else {
    console.log('❌ WhatsApp webhook verification failed')
    res.status(403).send('Forbidden')
  }
})

// Handle incoming WhatsApp message
async function handleIncomingWhatsAppMessage(message, metadata) {
  try {
    const { from, text, type } = message
    const phoneNumber = from
    const messageText = text?.body || ''
    
    console.log('📨 New WhatsApp message:', {
      from: phoneNumber,
      type,
      message: messageText
    })
    
    // Only respond to text messages
    if (type === 'text') {
      await sendFereirajaLink(phoneNumber, messageText)
    }
    
  } catch (error) {
    console.error('❌ Error handling WhatsApp message:', error)
  }
}

// Send Feiraja link via WhatsApp
async function sendFereirajaLink(phoneNumber, originalMessage) {
  try {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.log('⚠️ WhatsApp credentials not configured')
      return
    }
    
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
    
    // Send message via WhatsApp API
    const whatsappApiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: responseMessage
      }
    }
    
    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      console.log('✅ WhatsApp message sent successfully to', phoneNumber)
      
      // Log the interaction for analytics
      console.log('📊 WhatsApp interaction logged:', {
        phoneNumber: phoneNumber.substring(0, 5) + '***', // Privacy
        timestamp: new Date().toISOString(),
        originalMessage: originalMessage.substring(0, 50) + '...',
        responseSent: true
      })
    } else {
      const errorData = await response.text()
      console.error('❌ Failed to send WhatsApp message:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error)
  }
}

export default router