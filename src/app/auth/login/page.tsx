"use client";
import Form from "@components/auth-form/Form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import API from "@lib/Api";
import Route from "@lib/Route";
import Head from "next/head";
import { useLoading } from "context/LoadingContext";

const Login = () => {
  const router = useRouter();
  const { setLoading }: any = useLoading();
  const formFields = [
    { name: "username", type: "text", placeholder: "Username", title: "Username" },
    { name: "password", type: "password", placeholder: "Password", title: "Password" },
  ];

  const loadScript = (src: any) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);

    });

  async function loadScriptsSequentially() {
    try {
      let scriptElements = document.head.getElementsByTagName("script");

      // Convert the HTMLCollection to an array for easier manipulation
      var scriptArray = Array.from(scriptElements);

      // Iterate through each <script> element and remove it
      scriptArray.forEach(function (script) {
        document.head.removeChild(script);
      });
      setTimeout(async () => {
        await loadScript('/js/jquery.js');
        await loadScript('/js/popper.min.js');
        await loadScript('/js/bootstrap.min.js');
        await loadScript('/js/mCustomScrollbar.min.js')
        await loadScript('/js/slick.min.js')
        await loadScript('/js/select2.min.js')
        await loadScript('/js/custom.js')
      }, 1000);
    } catch (error) {
      // Handle error
      console.log(error)
    }
  }

  const loadCSS = (href: any) =>
    new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });

  async function loadStylesSequentially() {
    try {
      // Array of CSS file URLs
      const cssFiles = [
        '/css/external.css',
        // Add more CSS files as needed
      ];

      for (const cssFile of cssFiles) {
        await loadCSS(cssFile);
      }

      setTimeout(async () => {
        await loadScript('/js/bootstrap.min.js');
        await loadCSS('/css/external.css');
      }, 1000);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  }

  const [errorMessage, setErrorMessage] = useState<{ [key: string]: string | null }>({});
  const handleFormSubmit = async (formData: { [key: string]: any }) => {
    // Perform form submission logic or API request here
    try {
      const result = await API.post(
        "auth/signin",
        formData
      );
      if (result.data) {
        setLoading(true);
        localStorage.setItem("accessToken", result.data.accessToken)
        if (result.data.isAgreementAgreed) {
          router.push("/");
          // loadScriptsSequentially();
          // loadStylesSequentially();
        } else {
          router.push(`/auth/user-agreement?id=${result.data.user.id}`);
        }
      }
      else {
        let field;
        let res;
        if (result.error.code === "ERR_AUTH_WRONG_USERNAME") {
          field = "username"
          res = "Invalid Username"
        }
        else {
          field = "password"
          res = "Wrong Password"
        }
        setErrorMessage({
          ...errorMessage,
          [field]: res,
        });
      }

    } catch (error) {
      console.log(error);

    }
  };

  return (
    <div>
      <Form
        titleBold="Sign in"
        titleNormal="to your Account"
        fields={formFields}
        rememberMe={true}
        buttonText="Submit"
        linkText="Forgot Password?"
        linkUrl="/auth/forgot-password"
        onSubmit={handleFormSubmit}
        error={errorMessage}
      />

    </div>
  );
};

export default Login;
