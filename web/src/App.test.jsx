import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, within } from '@testing-library/react'

vi.mock('@clerk/react', () => ({
  Show: ({ when, children }) => <div data-testid={`show-${when}`}>{children}</div>,
  SignInButton: () => <button>Sign In</button>,
  SignUpButton: () => <button>Sign Up</button>,
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}))

import App from './App'

afterEach(() => {
  cleanup()
})

describe('App', () => {
  test('renders a header containing both signed-out and signed-in Show blocks', () => {
    const { container } = render(<App />)

    expect(container.querySelector('header')).toBeInTheDocument()
    expect(screen.getByTestId('show-signed-out')).toBeInTheDocument()
    expect(screen.getByTestId('show-signed-in')).toBeInTheDocument()
  })

  test('renders SignInButton and SignUpButton inside the signed-out Show block', () => {
    render(<App />)

    const signedOut = within(screen.getByTestId('show-signed-out'))
    expect(signedOut.getByText('Sign In')).toBeInTheDocument()
    expect(signedOut.getByText('Sign Up')).toBeInTheDocument()
  })

  test('renders UserButton inside the signed-in Show block', () => {
    render(<App />)

    const signedIn = within(screen.getByTestId('show-signed-in'))
    expect(signedIn.getByTestId('user-button')).toBeInTheDocument()
  })

  test('does not render UserButton inside the signed-out block', () => {
    render(<App />)

    const signedOut = within(screen.getByTestId('show-signed-out'))
    expect(signedOut.queryByTestId('user-button')).not.toBeInTheDocument()
  })
})