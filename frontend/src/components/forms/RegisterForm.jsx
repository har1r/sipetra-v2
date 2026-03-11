import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <form className="flex flex-col gap-4">
      <div className="space-y-3">
        <Input placeholder="Full Name" name="name" />
        <Input placeholder="Email Address" name="email" type="email" />
        <Input placeholder="Create Password" name="password" type="password" />
      </div>

      <div className="pt-4">
        <Button type="submit">Join SIPETRA</Button>
      </div>
    </form>
  );
};

export default RegisterForm;
