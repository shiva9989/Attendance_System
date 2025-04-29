import { supabase } from "../pages/supabase"

export const authService = {
  // Student login using register number
  async loginStudent(registerNo, password) {
    try {
      // Query the student table
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('reg_no', registerNo)
        .single()

      if (error) throw error

      // Verify password (You should use proper password hashing in production)
      if (data && data.password === password) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          ...data,
          role: 'student'
        }))
        return { success: true, user: data }
      }
      
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Admin login using email
  async loginAdmin(email, password) {
    try {
      // Query the admin table
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error

      // Verify password (You should use proper password hashing in production)
      if (data && data.password === password) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          ...data,
          role: 'admin'
        }))
        return { success: true, user: data }
      }

      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('user')
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}