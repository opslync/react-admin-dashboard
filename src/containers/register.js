import React from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import "../assets/css/login.css";
import { useDispatch } from "react-redux";
import { registerUser } from "../library/store/registration";
import { useHistory } from "react-router-dom";
import * as Yup from "yup";
import { useFormik, Form, FormikProvider } from "formik";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const history = useHistory();

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
    onSubmit: (data) => {
      console.log(data);
      dispatch(registerUser(data));
      setTimeout(() => {
        formik.setSubmitting(false);
      }, 2000);
    },
  });

  const { errors, touched, isSubmitting, handleSubmit } = formik;

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
    </div>
  );
}
