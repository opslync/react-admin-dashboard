import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import "../assets/css/login.css";
import { useDispatch } from "react-redux";
import { authenticateUser } from "../library/store/authentication";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { useFormik, Form, FormikProvider } from "formik";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      history.push('/overview');
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
                Don’t have an account? <Link to="/register">Get started</Link>
              </div>
            </Form>
          </FormikProvider>
        </div>
      </div>
    </div>
  );
}
