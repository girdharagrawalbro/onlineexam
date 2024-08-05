import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import UserContext from "../context/users/UserState"

const LoginForm = () => {
    const [credentials, setCredentials] = useState({ registrationNumber: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState(null);

    // const {setUser, setLoading } = UserContext();
    const navigate = useNavigate();

    useEffect(() => {
        // Load stored credentials if available
        const storedCredentials = JSON.parse(localStorage.getItem('credentials'));
        if (storedCredentials) {
            setCredentials(storedCredentials);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear any previous errors
        // setLoading(true)
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    registrationNumber: credentials.registrationNumber,
                    password: credentials.password
                })
            });

            const json = await response.json();
            if (!response.ok || !json.success) {
                // Handle HTTP errors and unsuccessful login attempts
                setError(json.error || 'Failed to login. Please try again.');
                return;
            }
            else if(response.ok||json.success){
                    // setUser(json)
                // Save the auth token
                localStorage.setItem('token', json.authtoken);
                navigate(`/user/${json.authtoken}`);
            }

            // Store credentials if "Remember me" is checked
            if (rememberMe) {
                localStorage.setItem('credentials', JSON.stringify(credentials));
            } else {
                localStorage.removeItem('credentials');
            }
        } catch (error) {
            setError('Failed to login. Please try again.');
        }
        finally{
            // setLoading(false)
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const handleRememberMeChange = (e) => {
        setRememberMe(e.target.checked);
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="registrationNumber" className="form-label">
                        Registration Number
                    </label>
                    <input
                        type="text"
                        id="registrationNumber"
                        value={credentials.registrationNumber}
                        onChange={onChange}
                        name="registrationNumber"
                        className="form-control"
                        aria-describedby="registrationNumberHelp"
                    />
                    <div id="registrationNumberHelp" className="form-text">
                        We'll never share your details with anyone else.
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={credentials.password}
                        onChange={onChange}
                        name="password"
                        className="form-control"
                    />
                </div>
                <div className="mb-3 form-check">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                    </label>
                </div>
                <button type="submit" className="btn btn-primary">
                    Login
                </button>
                {error && <p className="text-danger mt-2">{error}</p>}
            </form>
            <div className="py-4 text-light">
                <h5>
                    Not Registered?{" "}
                    <Link
                        className="text-light"
                        to="/register"
                        style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                        }}
                    >
                        Register Now
                    </Link>
                </h5>
            </div>
        </div>
    );
};

export default LoginForm;
