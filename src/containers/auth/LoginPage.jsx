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

export default function LoginPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loginError, setLoginError] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

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
          
          history.push("/overview");
        }
      } catch (err) {
        setLoginError('Username or password is incorrect.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit } = formik;

  return (
    <div className="form-box">
      <div className="fullHeight p-ai-center p-d-flex p-jc-center">
        <div className="shadow card m-3 px-3 py-4 px-sm-4 py-sm-5">
          <h4 className="text-center">Sign in to Opslync</h4>
          {showWelcomeMessage && (
            <div className="p-3 mb-3 bg-green-100 border border-green-300 rounded text-center">
              <p className="text-green-800 font-semibold mb-1">🎉 Setup Complete!</p>
              <p className="text-green-700 text-sm">Your account is ready. Please sign in to start using Opslync.</p>
            </div>
          )}
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

              {loginError && (
                <div className="p-field">
                  <small className="p-error">{loginError}</small>
                </div>
              )}

              <div className="submitBtnBox">
                <Button
                  type="submit"
                  label="Login"
                  iconPos="right"
                  loading={isSubmitting}
                  className="mt-4 submitBtn"
                  disabled={isSubmitting}
                />
              </div>

              <div className="signupBox mt-3 text-center">
                Don't have an account? <Link to="/register">Get started</Link>
              </div>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </div>
  );
}
