import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { config } from './config/wagmi';
import { PokemonApp } from './components/PokemonApp';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">
          <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: '40%',
              height: '40%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-15%',
              left: '-10%',
              width: '50%',
              height: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)',
                  transform: 'rotate(-5deg)'
                }}>
                  🎴
                </div>
                <div>
                  <h1 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #fff, #f0f0f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em'
                  }}>
                    RWA Pokemon Cards
                  </h1>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                  }}>
                    Confidential NFT Ownership with FHE
                  </p>
                </div>
              </div>
              <ConnectButton />
            </div>

            {/* Main Content */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              paddingTop: '1rem'
            }}>
              <PokemonApp />
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              position: 'relative',
              zIndex: 1
            }}>
              <p style={{ margin: 0 }}>
                Powered by <strong>Zama fhEVM</strong> • Built with ❤️ for Web3
              </p>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App
