import React, { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth'
import { useAuth } from '../../../contexts/authContexts'

function Register() {

    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!isRegistering) {
            setIsRegistering(true)
            if (password === confirmPassword) {
                await doCreateUserWithEmailAndPassword(email, password)
            } else {
                setErrorMessage('Passwords do not match')
                setIsRegistering(false)
            }
        }
    }

    return (
        <div className="register-container">
            {userLoggedIn && <Navigate to="/dashboard" replace={true} />}
            <h2>Register</h2>
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
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="button-group">
                    <button type="submit" disabled={isRegistering}>
                        {isRegistering ? 'Registering...' : 'Register'}
                    </button>
                </div>
            </form>
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    )
}

export default Register
