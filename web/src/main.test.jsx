import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { StrictMode } from 'react'
import { ClerkProvider } from '@clerk/react'
import App from './App'

const renderMock = vi.fn()
const createRootMock = vi.fn(() => ({ render: renderMock }))

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}))

vi.mock('./App', () => ({
  default: vi.fn(() => null),
}))

vi.mock('@clerk/react', () => ({
  ClerkProvider: vi.fn(({ children }) => children),
}))

describe('main.jsx entry point', () => {
  beforeEach(() => {
    vi.resetModules()
    createRootMock.mockClear()
    renderMock.mockClear()
    document.body.innerHTML = '<div id="root"></div>'
    vi.stubEnv('VITE_CLERK_PUBLISHABLE_KEY', 'pk_test_123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('mounts the app into the #root DOM element via createRoot', async () => {
    await import('./main.jsx')

    const rootElement = document.getElementById('root')
    expect(createRootMock).toHaveBeenCalledWith(rootElement)
    expect(renderMock).toHaveBeenCalledTimes(1)
  })

  test('renders App wrapped in ClerkProvider (with the configured key) inside StrictMode', async () => {
    await import('./main.jsx')

    const strictModeElement = renderMock.mock.calls[0][0]
    expect(strictModeElement.type).toBe(StrictMode)

    const clerkProviderElement = strictModeElement.props.children
    expect(clerkProviderElement.type).toBe(ClerkProvider)
    expect(clerkProviderElement.props.publishableKey).toBe('pk_test_123')

    const appElement = clerkProviderElement.props.children
    expect(appElement.type).toBe(App)
  })

  test('passes an undefined publishableKey through when the env var is not set', async () => {
    vi.unstubAllEnvs()

    await import('./main.jsx')

    const strictModeElement = renderMock.mock.calls[0][0]
    const clerkProviderElement = strictModeElement.props.children
    expect(clerkProviderElement.props.publishableKey).toBeUndefined()
  })
})