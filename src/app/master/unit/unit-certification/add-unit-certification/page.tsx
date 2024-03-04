"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from '@hooks/useTranslation'
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from 'next/link';

interface CertificationData {
  certificationLogo: any;
  certificationName: any;
}

export default function AddUnitCertification() {
  useTitle("Add Unit Certificate");
  const [roleLoading] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [inputData, setInputData] = useState<string[]>(Array(10).fill(''));
  const [selectedFiles, setSelectedFiles] = useState<File[]>(Array(10).fill(null));
  const [errors, setErrors] = useState<{ logo: string[], certificationName: string[] }>({
    logo: [],
    certificationName: []
  });

  const handleCancel = () => {
    router.back();
    setErrors({
      logo: [],
      certificationName: []
    });
  };

  const handleErrors = () => {
    let isError = false;

    const newError = { ...errors };
    newError.certificationName = [];

    inputData.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue);

      if (index === 0) {
        if (inputValue === '') {
          newError.certificationName[index] = 'Unit Certification Name is required';
          isError = true;
        } else if (!valid) {
          newError.certificationName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
        if (selectedFiles[index] === null) {
          newError.logo[index] = 'Logo is required';
          isError = true;
        }
      } else if (!valid) {
        if (inputValue != '') {
          newError.certificationName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      } else if (inputValue && selectedFiles[index] === null) {
        newError.logo[index] = 'Logo is required';
        isError = true;
      }
    });

    setErrors({
      logo: newError.logo,
      certificationName: newError.certificationName
    });

    return isError;
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (handleErrors()) {
      return;
    }

    if (selectedFiles[0] && inputData[0]) {
      saveData();
    }
  };

  const handleTextChange = (index: number, value: string) => {
    const newData = [...inputData];
    newData[index] = value;
    setInputData(newData);
  };

  const handleFileChange = async (index: number, file: any) => {
    if (file) {
      let logoErrors = errors.logo;
      const newFiles: any = [...selectedFiles];

      if (!['image/jpeg', 'image/jpg', 'image/bmp', "image/png"].includes(file.type)) {
        logoErrors[index] = "Invalid file type. Please select a JPG, JPEG, or BMP image.";
        setErrors((prevError) => ({
          ...prevError,
          logo: logoErrors,
        }));
        newFiles[index] = null;
        setSelectedFiles(newFiles);
        return;
      }

      const maxSize = 100 * 1024;
      if (file.size > maxSize) {
        logoErrors[index] = "File size exceeds the maximum allowed size (100 KB).";
        setErrors((prevError) => ({
          ...prevError,
          logo: logoErrors,
        }));
        newFiles[index] = null;
        setSelectedFiles(newFiles);
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", file)

    const url = "file/upload"
    try {
      const response = await API.postFile(url, formData)
      if (response.success) {
        const newFiles: any = [...selectedFiles];
        newFiles[index] = response.data;
        setSelectedFiles(newFiles);
        setErrors({
          logo: [],
          certificationName: []
        });
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  const saveData = async () => {
    const certificationData: CertificationData[] = [];

    inputData.forEach((text, index) => {
      if (text.trim() !== '' && selectedFiles[index]) {
        certificationData.push({
          certificationLogo: selectedFiles[index],
          certificationName: text,
        });
      }
    });
    const outputData = {
      certification: certificationData,
    };


    const url = "unit/unit-certification-multiple"
    try {
      const response = await API.post(url, outputData)
      if (response.data.pass.length > 0) {
        const dataPassed = response.data.pass;
        const passedName = dataPassed.map((name: any) => name.data.certification_name).join(', ')
        toasterSuccess(`Following unit certification(s) have been added successfully: ${passedName} `)
      }
      if (response.data.fail.length > 0) {
        const dataFailed = response.data.fail;
        const failedName = dataFailed.map((name: any) => name.data.certification_name).join(', ')
        toasterError(`Following unit certification(s) are skipped as they are already exist: ${failedName} `)
      }
      router.push('/master/unit/unit-certification')
    }
    catch (error) {
      console.log(error, "error")
    }
  };

  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
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
                <li>Unit</li>
                <li>
                  <Link href="/master/unit/unit-certification">
                    Unit Certification
                  </Link>
                </li>
                <li>Add Unit Certification</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <form >
            <div className=" columns-2 mt-3 gap-4 lg:columns-2 sm:columns-1" >
              {inputData.map((text, index) => (
                <div key={index} className="flex py-3">
                  <div>
                    <input
                      type="text"
                      id={`textInput${index}`}
                      placeholder={
                        index === 0 ? translations.unit.unitCertificationName + "*" : translations.unit.unitCertificationName
                      }
                      value={text}
                      className={`text-center w-72 text-sm bg-inherit border rounded px-2 py-1  ${errors.certificationName[index] !== "" ? 'border-red-500' : 'border'}`}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />
                    {errors.certificationName[index] !== "" && (
                      <p className=" text-red-600 text-sm">{errors.certificationName[index]}</p>
                    )}
                  </div>
                  <div className="ml-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="ml-10"
                      onChange={(e: any) => handleFileChange(index, e.target.files[0])}
                    />
                    <label className="text-sm ml-10">(Max: 100kb) (Format: jpg/jpeg/bmp)</label>
                    {errors.logo[index] !== "" && <p className="text-red-500 ml-10 text-sm mt-1">{errors.logo[index]}</p>}
                  </div>
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
    )
  }
}