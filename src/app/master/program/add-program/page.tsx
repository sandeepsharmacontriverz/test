"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";

export default function addFarmItem() {
  const numInputs = 16;
  useTitle("Add Program");
  const [roleLoading] = useRole();
  const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));

  const [error, setError] = useState(new Array(numInputs).fill(""))

  const handleInputChange = (index: any, value: any) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const router = useRouter();
  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async () => {
    const url = "program/multiple"
    let isError = false;
    const newError = new Array(numInputs).fill("");
    inputValues.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError[index] = 'Program Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError(newError)



    if (!isError) {
      const inputData = inputValues.filter((inputValue) => {
        return inputValue != '' || null;
      });
      try {
        const response = await API.post(url, {
          "programName": inputData
        })
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.program_name).join(', ')
          toasterSuccess(`Following program(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.program_name).join(', ')
          toasterError(`Following program(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/program')
      }
      catch (error) {
        console.log(error, "error")
      }
    }
  }


  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
    return (
      <div >
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
                <li>
                  <Link href="/master/program">
                    Program
                  </Link>
                </li>
                <li>Add program</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className=" columns-4 mt-3 lg:columns-4 sm:columns-2" >
            {inputValues.map((value, index) => (
              <div key={index} className="mb-3 mx-3">
                <input
                  key={index}
                  type="text"
                  placeholder={
                    index === 0 ? translations.program + "*" : translations.program
                  }
                  value={value}
                  className={`text-center text-sm border rounded px-2 py-1 ${error[index] !== "" ? 'border-red-500' : 'border'}`}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
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
        </div>
      </div>
    )
  }
}
