import app from '../src/app.js'

const PORT = process.env.PORT || 3005

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Feiraja API Server running on port ${PORT}`)
    console.log(`📡 API available at http://localhost:${PORT}/api`)
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`)
  })
}

export default app