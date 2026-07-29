import './App.css'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

/**
 * Renders authentication controls based on the user's sign-in status.
 * @returns {JSX.Element} The application header with sign-in, sign-up, or user controls.
 */
function App() {
  return (
    <>
      <header>
        <Show when="signed-out">
          <SignInButton />
          <SignUpButton />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>
    </>
  )
}

export default App