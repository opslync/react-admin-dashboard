import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import "../../assets/css/login.css";
import { useDispatch } from "react-redux";
import { authenticateUser } from "../../library/store/authentication";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { useFormik, Form, FormikProvider } from "formik";
import { Link } from "react-router-dom";
import { getMethod } from "../../library/api";
import githubTokenManager from '../../utils/githubTokenManager';
import OnboardingFlow from "../../components/onboarding/OnboardingFlow";
import onboardingManager from "../../utils/onboardingManager";

export default function LoginPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loginError, setLoginError] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      history.push('/overview');
    }

    // Check if user completed onboarding during registration
    const completedOnboarding = localStorage.getItem('registration-onboarding-completed');
    if (completedOnboarding) {
      setShowWelcomeMessage(true);
      localStorage.removeItem('registration-onboarding-completed');
      // Auto-hide message after 5 seconds
      setTimeout(() => setShowWelcomeMessage(false), 5000);
    }
  }, [history]);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (data, { setSubmitting }) => {
      try {
        const response = await dispatch(authenticateUser(data)).unwrap();
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          
          // Initialize GitHub token manager immediately (no delay)
          console.log('🚀 Initializing GitHub Token Manager after login...');
          try {
            const result = await githubTokenManager.initialize();
            console.log('GitHub Token Manager initialization result:', result);
          } catch (error) {
            console.log('GitHub Token Manager initialization failed (normal for users without GitHub apps):', error);
          }
          
          // Check if user needs to complete onboarding
          try {
            const onboardingStatus = await onboardingManager.checkOnboardingStatus();
            console.log('Onboarding status after login:', onboardingStatus);
            
            if (onboardingStatus.needsOnboarding) {
              // Show onboarding flow instead of redirecting to overview
              setShowOnboarding(true);
            } else {
              // User has completed onboarding, redirect to overview
              history.push("/overview");
            }
          } catch (onboardingError) {
            console.log('Failed to check onboarding status:', onboardingError);
            // If we can't check onboarding status, redirect to overview
            history.push("/overview");
          }
        }
      } catch (err) {
        setLoginError('Username or password is incorrect.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit } = formik;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // After onboarding completion, redirect to overview
    history.push('/overview');
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // If user closes onboarding, still redirect to overview since they're logged in
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
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-300">Sign in to your Opslync account</p>
          </div>

          {/* Login form */}
          <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
            {showWelcomeMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-400">Setup Complete!</p>
                    <p className="text-sm text-green-300">Your account is ready. Please sign in to start using Opslync.</p>
                  </div>
                </div>
              </div>
            )}

            <FormikProvider value={formik}>
              <Form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
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

                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
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

                {loginError && (
                  <div className="p-4 mb-6 bg-red-500/20 border border-red-400/30 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-sm text-red-400">{loginError}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  label={isSubmitting ? "Signing in..." : "Sign In"}
                  icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
                  iconPos="right"
                  loading={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </Form>
            </FormikProvider>

            <div className="mt-6 text-center">
              <p className="text-slate-300">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                  Get started
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Flow for Users Who Need to Complete Setup */}
      <OnboardingFlow
        open={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
