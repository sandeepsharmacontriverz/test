"use client"
import React, { useEffect, useState } from 'react';
import useTranslations from '@hooks/useTranslation'
import User from '@lib/User';
import useTitle from '@hooks/useTitle';
import API from '@lib/Api';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Page() {
  useTitle("Add Crop Grade")
  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropName, setCropName] = useState([]);
  const [cropType, setCropType] = useState([]);
  const [cropVariety, setCropVariety] = useState([])
  const [formData, setFormData] = useState({
    cropNameId: "",
    cropTypeId: "",
    cropVarietyId: "",
    cropGrade: initializeInputFields
  })

  useEffect(() => {
    getCropName();
  }, []);

  useEffect(() => {
    if (formData.cropNameId) {
      getCropType()
    }
  }, [formData.cropNameId])

  useEffect(() => {
    if (formData.cropTypeId) {
      getCropVariety()
    }
  }, [formData.cropTypeId])

  useEffect(() => {
    User.role()
  }, [])

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

  const getCropVariety = async () => {
    const url = `crop/crop-variety?pagination=false&cropTypeId=${formData.cropTypeId}&status=true`;
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const cropvariety = response.data;
        setCropVariety(cropvariety);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  const [error, setError] = useState({
    cropname: "",
    croptype: "",
    cropvariety: "",
    cropgrade: "",
    cropgradeIndex: -1
  })

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropNameId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        cropname: "", // Clear the error message
      }));
    } else if (name === "croptype") {
      setFormData((prevData) => ({
        ...prevData,
        cropTypeId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        croptype: "", // Clear the error message
      }));
    } else if (name === "cropVariety") {
      setFormData((prevData) => ({
        ...prevData,
        cropVarietyId: value,
      }));
      setError((prevError: any) => ({
        ...prevError,
        cropvariety: "", // Clear the error message
      }));
    } else if (name === "cropGrade") {
      const updatedVarieties = [...formData.cropGrade];
      updatedVarieties[index] = value;

      setFormData((prevData) => ({
        ...prevData,
        cropGrade: updatedVarieties,
      }));
      setError((prevError: any) => ({
        ...prevError,
        cropgrade: "", // Clear the error message
        cropgradeIndex: -1
      }));
    }
  }

  const isCropGradeValid = (inputValues: string[]): number => {
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
    let hasErrors = false;
    if (!formData.cropNameId) {
      setError((prevError: any) => ({
        ...prevError,
        cropname: "Crop Name is Required",
      }));
      hasErrors = true;
    }

    if (!formData.cropTypeId) {
      setError((prevError: any) => ({
        ...prevError,
        croptype: "Crop Type is Required",
      }));
      hasErrors = true;
    }

    if (!formData.cropVarietyId) {
      setError((prevError: any) => ({
        ...prevError,
        cropvariety: "Crop Variety is Required",

      }));
      hasErrors = true;
    }

    if (formData.cropGrade[0] === '') {
      setError((prevError: any) => ({
        ...prevError,
        cropgrade: "Crop Grade is required",
        cropgradeIndex: 0
      }));
      hasErrors = true;
    } else {
      const notValidIndex = isCropGradeValid(formData.cropGrade);
      if (notValidIndex > -1) {
        setError((prevError: any) => ({
          ...prevError,
          cropgrade: "Only letters, digits, white space, (, ), _ and - allowed.",
          cropgradeIndex: notValidIndex
        }));
        hasErrors = true;
      }
    }


    if (!hasErrors) {
      const requestBody = {
        cropVarietyId: formData.cropVarietyId,
        cropGrade: formData.cropGrade.filter((subVariety: any) => subVariety !== ""),
      };

      const url = "crop/crop-grade-multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.cropGrade).join(', ')
          toasterSuccess(`Following crop grade(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.cropGrade).join(', ')
          toasterError(`Following crop grade(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/crop/crop-grade')
      } catch (error) {
        console.log(error, "error");
      }
    }

  }

  const handleCancel = () => {
    setFormData({
      cropNameId: "",
      cropTypeId: "",
      cropVarietyId: "",
      cropGrade: initializeInputFields,
    });
    setError({
      cropname: "",
      croptype: "",
      cropvariety: "",
      cropgrade: "",
      cropgradeIndex: -1
    });
    window.history.back();
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  return (
    <>
      <div >
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
                  <Link href="/master/crop/crop-grade">
                    Crop Grade
                  </Link>
                </li>
                <li>Add Crop Grade</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex" >
          <div >
            <select className="w-60 border rounded px-2 py-1 mt-3  text-sm"
              value={formData.cropNameId}
              onChange={(event) => handleChange(event)}
              name="crop_name"
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
          <div >
            <select
              className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm flex"
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
              <div className="text-red-500 text-sm ml-5 mt-1">
                {error.croptype}
              </div>
            )}
          </div>
          <div>
            <select
              className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              onChange={(event) => handleChange(event)} name="cropVariety"

            >
              <option value="">Select Crop Variety</option>
              {cropVariety.map((name: any, index) => (
                <option key={index} value={name.id}>
                  {name.cropVariety}
                </option>
              ))}
            </select>
            {error.cropvariety && (
              <div className="text-red-500 text-sm ml-5 mt-1">
                {error.cropvariety}
              </div>
            )}
          </div>
        </div>
        <div className='input-container mt-4'>
          <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
            {initializeInputFields.map((cropgrade, index) => (
              <div className="mb-2" key={index}>
                <input
                  id={`cropGrade-${index}`}
                  type="text"
                  name="cropGrade"
                  placeholder={index === 0 ? translations.crop.cropGrade + "*" : translations.crop.cropGrade}
                  className={`text-center w-60 border rounded px-2 py-1 ${index === error.cropgradeIndex && error.cropgrade ? 'border-red-500' : 'border'}`}
                  value={formData.cropGrade[index]}
                  onChange={(event) => handleChange(event, index)}
                />
                {index === error.cropgradeIndex && error.cropgrade && (
                  <div className="text-red-500 text-sm mt-1">{error.cropgrade}</div>
                )}
              </div>
            ))}

          </div>
        </div>

        <div className=" justify-between mt-4 px-2 space-x-3">
          <button className="bg-green-500 rounded text-white px-2 py-2 text-sm " onClick={handleSubmit}>{translations.common.submit}</button>
          <button className='bg-gray-300 rounded text-black px-2 py-2 text-sm' onClick={handleCancel}>{translations.common.cancel}</button>
        </div>
        <hr className="mt-2 mb-4" />
      </div>
    </>
  );
}