import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '../Services/authServices';

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (role === 'student') {
        result = await authService.loginStudent(formData.identifier, formData.password);
      } else {
        result = await authService.loginAdmin(formData.identifier, formData.password);
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 space-y-2">
          <h2 className="text-2xl font-bold text-center text-gray-900">Welcome Back</h2>
          <p className="text-center text-gray-600">
            Please sign in to continue
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 p-1 rounded-lg bg-gray-100">
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors ${
                  role === 'student' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md transition-colors ${
                  role === 'admin' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>

            {/* Identifier Field */}
            <div className="space-y-2">
              <label 
                className="text-sm font-medium text-gray-700" 
                htmlFor="identifier"
              >
                {role === 'student' ? 'Register Number' : 'Email'}
              </label>
              <input
                id="identifier"
                type={role === 'admin' ? 'email' : 'text'}
                placeholder={role === 'student' ? 'Enter your register number' : 'Enter your email'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                className="text-sm font-medium text-gray-700" 
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center text-sm text-gray-600">
          {role === 'student' ? (
            <p>New student? Contact your administrator for access</p>
          ) : (
            <p>Admin access is restricted. Please verify your credentials</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;