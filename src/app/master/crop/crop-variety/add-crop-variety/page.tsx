
"use client"
import React, { useEffect, useState } from "react";
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Page() {
  useTitle("Add Crop Variety")
  const router = useRouter()

  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropName, setCropName] = useState([]);
  const [cropType, setCropType] = useState([]);
  const [formData, setFormData] = useState({
    cropNameId: "",
    cropTypeId: "",
    cropVariety: initializeInputFields,
  });

  const [error, setError] = useState({
    cropname: "",
    croptype: "",
    cropvariety: "",
    cropvarietyIndex: -1
  })

  useEffect(() => {
    getCropName();
  }, []);

  useEffect(() => {
    if (formData.cropNameId) {
      getCropType()
    }
  }, [formData.cropNameId])

  const getCropName = async () => {
    const url = "crop/crop-name?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setCropName(response.data.crops);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getCropType = async () => {
    const url = `crop/crop-type?pagination=false&cropId=${formData.cropNameId}&status=true`;
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const cropType_name = response.data;
        setCropType(cropType_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropNameId: value,
      }));
    } else if (name === "croptype") {
      setFormData((prevData) => ({
        ...prevData,
        cropTypeId: value,
      }));
    } else if (name === "cropVariety") {
      const updatedVarieties = [...formData.cropVariety];
      updatedVarieties[index] = value;

      setFormData((prevData) => ({
        ...prevData,
        cropVariety: updatedVarieties,
      }));
    }

    if (name === "crop_name") {
      setError((prevError) => ({
        ...prevError,
        cropname: "",
      }));
    } else if (name === "croptype") {
      setError((prevError) => ({
        ...prevError,
        croptype: "",
      }));
    }
    else if (name === "cropVariety") {
      setError((prevError) => ({
        ...prevError,
        cropvariety: "",
        cropvarietyIndex: -1
      }));
    }
  };

  const isCropVarietyValid = (inputValues: string[]): number => {
    const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    for (const [i, value] of Object.entries(inputValues)) {
      if (value && !regex.test(value)) {
        return Number(i);
      }
    }
    return -1;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.cropNameId) {
      setError((prevError) => ({
        ...prevError,
        cropname: "Crop Name is required",
      }));
    }

    if (!formData.cropTypeId) {
      setError((prevError) => ({
        ...prevError,
        croptype: "Crop Type is required",

      }));
    }

    if (formData.cropVariety[0] === '') {
      setError((prevError) => ({
        ...prevError,
        cropvariety: "Crop Variety is required",
        cropvarietyIndex: 0
      }));
    } else {
      const notValidIndex = isCropVarietyValid(formData.cropVariety);
      if (notValidIndex > -1) {
        setError((prevError: any) => ({
          ...prevError,
          cropvariety: "Only letters, digits, white space, (, ), _ and - allowed.",
          cropvarietyIndex: notValidIndex
        }));
      } else {
        if (formData.cropNameId && formData.cropTypeId && formData.cropVariety[0] !== "") {
          const requestBody = {
            cropTypeId: Number(formData.cropTypeId),
            cropVariety: (formData.cropVariety.filter((subVariety: any) => subVariety !== "")),
          };

          const url = "crop/crop-variety-multiple";
          try {
            const response = await API.post(url, requestBody);
            if (response.data.pass.length > 0) {
              const dataPassed = response.data.pass;
              const passedName = dataPassed.map((name: any) => name.data.cropVariety).join(', ')
              toasterSuccess(`Following crop variety(s) have been added successfully: ${passedName} `)
            }
            if (response.data.fail.length > 0) {
              const dataFailed = response.data.fail;
              const failedName = dataFailed.map((name: any) => name.data.cropVariety).join(', ')
              toasterError(`Following crop variety(s) are skipped as they are already exist: ${failedName} `)
            }
            router.push('/master/crop/crop-variety')
          } catch (error) {
            console.log(error, "error");
          }
        }
      }
    }
  }
  const handleCancel = () => {
    window.history.back();
  };

  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }
  return (
    <>
      <div>
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
                    <Link href="/master/crop/crop-variety">
                      Crop Variety
                    </Link>
                  </li>
                  <li>Add Crop Variety</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="flex">
            <div >
              <select className="w-60 border rounded px-2 py-1 mt-3  text-sm"
                value={formData.cropNameId}
                onChange={(event) => handleChange(event)} name="crop_name"
              >

                <option value="">Select Crop Name</option>
                {cropName.map((crop: any) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.crop_name}
                  </option>
                ))}
              </select>
              {error.cropname && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.cropname}
                </div>
              )}
            </div>

            {/* Crop Type Select */}
            <div >
              <select
                className="w-60 border rounded px-2 py-1 mt-3 ml-36 text-sm flex"
                value={formData.cropTypeId}
                onChange={(event) => handleChange(event)}
                name="croptype"
              >
                <option value="">Select Crop Type</option>
                {cropType.map((crop: any) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.cropType_name}
                  </option>
                ))}
              </select>

              {error.croptype && (
                <div className="text-red-500 ml-36 text-sm mt-1">
                  {error.croptype}
                </div>
              )}
            </div>
          </div>

          <div className='input-container mt-4'>
            <div className="columns mt-3 lg:columns-4 sm:columns-1 md:columns-2 text-sm">
              {initializeInputFields.map((croptype, index) => (
                <div key={index}>
                  <input
                    type="text"
                    id={`cropVariety-${index}`}
                    name="cropVariety"
                    className={`text-center w-60 mt-4 border rounded px-2 py-1 ${index === error.cropvarietyIndex && error.cropvariety ? 'border-red-500' : 'border'}`}

                    placeholder={index === 0 ? translations.crop.cropVariety + "*" : translations.crop.cropVariety}
                    value={formData.cropVariety[index] || ""}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {index === error.cropvarietyIndex && error.cropvariety && (
                    <div className="text-red-500 text-sm ml-5 mt-1">
                      {error.cropvariety}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="justify-between mt-4 px-2 space-x-3">
            <button
              className="bg-green-500 rounded text-white px-2 py-2 text-sm"
              onClick={handleSubmit}
            >
              {translations.common.submit}
            </button>
            <button
              className="bg-gray-300 rounded text-black px-2 py-2 text-sm"
              onClick={handleCancel}
            >
              {translations.common.cancel}
            </button>
          </div>
          <hr className="mt-2 mb-4" />
        </div>
      </div>
    </>
  );
}
