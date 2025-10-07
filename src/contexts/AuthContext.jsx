import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Load user profile after authentication
  const loadUserProfile = async (userId) => {
    if (!userId) return
    
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single()
      
      if (!error && data) {
        setUserProfile(data)
      } else {
        console.error('Error loading profile:', error)
        setUserProfile(null)
      }
    } catch (err) {
      console.error('Network error loading profile:', err)
      setUserProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  // Clear profile data
  const clearProfile = () => {
    setUserProfile(null)
    setProfileLoading(false)
  }

  // Handle authentication state changes
  const handleAuthStateChange = (event, session) => {
    console.log('Auth state changed:', event, session?.user?.id)
    setUser(session?.user ?? null)
    setLoading(false)
    
    if (session?.user) {
      loadUserProfile(session?.user?.id)
    } else {
      clearProfile()
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase?.auth?.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        if (mounted) {
          handleAuthStateChange('INITIAL_SESSION', session)
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          handleAuthStateChange(event, session)
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        console.error('SignUp error:', error)
      }
      
      return { data, error }
    } catch (error) {
      console.error('SignUp network error:', error)
      return { data: null, error: { message: 'Network error. Please try again.' } }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('Attempting sign in for:', email)
      
      const { data, error } = await supabase?.auth?.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('SignIn error:', error)
        return { data, error }
      }

      if (data?.user) {
        console.log('Sign in successful for user:', data?.user?.id)
      }
      
      return { data, error }
    } catch (error) {
      console.error('SignIn network error:', error)
      return { 
        data: null, 
        error: { 
          message: 'Network error. Please check your connection and try again.' 
        } 
      }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase?.auth?.signOut()
      
      if (!error) {
        setUser(null)
        clearProfile()
        // Clear localStorage
        localStorage.removeItem('isAuthenticated')
      }
      
      return { error }
    } catch (error) {
      console.error('SignOut error:', error)
      return { error: { message: 'Error signing out. Please try again.' } }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    try {
      setProfileLoading(true)
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', user?.id)
        ?.select()
        ?.single()
        
      if (!error && data) {
        setUserProfile(data)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error: { message: 'Network error. Please try again.' } }
    } finally {
      setProfileLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`,
      })
      
      return { data, error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error: { message: 'Network error. Please try again.' } }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,
    // Helper functions for role checking
    isSuperAdmin: () => userProfile?.role === 'super_admin',
    isSchoolAdmin: () => userProfile?.role === 'school_admin',
    isTeacher: () => userProfile?.role === 'teacher',
    isParent: () => userProfile?.role === 'parent',
    isStudent: () => userProfile?.role === 'student'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}