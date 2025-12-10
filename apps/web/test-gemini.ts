const key = process.env.GEMINI_API_KEY
if (!key) {
  throw new Error('GEMINI_API_KEY is missing')
}

console.log('Fetching available models...')
try {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  const data = await response.json()
  console.log(JSON.stringify(data, null, 2))
} catch (error) {
  console.error('Error fetching models:', error)
}
