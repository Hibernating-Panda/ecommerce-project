import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("openAuthPopup", {
        detail: {
          type: "register",
          message: "",
        },
      })
    );

    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default RegisterPage;