import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/forms/RegisterForm";

const RegisterPage = () => {
  return (
    <AuthLayout title="New Account">
      <RegisterForm />

      <div className="mt-10 pt-8 border-t border-givsum-text/5 text-center">
        <p className="text-[11px] font-black text-givsum-text/40 uppercase tracking-[0.2em] mb-3">
          Member of our community?
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-full border-2 border-givsum-text/10 
          text-xs font-black text-givsum-text uppercase tracking-widest
          hover:bg-givsum-text hover:text-white transition-all duration-500"
        >
          Login Here
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
