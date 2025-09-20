import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { getProviders, signIn } from 'next-auth/react'

interface ErrorPageProps {
  providers: any
  error?: string
}

export default function ErrorPage({ providers, error }: ErrorPageProps) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Authentication Error</h1>
      <p>An error occurred during authentication:</p>
      <p style={{ color: 'red', fontWeight: 'bold' }}>
        {error || 'Unknown error'}
      </p>
      <div style={{ marginTop: '20px' }}>
        {Object.values(providers).map((provider: any) => (
          <div key={provider.name} style={{ margin: '10px 0' }}>
            <button
              onClick={() => signIn(provider.id)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Try again with {provider.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { error } = context.query
  const providers = await getProviders()

  return {
    props: {
      providers: providers ?? {},
      error: error ?? null,
    },
  }
}
