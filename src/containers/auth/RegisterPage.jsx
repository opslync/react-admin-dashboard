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
    <div className="form-box">
      <div className="fullHeight p-ai-center p-d-flex p-jc-center">
        <div className="shadow card m-3 px-3 py-4 px-sm-4 py-sm-5">
          <h4 className="text-center">Sign Up to Opslync</h4>
          <p className="text-center mb-3"></p>
          <FormikProvider value={formik}>
            <Form onSubmit={handleSubmit} className="p-fluid">
              <div className="p-field">
                <span className="p-float-label">
                  <InputText
                    id="username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": Boolean(touched.username && errors.username) })}
                  />
                  <label htmlFor="username" className={classNames({ "p-error": Boolean(touched.username && errors.username) })}>
                    Username*
                  </label>
                </span>
                {Boolean(touched.username && errors.username) && (
                  <small className="p-error">{formik.errors.username}</small>
                )}
              </div>

              <div className="p-field">
                <span className="p-float-label">
                  <InputText
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": Boolean(touched.email && errors.email) })}
                  />
                  <label htmlFor="email" className={classNames({ "p-error": Boolean(touched.email && errors.email) })}>
                    Email*
                  </label>
                </span>
                {Boolean(touched.email && errors.email) && (
                  <small className="p-error">{formik.errors.email}</small>
                )}
              </div>

              <div className="p-field">
                <span className="p-float-label">
                  <Password
                    id="password"
                    name="password"
                    toggleMask
                    feedback={false}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": Boolean(touched.password && errors.password) })}
                  />
                  <label htmlFor="password" className={classNames({ "p-error": Boolean(touched.password && errors.password) })}>
                    Password*
                  </label>
                </span>
                {Boolean(touched.password && errors.password) && (
                  <small className="p-error">{formik.errors.password}</small>
                )}
              </div>

              <div className="p-field">
                <span className="p-float-label">
                  <Password
                    id="confirmPassword"
                    name="confirmPassword"
                    toggleMask
                    feedback={false}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    className={classNames({ "p-invalid": Boolean(touched.confirmPassword && errors.confirmPassword) })}
                  />
                  <label htmlFor="confirmPassword" className={classNames({ "p-error": Boolean(touched.confirmPassword && errors.confirmPassword) })}>
                    Confirm Password*
                  </label>
                </span>
                {Boolean(touched.confirmPassword && errors.confirmPassword) && (
                  <small className="p-error">{formik.errors.confirmPassword}</small>
                )}
              </div>

              <div className="submitBtnBox">
                <Button
                  type="submit"
                  label="Register"
                  iconPos="right"
                  loading={isSubmitting}
                  className="mt-4 submitBtn"
                  disabled={isSubmitting}
                />
              </div>

              <div className="signupBox mt-3 text-center">
                Already have an account? <Link to="/login">Log In</Link>
              </div>

            </Form>
          </FormikProvider>
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
