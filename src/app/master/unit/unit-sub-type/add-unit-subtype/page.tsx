"use client"

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "next/navigation";
import useRole from "@hooks/useRole";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import useTitle from "@hooks/useTitle";

export default function Page() {
  const router = useRouter();
  const [roleLoading] = useRole();
  useTitle('Add Unit Sub Type')
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [unitTypes, setUnitTypes] = useState([]);
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState(null);
  const [formData, setFormData] = useState({
    unitTypeName: "",
    unitTypeId: null,
    unitSubType: initializeInputFields,
  });
  const [error, setError] = useState({
    unitTypeName: "",
    unitSubType: "",
  });

  const getUnitTypes = async () => {
    const url = "unit/unit-type?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const unitTypeData = response.data;
        setUnitTypes(unitTypeData);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "unitTypeName") {
      const selectedUnitType: any = unitTypes.find((unitType: any) => unitType.unitType === value);
      setSelectedUnitTypeId(selectedUnitType ? selectedUnitType.id : null);
      setFormData((prevData) => ({
        ...prevData,
        unitTypeName: value,
        unitTypeId: selectedUnitType ? selectedUnitType.id : null,
      }));
      setError((prevData) => ({
        ...prevData,
        [name]: "",
      }));
    } else {
      setFormData((prevData) => {
        const updatedFarmProductNames = [...prevData.unitSubType];
        updatedFarmProductNames[index] = value;
        return {
          ...prevData,
          unitSubType: updatedFarmProductNames,
        };
      });
      setError((prevData) => ({
        ...prevData,
        unitSubType: "",
      }));
    };
  }

  const handleErrors = () => {
    let isError = false;

    if (!formData.unitTypeName) {
      setError((prevError: any) => ({
        ...prevError,
        unitTypeName: "Unit Type is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.unitSubType = [];

    formData.unitSubType.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.unitSubType[index] = 'Unit Sub Type Name is required';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.unitSubType[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      unitSubType: newError.unitSubType,
    }));

    return isError;
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors()) {
      return
    }

    if (formData.unitTypeName && formData.unitSubType[0] !== "") {
      const requestBody = {
        unitTypeId: selectedUnitTypeId,
        unitSubType: formData.unitSubType.filter((subType: any) => subType !== ""),
      };

      const url = "unit/unit-sub-type-multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.unitSubType).join(', ')
          toasterSuccess(`Following unit sub type(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.unitSubType).join(', ')
          toasterError(`Following unit sub type(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/unit/unit-sub-type')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError({
      unitTypeName: "",
      unitSubType: "",
    });
    router.back();
  };



  useEffect(() => {
    getUnitTypes();
  }, []);

  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
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
                  <li>Unit</li>
                  <li>
                    <Link href="/master/unit/unit-sub-type">
                      Unit Sub Type
                    </Link>
                  </li>
                  <li>Add Unit Sub Type</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.unitTypeName}
                onChange={(event) => handleChange(event)}
                name="unitTypeName"
              >
                <option value="" className="text-sm">
                  Select Unit Type*
                </option>
                {unitTypes.map((unitType: any) => (
                  <option key={unitType.id} value={unitType.unitType}>
                    {unitType.unitType}
                  </option>
                ))}
              </select>
              {error.unitTypeName && <div className="text-red-500 text-sm mt-1">{error.unitTypeName}</div>}
            </div>
            <div className="input-container mt-4">
              <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
                {initializeInputFields.map((_, index) => (
                  <div className="mb-2" key={index}>
                    <input
                      id={`unitSubType-${index}`}
                      type="text"
                      name="unitSubType"
                      placeholder={index === 0 ? translations.unit.unitSubTypeName + "*" : translations.unit.unitSubTypeName}
                      className={`text-center border rounded px-2 w-60 py-1 ${error.unitSubType[index] !== "" ? "border-red-500" : "border"}`}
                      value={formData.unitSubType[index]}
                      onChange={(event) => handleChange(event, index)}
                    />
                    {error.unitSubType[index] !== "" && <p className="text-red-500 text-sm mt-1">{error.unitSubType[index]}</p>}
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
            {/* <hr className="mt-2 mb-4" /> */}
          </div>
        </div>
      </>
    );
  }
}
