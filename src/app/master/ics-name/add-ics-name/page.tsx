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
  useTitle("Add ICS Name");
  const [roleLoading] = useRole();

  const router = useRouter();
  const [initializeInputFields] = useState(Array(16).fill(""));
  const [farmGroups, setFarmGroups] = useState([]);

  const [formData, setFormData] = useState({
    farmGroupId: "",
    icsName: initializeInputFields,
    longitude: initializeInputFields,
    latitude: initializeInputFields
  });

  const [error, setError] = useState({
    farmGroup: "",
    icsName: "",
  });

  const getFarmGroups = async () => {
    const url = "farm-group";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const farmGroup = response.data;
        setFarmGroups(farmGroup);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, index: number = 0) => {
    const { name, value } = event.target;

    if (name === "farmGroup") {
      setFormData((prevData) => ({
        ...prevData,
        farmGroupId: value
      }));
    } else if (name === "latitude") {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.latitude];
        updatedValues[index] = value;
        return {
          ...prevData,
          latitude: updatedValues,
        };
      });
    }
    else if (name === "longitude") {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.longitude];
        updatedValues[index] = value;
        return {
          ...prevData,
          longitude: updatedValues,
        };
      });
    }
    else {
      setFormData((prevData: any) => {
        const updatedValues = [...prevData.icsName];
        updatedValues[index] = value;
        return {
          ...prevData,
          icsName: updatedValues,
        };
      });
    }

    setError((prevData) => ({
      ...prevData,
      [name]: "",
      farmGroup: "",
    }));
  };

  const handleErrors = () => {
    let isError = false;

    if (!formData.farmGroupId) {
      setError((prevError: any) => ({
        ...prevError,
        farmGroup: "Farm Group is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.icsName = [];

    formData.icsName.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.icsName[index] = 'Ics Name is required';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.icsName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      icsName: newError.icsName,
    }));

    return isError;
  }

  const handleSubmit = async (e: any) => {
    if (handleErrors()) {
      return
    }

    if (formData.farmGroupId && formData.icsName[0] !== "") {
      const icsArray = formData.icsName
        .map((icsName, index) => {
          if (icsName.trim() !== "") {
            return {
              icsName,
              icsLatitude: formData.latitude[index] || "",
              icsLongitude: formData.longitude[index] || "",
            };
          }
          return null;
        })
        .filter((ics) => ics !== null);

      const requestBody = {
        farmGroupId: Number(formData.farmGroupId),
        ics: icsArray
      };

      const url = "ics/multiple";
      try {
        const response = await API.post(url, requestBody);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.ics_name).join(', ')
          toasterSuccess(`Following Ics name(s) have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.ics_name).join(', ')
          toasterError(`Following Ics name(s) are skipped as they are already exist: ${failedName} `)
        }
        router.push('/master/ics-name')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    setError((prevData) => ({
      farmGroup: "",
      icsName: "",
    }));
    router.back();
  };

  useEffect(() => {
    getFarmGroups();
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
                  <li>
                    <Link href="/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>Master</li>
                  <li>
                    <Link href="/master/ics-name">
                      ICS Name
                    </Link>
                  </li>
                  <li>Add ICS Name</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md p-4">
            <div>
              <select
                className="w-60 border rounded px-2 py-1 mt-3 text-sm"
                value={formData.farmGroupId}
                onChange={(event) => handleChange(event)}
                name="farmGroup"
              >
                <option value="" className="text-sm">
                  Select Farm Group*
                </option>
                {farmGroups.map((farmGroup: any) => (
                  <option key={farmGroup.id} value={farmGroup.id}>
                    {farmGroup.name}
                  </option>
                ))}
              </select>

              {error.farmGroup && <div className="text-red-500 text-sm  mt-1">{error.farmGroup}</div>}
            </div>

            <div className="input-container mt-4">
              <div className="columns-2 lg:columns-2 sm:columns-1 text-sm">
                {initializeInputFields.map((_, index) => (
                  <div className="mb-2" key={index}>

                    <input
                      id={`icsName-${index}`}
                      type="text"
                      name="icsName"
                      placeholder={index === 0 ? translations.icsName + "*" : translations.icsName}

                      className={`w-60 border rounded px-2 py-1 mt-3  size-2 text-sm ${error.icsName[index] !== "" ? "border-red-500" : "border"}`}
                      value={formData.icsName[index]}
                      onChange={(event) => handleChange(event, index)}
                    />

                    <input
                      id={`latitude-${index}`}
                      name="latitude"
                      type="number"
                      className="w-60 border rounded px-2 py-1 mt-3 ml-5 size-2 text-sm"
                      placeholder="Latitude"
                      value={formData.latitude[index] || ""}
                      onChange={(event) => handleChange(event, index)}
                    />

                    <input
                      id={`longitude-${index}`}
                      name="longitude"
                      type="number"
                      className="w-60 border rounded px-2 py-1 mt-3 ml-5 size-2 text-sm"
                      placeholder="Longitude"
                      value={formData.longitude[index] || ""}
                      onChange={(event) => handleChange(event, index)}
                    />

                    {error.icsName[index] !== "" && <div className="text-red-500 text-sm mt-1">{error.icsName[index]}</div>}
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
            <hr className="mt-2 mb-4" />
          </div>
        </div>
      </>
    )
  }
}
