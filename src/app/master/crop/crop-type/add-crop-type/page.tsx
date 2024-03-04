"use client"
import { useEffect, useRef, useState } from "react";
import useTranslations from '@hooks/useTranslation'
import User from "@lib/User";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "next/navigation";
import useTitle from "@hooks/useTitle";
import Link from "next/link";

export default function Page() {
  useTitle("Add Crop Type")

  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [cropItems, setCropItems] = useState([]);

  const [formData, setFormData] = useState({
    cropId: "",
    cropType: initializeInputFields,
  });
  const [error, setError] = useState({
    cropname: "",
    cropType: "",
    cropTypeIndex: -1
  });

  const getCropName = async () => {
    const url = "crop/crop-name?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const crop_name = response.data.crops;
        setCropItems(crop_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getCropName();
  }, []);


  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;

    if (name === "crop_name") {
      setFormData((prevData) => ({
        ...prevData,
        cropId: value,
      }));
    } else {
      setFormData((prevData) => {
        const updatedCropTypes = [...prevData.cropType];
        updatedCropTypes[index] = value;
        return {
          ...prevData,
          cropType: updatedCropTypes,
        };
      });
    }
    if (name === "crop_name") {
      setError((prevError) => ({
        ...prevError,
        cropname: "",
      }));
    } else if (name === "croptypes") {
      setError((prevError) => ({
        ...prevError,
        cropType: "",
        cropTypeIndex: -1
      }));
    }
  };

  const isCropTypeValid = (inputValues: string[]): number => {
    const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    for (const [i, value] of Object.entries(inputValues)) {
      if (value && !regex.test(value)) {
        return Number(i);
      }
    }
    return -1;
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!formData.cropId) {
      setError((prevError: any) => ({
        ...prevError,
        cropname: "Crop Name is required",
      }));
    }

    if (formData.cropType[0] === "") {
      setError((prevError: any) => ({
        ...prevError,
        cropType: "Crop Type is required",
        cropTypeIndex: 0
      }));
    } else {
      const notValidIndex = isCropTypeValid(formData.cropType);
      if (notValidIndex > -1) {
        setError((prevError: any) => ({
          ...prevError,
          cropType: "Only letters, digits, white space, (, ), _ and - allowed.",
          cropTypeIndex: notValidIndex
        }));
      } else {
        if (formData.cropId && formData.cropType[0] !== "") {
          const requestBody = {
            cropId: Number(formData.cropId),
            cropTypeName: formData.cropType.filter((subType: any) => subType !== ""),
          };

          const url = "crop/crop-type-multiple";
          try {
            const response = await API.post(url, requestBody);
            if (response.data.pass.length > 0) {
              const dataPassed = response.data.pass;
              const passedName = dataPassed.map((name: any) => name.data.cropType_name).join(', ')
              toasterSuccess(`Following crop type(s) have been added successfully: ${passedName} `)
            }
            if (response.data.fail.length > 0) {
              const dataFailed = response.data.fail;
              const failedName = dataFailed.map((name: any) => name.data.cropType_name).join(', ')
              toasterError(`Following crop type(s) are skipped as they are already exist: ${failedName} `)
            }
            router.push('/master/crop/crop-type')
          } catch (error) {
            console.log(error, "error");
          }
        }
      }
    }

  };

  const handleCancel = (event: any) => {
    const { name, value } = event.target;
    setError((prevError) => ({
      ...prevError,
      [name]: "",
      cropTypeIndex: -1
    }));
    router.back();
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
                  <Link href="/master/crop/crop-type">
                    Crop Type
                  </Link>
                </li>
                <li>Add Crop Type</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div>
            <select
              className="w-60 border rounded px-2 py-1  text-sm"
              value={formData.cropId}
              onChange={(event) => handleChange(event)}
              name="crop_name"
            >
              <option value="" className="text-sm">
                Select Crop Name
              </option>
              {cropItems.length > 0 &&
                cropItems.map((crop: any) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.crop_name}
                  </option>
                ))}
            </select>
            {error.cropname && (
              <div className="text-red-500 text-sm  mt-1">{error.cropname}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((croptype, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`croptype-${index}`}
                    type="text"
                    name="croptypes"
                    placeholder={index === 0 ? translations.crop.cropType + "*" : translations.crop.cropType}
                    className={`text-center w-60 border rounded px-2 py-1 ${index === error.cropTypeIndex && error.cropType ? 'border-red-500' : 'border'}`}
                    value={formData.cropType[index]}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {index === error.cropTypeIndex && error.cropType && (
                    <div className="text-red-500 text-sm mt-1">{error.cropType}</div>
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