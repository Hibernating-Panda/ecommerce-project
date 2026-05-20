import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("openAuthPopup", {
        detail: {
          type: "login",
          message: "",
        },
      })
    );

    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}

export default LoginPage;