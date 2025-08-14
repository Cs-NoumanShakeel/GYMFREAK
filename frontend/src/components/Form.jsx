import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import { useUser } from "../context/UserContext";



function Form({ route, method }) {
  
  const { setUser } = useUser();
   const [username, setUsername] = useState("")

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Minimum 6 characters
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username); // 3+ chars, alphanumeric + underscore
  };

  // Client-side validation
  const validateFields = () => {
    const errors = {};
    
    // Check empty fields
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (!validateUsername(username)) {
      errors.username = "Username must be at least 3 characters and contain only letters, numbers, and underscores";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (!validatePassword(password)) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (method === "register") {
      if (!email.trim()) {
        errors.email = "Email is required";
      } else if (!validateEmail(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    return errors;
  };

  // Parse server errors
  const parseServerError = (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle different status codes
      switch (status) {
        case 400:
          // Bad request - validation errors
          if (data.username) {
            if (Array.isArray(data.username)) {
              return data.username[0];
            }
            return data.username;
          }
          if (data.email) {
            if (Array.isArray(data.email)) {
              return data.email[0];
            }
            return data.email;
          }
          if (data.password) {
            if (Array.isArray(data.password)) {
              return data.password[0];
            }
            return data.password;
          }
          if (data.non_field_errors) {
            if (Array.isArray(data.non_field_errors)) {
              return data.non_field_errors[0];
            }
            return data.non_field_errors;
          }
          if (data.detail) {
            return data.detail;
          }
          return "Please check your input and try again";

        case 401:
          // Unauthorized - wrong credentials
          if (method === "login") {
            return "Invalid username or password. Please check your credentials and try again";
          }
          return "Authentication failed";

        case 403:
          // Forbidden
          return "Access denied. Please check your permissions";

        case 404:
          // Not found
          return "Service not available. Please try again later";

        case 409:
          // Conflict - usually duplicate data
          return "Username already exists. Please choose a different username";

        case 422:
          // Unprocessable entity
          return "Invalid data provided. Please check your input";

        case 500:
          // Server error
          return "Server error. Please try again later";

        default:
          return `Error ${status}: Something went wrong. Please try again`;
      }
    } else if (error.request) {
      // Network error
      return "Network error. Please check your internet connection and try again";
    } else {
      // Other error
      return "An unexpected error occurred. Please try again";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.clear()

    
    // Clear previous errors
    setError(null);
    setFieldErrors({});

    // Client-side validation
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = method === "login"
        ? { username: username.trim(), password }
        : { username: username.trim(), email: email.trim(), password };

     
      const res = await api.post(route, payload);
      setUser(res.data.username)

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
        setUser(username)
      }

      // Success message for registration
      if (method === "register") {
        setError({ type: "success", message: "Account created successfully! Redirecting..." });
       
        navigate("/");
       
      } else {
        navigate("/");
      }

    } catch (err) {
      const errorMessage = parseServerError(err);
      setError({ type: "error", message: errorMessage });
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get input class based on field errors
  const getInputClass = (fieldName) => {
    let baseClass = "form-input";
    if (fieldErrors[fieldName]) {
      baseClass += " error";
    }
    return baseClass;
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>

        {/* Global error/success message */}
        {error && (
          <div className={error.type === "success" ? "success-message" : "error-message"}>
            {error.message}
          </div>
        )}

        {/* Username field */}
        <div className="input-group">
          <input
            className={getInputClass("username")}
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              
              // Clear field error when user starts typing
              if (fieldErrors.username) {
                setFieldErrors(prev => ({ ...prev, username: null }));
              }
            }}
            placeholder="Username"
            disabled={loading}
          />
          {fieldErrors.username && (
            <div className="field-error">{fieldErrors.username}</div>
          )}
        </div>

        {/* Password field */}
        <div className="input-group">
          <input
            className={getInputClass("password")}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              // Clear field error when user starts typing
              if (fieldErrors.password) {
                setFieldErrors(prev => ({ ...prev, password: null }));
              }
            }}
            placeholder="Password"
            disabled={loading}
          />
          {fieldErrors.password && (
            <div className="field-error">{fieldErrors.password}</div>
          )}
        </div>

        {/* Email field for registration */}
        {name === 'Register' && (
          <div className="input-group">
            <input
              className={getInputClass("email")}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear field error when user starts typing
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: null }));
                }
              }}
              placeholder="Email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <div className="field-error">{fieldErrors.email}</div>
            )}
          </div>
        )}

        <button 
          className="form-button" 
          type="submit" 
          disabled={loading}
        >
          {loading ? (method === "login" ? "Logging in..." : "Creating Account...") : name}
        </button>

        <div className="form-links">
          <Link to="/login">Already have an account?</Link>
          <Link to="/register">Make an Account</Link>
        </div>
      </form>
    </div>
  );
}

export default Form;