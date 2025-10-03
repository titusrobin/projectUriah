// pages/api/debug/env.ts
// Debug endpoint to check environment variables
// Remove this in production!

export default function handler(req: any, res: any) {
  // Allow in production for debugging purposes - remove later
  // if (process.env.NODE_ENV === 'production') {
  //   return res.status(404).json({ error: 'Not found' });
  // }

  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
    EMAIL_SERVER: process.env.EMAIL_SERVER ? '✅ Set' : '❌ Missing',
    EMAIL_FROM: process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing',
  };

  res.status(200).json({
    message: 'Environment Variables Check',
    environment: process.env.NODE_ENV,
    variables: envVars,
    note: 'This endpoint should be removed in production'
  });
}
