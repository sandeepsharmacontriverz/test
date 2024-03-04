"use client"

import { useEffect, useRef, useState } from "react";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "next/navigation";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";

export default function Page() {
  useTitle("Add Farm Product");
  const [roleLoading] = useRole();

  const router = useRouter();
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [farmItems, setFarmItems] = useState([]);
  const [selectedFarmItemId, setSelectedFarmItemId] = useState(null);
  const [formData, setFormData] = useState({
    farmItem: "",
    farmItemId: null,
    farmProduct: initializeInputFields,
  });
  const [error, setError] = useState({
    farmItem: "",
    farmProduct: "",
  });

  const getFarmItems = async () => {
    const url = "farm/farm-item?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const farmItem = response.data;
        setFarmItems(farmItem);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "farmItem") {
      const selectedUnitType: any = farmItems.find((farmItem: any) => farmItem.farmItem === value);
      setSelectedFarmItemId(selectedUnitType ? selectedUnitType.id : null);
      setFormData((prevData) => ({
        ...prevData,
        farmItem: value,
        farmItemId: selectedUnitType ? selectedUnitType.id : null,
      }));
      setError((prevData) => ({
        ...prevData,
        [name]: ""
      }));
    } else {
      setFormData((prevData) => {
        const updatedFarmProductNames = [...prevData.farmProduct];
        updatedFarmProductNames[index] = value;
        return {
          ...prevData,
          farmProduct: updatedFarmProductNames,
        };
      });
      setError((prevData) => ({
        ...prevData,
        farmProduct: "",
      }));
    }
  };

  const handleErrors = () => {
    let isError = false;

    if (!formData.farmItem) {
      setError((prevError: any) => ({
        ...prevError,
        farmItem: "Farm Item is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.farmProduct = [];

    formData.farmProduct.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.farmProduct[index] = 'Farm Product Name is required';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.farmProduct[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      farmProduct: newError.farmProduct,
    }));

    return isError;
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors()) {
      return
    }

    if (formData.farmItem && formData.farmProduct[0] !== "") {
      const requestBody = {
        farmItemId: selectedFarmItemId,
        farmProduct: formData.farmProduct.filter((subType: any) => subType !== ""),
      };

      const url = "farm/farm-product-multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.farmProduct).join(', ')
          toasterSuccess(`Following farm Product(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.farmProduct).join(', ')
          toasterError(`Following farm Product(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/farm/farm-product')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError((prevData) => ({
      farmItem: "",
      farmProduct: "",
    }));
    router.back();
  };

  useEffect(() => {
    getFarmItems();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading...</div>;
  }

  if (!roleLoading) {
    return (
      <>
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
                  <li>Farm</li>
                  <li>
                    <Link href="/master/farm/farm-product">
                      Farm Product
                    </Link>
                  </li>
                  <li>Add Farm Product</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.farmItem}
                onChange={(event) => handleChange(event)}
                name="farmItem"
              >
                <option value="" className="text-sm">
                  Select Farm Item*
                </option>
                {farmItems.map((farmItem: any) => (
                  <option key={farmItem.id} value={farmItem.farmItem}>
                    {farmItem.farmItem}
                  </option>
                ))}
              </select>
              {error.farmItem && <div className="text-red-500 text-sm  mt-1">{error.farmItem}</div>}
            </div>
            <div className="input-container mt-4">
              <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
                {initializeInputFields.map((_, index) => (
                  <div className="mb-2" key={index}>
                    <input
                      id={`farmProduct-${index}`}
                      type="text"
                      name="farmProduct"
                      placeholder={index === 0 ? translations.farm.farmProductName + "*" : translations.farm.farmProductName}
                      className={`text-center border rounded mt-2 w-60 px-2 py-1 ${error.farmProduct[index] !== "" ? "border-red-500" : "border"}`}
                      value={formData.farmProduct[index]}
                      onChange={(event) => handleChange(event, index)}
                    />
                    {error.farmProduct[index] !== "" && <p className="text-red-500 text-sm mt-1">{error.farmProduct[index]}</p>}
                  </div>
                ))}
              </div>
            </div>
            <div className="justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2 text-sm">
              <button
                type="submit"
                className="bg-green-600 text-sm rounded text-white px-2 py-1.5"
                onClick={handleSubmit}
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
      </>
    )
  }
}
