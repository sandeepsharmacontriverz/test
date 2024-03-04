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
  useTitle("Add Farm Group")

  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [brandItems, setBrandItems] = useState([]);

  const [formData, setFormData] = useState({
    brandId: "",
    farmgroup: initializeInputFields,
  });
  const [error, setError] = useState({
    brand_name: "",
    farmGroup: "",
  });

  const getCropName = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const brand_name = response.data;
        setBrandItems(brand_name);
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

    if (name === "brand_name") {
      setFormData((prevData) => ({
        ...prevData,
        brandId: value,
      }));
      setError((pre) => ({
        ...pre,
        brand_name: "",
      }));
    }
    else {
      setFormData((prevData) => {
        const updatedCropTypes = [...prevData.farmgroup];
        updatedCropTypes[index] = value;
        return {
          ...prevData,
          farmgroup: updatedCropTypes,
        };
      });
      setError((pre) => ({
        ...pre,
        farmGroup: "",
      }));
    }
  };

  const handleErrors = () => {
    let isError = false;

    if (!formData.brandId) {
      setError((prevError: any) => ({
        ...prevError,
        brand_name: "Brand Name is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.farmGroup = [];

    formData.farmgroup.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.farmGroup[index] = 'Farm Group is required';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.farmGroup[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      farmGroup: newError.farmGroup,
    }));

    return isError;
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors()) {
      return
    }


    if (formData.brandId && formData.farmgroup[0] !== "") {
      const requestBody = {
        brandId: Number(formData.brandId),
        name: formData.farmgroup.filter((subType: any) => subType !== ""),
      };

      const url = "farm-group/multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.name).join(', ')
          toasterSuccess(`Following farm group(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.name).join(', ')
          toasterError(`Following farm group(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/farm-group')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };


  useEffect(() => {
    User.role()
  }, [])
  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading...</div>;
  }
  return (
    <>
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
                  <Link href="/master/farm-group">
                    Farm Group
                  </Link>
                </li>
                <li>Add Farm Group</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div>
            <select
              className="w-60 border rounded px-2 py-1 mt-3  text-sm"
              value={formData.brandId}
              onChange={(event) => handleChange(event)}
              name="brand_name"
            >
              <option value="" className="text-sm">
                Select Brand
              </option>
              {brandItems.length > 0 &&
                brandItems.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.brand_name}
                  </option>
                ))}
            </select>
            {error.brand_name && (
              <div className="text-red-500 text-sm  mt-1">{error.brand_name}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((farmgroup, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`farmgroup-${index}`}
                    type="text"
                    name="name"
                    placeholder={index === 0 ? translations.farmGroup + "*" : translations.farmGroup}
                    className={`text-center w-60 border rounded px-2 py-1 ${error.farmGroup[index] !== "" ? 'border-red-500' : 'border'}`}
                    value={formData.farmgroup[index]}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {error.farmGroup[index] !== "" && (
                    <div className="text-red-500 text-sm mt-1">{error.farmGroup[index]}</div>
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
