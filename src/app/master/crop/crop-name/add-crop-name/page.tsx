"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useTranslations from '@hooks/useTranslation'
import { toasterSuccess, toasterError } from '@components/core/Toaster'

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
export default function Page() {
  const router = useRouter();
  useTitle("Add Crop Name")
  const numInputs = 16;

  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
  const [inputError, setInputError] = useState({ isError: false, message: "", inputIndex: -1 });

  const handleInputChange = (index: any, value: any) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };


  const handleCancel = () => {
    setInputError({ isError: false, message: "", inputIndex: -1 });
    router.back();
  };
  const isInputEmpty = (inputValue: any) => {
    return inputValue.trim() === "";
  };
  const isCropNamesValid = (inputValues: string[]): number => {
    const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    for (const [i, value] of Object.entries(inputValues)) {
      if (value && !regex.test(value)) {
        return Number(i);
      }
    }
    return -1;
  }
  const addData = async () => {
    const url = "crop/crop-name-multiple"
    const inputData = inputValues.filter((inputValue) => {
      return inputValue != '' || null;
    });
    try {
      const response = await API.post(url, {
        "cropsName": inputData
      })
      if (response.data.pass.length > 0) {
        const dataPassed = response.data.pass;
        const passedName = dataPassed.map((name: any) => name.data.crop_name).join(', ')
        toasterSuccess(`Following crop(s) have been added successfully: ${passedName} `)
      }
      if (response.data.fail.length > 0) {
        const dataFailed = response.data.fail;
        const failedName = dataFailed.map((name: any) => name.data.crop_name).join(', ')
        toasterError(`Following crop(s) are skipped as they are already exist: ${failedName} `)
      }
      router.push('/master/crop/crop-name')
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isInputEmpty(inputValues[0])) {
      setInputError({ isError: true, message: "Crop Name is required.", inputIndex: 0 });
    } else {
      const notValidIndex = isCropNamesValid(inputValues);
      if (notValidIndex > -1) {
        setInputError({ isError: true, message: "Only letters, digits, white space, (, ), _ and - allowed.", inputIndex: notValidIndex });
      } else {
        setInputError({ isError: false, message: "", inputIndex: -1 });
        addData();
      }
    }
  };
  useEffect(() => {
    User.role()
  }, [])
  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon-home"></span>
                </Link>
              </li>
              <li>Master</li>
              <li>Crop</li>
              <li>
                <Link href="/master/crop/crop-name">
                  Crop Name
                </Link>
              </li>
              <li>Add Crop Name</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-4">
        <form onSubmit={handleSubmit}>
          <div className="columns lg:columns-4 md:columns-2 sm:columns-1 mt-3 ">
            {inputValues.map((value, index) => (
              <div key={index} className="mb-3">

                <input
                  type="text"
                  placeholder={index === 0 ? translations.crop.cropName + "*" : translations.crop.cropName}
                  value={value}
                  className={`text-center w-60 text-sm border rounded px-2 py-1 ${index === inputError.inputIndex && inputError.isError ? 'border-red-500' : 'border'}`}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />

                {inputError.isError && index === inputError.inputIndex && (
                  <p className="text-red-500 text-sm">{inputError.message}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4 border-t border-b py-2 px-2">
            <button
              type="submit"
              className="bg-green-600 text-sm rounded text-white px-2 py-1.5"
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