import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import "../../assets/css/login.css";
import { useDispatch } from "react-redux";
import { registerUser } from "../../library/store/registration";
import { authenticateUser } from "../../library/store/authentication";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { useFormik, Form, FormikProvider } from "formik";
import { Link } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, Typography, Box } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import OnboardingFlow from "../../components/onboarding/OnboardingFlow";
import { postMethod } from "../../library/api";
import onboardingManager from "../../utils/onboardingManager";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cleanup countdown on component unmount
  useEffect(() => {
    return () => {
      setRedirectCountdown(0);
      setIsRedirecting(false);
    };
  }, []);

  const RegistrationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: RegistrationSchema,
    onSubmit: async (data) => {
      console.log(data);
      try {
        const response = await dispatch(registerUser(data)).unwrap();
        
        // Auto-login the user after successful registration
        try {
          const loginCredentials = {
            username: data.username,
            password: data.password
          };
          await dispatch(authenticateUser(loginCredentials)).unwrap();
          console.log('User automatically logged in after registration');
        } catch (loginError) {
          console.log('Auto-login failed after registration:', loginError);
          // If auto-login fails, still proceed with registration success but redirect to login
          setDialogMessage('Account created successfully! Please log in to continue.');
          setIsError(false);
          setRegistrationComplete(false);
          setOpenDialog(true);
          formik.setSubmitting(false);
          return;
        }
        
        // Initialize onboarding for the new user
        try {
          await postMethod('onboarding/start');
          // Mark user as new user in the onboarding manager
          onboardingManager.markAsNewUser();
        } catch (onboardingError) {
          console.log('Onboarding initialization failed:', onboardingError);
        }
        
        setDialogMessage('Account created successfully! Welcome to Opslync.');
        setIsError(false);
        setRegistrationComplete(true);
        setOpenDialog(true);
        setIsRedirecting(true);
        setRedirectCountdown(3); // Start 3-second countdown
        
        // Start countdown timer
        const countdownInterval = setInterval(() => {
          setRedirectCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setOpenDialog(false);
              setShowOnboarding(true); // Show onboarding instead of redirecting to login
              formik.setSubmitting(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } catch (error) {
        if (error.message.includes('Request failed with status code 400')) {
          setDialogMessage('Error: Username already exists. Please choose a different username.');
        } else {
          setDialogMessage(`Registration failed: ${error.message}`);
        }
        setIsError(true);
        setOpenDialog(true);
        formik.setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit } = formik;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // After onboarding completion, redirect to overview
    localStorage.setItem('registration-onboarding-completed', 'true');
    history.push('/overview');
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // If user closes onboarding, still redirect to overview since they're registered
    history.push('/overview');
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    // If user skips onboarding, redirect to overview
    history.push('/overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-300">Join Opslync and get started</p>
          </div>

          {/* Registration form */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-gray-700">
            <FormikProvider value={formik}>
              <Form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <InputText
                      id="username"
                      name="username"
                      value={formik.values.username}
                      onChange={formik.handleChange}
                      className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        Boolean(touched.username && errors.username) ? 'border-red-400' : ''
                      }`}
                      placeholder="Enter your username"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {Boolean(touched.username && errors.username) && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.username}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <InputText
                      id="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        Boolean(touched.email && errors.email) ? 'border-red-400' : ''
                      }`}
                      placeholder="Enter your email"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {Boolean(touched.email && errors.email) && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <InputText
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      className={`w-full px-3 py-2 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        Boolean(touched.password && errors.password) ? 'border-red-400' : ''
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {Boolean(touched.password && errors.password) && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <InputText
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      className={`w-full px-3 py-2 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        Boolean(touched.confirmPassword && errors.confirmPassword) ? 'border-red-400' : ''
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {Boolean(touched.confirmPassword && errors.confirmPassword) && (
                    <p className="mt-1 text-sm text-red-400">{formik.errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  label={isSubmitting ? "Creating Account..." : "Create Account"}
                  icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
                  iconPos="right"
                  loading={isSubmitting}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </Form>
            </FormikProvider>

            <div className="mt-4 text-center">
              <p className="text-slate-300">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={openDialog} 
        onClose={isRedirecting ? undefined : () => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '8px'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            {isError ? (
              <Error color="error" sx={{ fontSize: 32 }} />
            ) : (
              <CheckCircle color="success" sx={{ fontSize: 32 }} />
            )}
            <Typography variant="h6" component="span">
              {isError ? 'Registration Failed' : 'Registration Successful!'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <DialogContentText sx={{ fontSize: '16px', mb: 2 }}>
            {dialogMessage}
          </DialogContentText>
          
          {isRedirecting && !isError && (
            <Box sx={{ mt: 3 }}>
              <CircularProgress size={24} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Starting your setup guide in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        {!isRedirecting && (
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => {
                setOpenDialog(false);
                if (!isError) {
                  if (registrationComplete) {
                    setShowOnboarding(true);
                  } else {
                    history.push('/login');
                  }
                }
              }} 
              variant="contained"
              color={isError ? "error" : "primary"}
              sx={{ 
                borderRadius: '8px',
                px: 4,
                py: 1
              }}
            >
              {isError ? 'Try Again' : (registrationComplete ? 'Start Setup Guide' : 'Continue to Login')}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Onboarding Flow for New Users */}
      <OnboardingFlow
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
