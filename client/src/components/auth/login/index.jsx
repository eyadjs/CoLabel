import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Navigate, Link } from 'react-router-dom'
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../firebase/auth'
import { useAuth } from '../../../contexts/authContexts'

function Login() {
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithEmailAndPassword(email, password)
                .catch((err) => {
                    setIsSigningIn(false)
                    setErrorMessage('Invalid credentials. Please try again.')
                })
        }
    }

    const onGoogleSignIn = (e) => {
        e.preventDefault()
        if (!isSigningIn) {
            setIsSigningIn(true)
            doSignInWithGoogle().catch((err) => {
                setIsSigningIn(false)
            })
        }
    }

    return (
        <div className="login-container">
            {userLoggedIn && <Navigate to="/dashboard" replace={true} />}
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="button-group">
                    <button type="submit" disabled={isSigningIn}>
                        {isSigningIn ? 'Signing In...' : 'Login'}
                    </button>
                    <button className="google-btn" onClick={onGoogleSignIn} disabled={isSigningIn}>
                        {isSigningIn ? 'Signing In with Google...' : 'Sign In with Google'}
                    </button>
                </div>
            </form>
            <p>
                Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
        </div>
    )
}

export default Login
