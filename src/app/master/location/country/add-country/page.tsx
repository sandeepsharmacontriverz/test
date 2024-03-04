"use client";
import PageHeader from "@components/core/PageHeader";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useTranslations from "@hooks/useTranslation";
import { toasterSuccess, toasterError } from "@components/core/Toaster";

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
export default function Page() {
  const router = useRouter();
  useTitle("Add Country");

  const numInputs = 16;

  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(new Array(numInputs).fill(""));

  // const handleInputChange = (index: any, value: any) => {
  //   const newInputValues = [...inputValues];
  //   newInputValues[index] = value;
  //   setInputValues(newInputValues);
  // };

  const handleInputChange = (
    index: number,
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
    // Check if the backspace key is pressed and the input value is empty
    const isBackspaceAndEmpty =
      (event.nativeEvent as InputEvent).inputType === "deleteContentBackward" &&
      value === "";

    // Check if the value is already entered in another field
    const isValueAlreadyEntered = newInputValues.some(
      (input, i) =>
        input.trim().toLowerCase() === value.trim().toLowerCase() && i !== index
    );

    if (isBackspaceAndEmpty || !isValueAlreadyEntered) {
      setError((prevError) => {
        const newError = [...prevError];
        newError[index] = "";
        return newError;
      });
    } else {
      setError((prevError) => {
        const newError = [...prevError];
        newError[index] = "Value already entered in another field.";
        return newError;
      });
    }
  };

  useEffect(() => {
    User.role();
  }, []);

  const handleCancel = () => {
    setIsError(false);
    router.back();
  };

  // const handleSubmit = async () => {
  //   const url = "location/set-country";

  //   let isError = false;
  //   const newError = new Array(numInputs).fill("");
  //   inputValues.map((inputValue, index) => {
  //     const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
  //     const valid = regex.test(inputValue);
  //     if (index === 0 && inputValue === "") {
  //       newError[index] = "Country Name is required.";
  //       isError = true;
  //     } else if (!valid) {
  //       if (inputValue != "") {
  //         newError[index] =
  //           "Enter Only Alphabets, Digits, Space, (, ), - and _";
  //         isError = true;
  //       }
  //     }
  //   });
  //   setError(newError);

  //   if (!isError) {
  //     const inputData = inputValues.filter((inputValue) => {
  //       return inputValue != "" || null;
  //     });

  //     try {
  //       const response = await API.post(url, {
  //         countryName: inputData,
  //       });
  //       if (response.success) {
  //         if (response.data.pass.length > 0) {
  //           const dataPassed = response.data.pass;
  //           const passedName = dataPassed
  //             .map((name: any) => name.data.county_name)
  //             .join(", ");
  //           toasterSuccess(
  //             `Following country/countries have been added successfully: ${passedName} `
  //           );
  //         }
  //         if (response.data.fail.length > 0) {
  //           const dataFailed = response.data.fail;
  //           const failedName = dataFailed
  //             .map((name: any) => name.data.county_name)
  //             .join(", ");
  //           toasterError(
  //             `Following country/countries have been skipped as they already exist: ${failedName} `
  //           );
  //         }
  //         router.push("/master/location/country");
  //       }
  //     } catch (error) {
  //       console.log(error, "error");
  //       return { data: [], total: 0 };
  //     }
  //   }
  // };

  const handleSubmit = async () => {
    const url = "location/set-country";

    let hasError = false;
    const newError = new Array(numInputs).fill("");

    inputValues.forEach((inputValue, index) => {
      const regexAlphabets = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regexAlphabets.test(inputValue.trim());

      if (index === 0 && inputValue.trim() === "") {
        newError[index] = "Country Name is required.";
        hasError = true;
      } else if (!valid) {
        if (inputValue.trim() !== "") {
          newError[index] = "Accepts only Alphabets";
          hasError = true;
        }
      } else if (inputValue.trim() !== "" && valid) {
        const isValueAlreadyEntered = inputValues.some(
          (input, i) =>
            input.trim().toLowerCase() === inputValue.trim().toLowerCase() &&
            i !== index
        );
        if (isValueAlreadyEntered) {
          newError[index] = "Value already entered in another field.";
          hasError = true;
        }
      }
    });

    setError(newError);

    if (!hasError) {
      const inputData = inputValues.filter(
        (inputValue) => inputValue.trim() !== ""
      );

      try {
        const response = await API.post(url, {
          countryName: inputData,
        });

        if (response.success) {
          // Handle success response
          if (response.data.pass.length > 0) {
            // Handle passed data
            const dataPassed = response.data.pass;
            const passedName = dataPassed
              .map((name: any) => name.data.county_name)
              .join(", ");
            toasterSuccess(
              `Following country/countries have been added successfully: ${passedName} `
            );
          }

          if (response.data.fail.length > 0) {
            // Handle failed data
            const dataFailed: any = response.data.fail;
            const failedName = dataFailed
              .map((name: any) => name.data.county_name)
              .join(", ");
            toasterError(
              `Following country/countries have been skipped as they already exist: ${failedName} `
            );
          } else {
            router.push("/master/location/country");
            setError(new Array(numInputs).fill(""));
          }
        }
      } catch (error) {
        console.log(error, "error");
        // Handle API request error
        setError(new Array(numInputs).fill("API request error"));
      }
    }
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <Link href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Master</li>
              <li>Location</li>
              <li>
                <Link href="/master/location/country">Country</Link>
              </li>
              <li>Add Country</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <form onSubmit={handleSubmit}>
          <div className=" columns-4 mt-3 lg:columns-4 sm:columns-2">
            {inputValues.map((value, index) => (
              <div key={index} className="mb-3 mx-3">
                <div>
                  <input
                    key={index}
                    type="text"
                    placeholder={
                      index === 0
                        ? translations.location.countryName + "*"
                        : translations.location.countryName
                    }
                    value={value}
                    className={`text-center text-sm border rounded px-2 py-1 ${
                      error[index] !== "" ? "border-red-500" : "border"
                    }`}
                    onChange={(e) =>
                      handleInputChange(index, e.target.value, e)
                    }
                  />
                </div>
                {error[index] !== "" && (
                  <p className="text-red-500 text-sm">{error[index]}</p>
                )}
              </div>
            ))}
          </div>
          <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-600 text-sm rounded text-white px-2 py-1.5 "
            >
              {translations.common.submit}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-sm rounded text-black px-2 py-1.5"
            >
              {translations.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
