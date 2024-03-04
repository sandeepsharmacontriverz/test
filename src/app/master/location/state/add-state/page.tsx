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
  useTitle("Add State")
  const router = useRouter()
  const [countries, setCountries] = useState([]);

  const [formData, setFormData] = useState({
    countryId: "",
    latitude: Array(16).fill(""),
    longitude: Array(16).fill(""),
    StateName: Array(16).fill(""),
  });

  const [error, setError] = useState({
    countries: "",
    stateName: "",
    latitude: "",
    longitude: "",
  });

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        const county_name = response.data;
        setCountries(county_name);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    getCountries();
  }, []);

  const handleCountryChange = (event: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      countryId: value,
    }));

    setError((prevError) => ({
      ...prevError,
      countries: "",
    }));
  };


  const handleStateNameChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      StateName: prevData.StateName.map((name, i) => (i === index ? value : name)),
    }));
  };

  const handleLatitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      latitude: prevData.latitude.map((lat, i) => (i === index ? value : lat)),
    }));
  };

  const handleLongitudeChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      longitude: prevData.longitude.map((lon, i) => (i === index ? value : lon)),
    }));
  };

  const handleErrors = () => {
    let isError = false;

    if (!formData.countryId) {
      setError((prevError: any) => ({
        ...prevError,
        countries: "Country is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.stateName = [];

    formData.StateName.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.stateName[index] = 'State Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.stateName[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      stateName: newError.stateName,
    }));


    return isError;
  }

  const handleSubmit = async () => {
    if (handleErrors()) {
      return
    }

    if (formData.countryId && formData.StateName[0] !== "") {
      const stateData = {
        countryId: Number(formData.countryId),
        stateName: formData.StateName
          .map((stateName, index) => ({
            stateName: stateName,
            latitude: formData.latitude[index],
            longitude: formData.longitude[index],
          }))
          .filter((state) => state.stateName !== ""),
      };

      const url = "location/set-state";
      try {
        const response = await API.post(url, stateData);
        if (response.success) {
          if (response.data.pass.length > 0) {
            const dataPassed = response.data.pass;
            const passedName = dataPassed.map((name: any) => name.data.state_name).join(', ')
            toasterSuccess(`Following state/states have been added successfully: ${passedName} `)
          }
          if (response.data.fail.length > 0) {
            const dataFailed = response.data.fail;
            const failedName = dataFailed.map((name: any) => name.data.state_name).join(', ')
            toasterError(`Following state/states have been skipped as they already exist: ${failedName} `)
          }
          router.push('/master/location/state')
        }
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
    return <div> Loading...</div>;
  }
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
                <li>Location</li>
                <li>
                  <Link href="/master/location/state">
                    State
                  </Link>
                </li>
                <li>Add State</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div>
            <select
              className="w-60 border rounded px-2 py-1 mt-3 text-sm"
              value={formData.countryId}
              onChange={handleCountryChange}
              name="county_name"
            >
              <option value="" className="text-sm">
                Select Countries
              </option>
              {countries.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.county_name}
                </option>
              ))}
            </select>
            {error.countries && (
              <div className="text-red-500 text-sm mt-1">{error.countries}</div>
            )}
          </div>
          <div className='input-container mt-4'>
            <div className="input-container mt-4">
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="column gap-3 flex mt-4 m">
                  <div >
                    <input
                      type="text"
                      name={`StateName[${rowIndex}]`}
                      placeholder={translations.location.stateName}
                      className={`text-center text-sm border rounded px-2 py-1 ${error.stateName[rowIndex] !== "" ? "border-red-500" : "border"
                        }`}
                      value={formData.StateName[rowIndex]}
                      onChange={(event) => handleStateNameChange(event, rowIndex)}
                    />

                    {error.stateName[rowIndex] !== "" && (
                      <div className="text-red-500 text-sm">{error.stateName[rowIndex]}</div>
                    )}
                  </div>

                  <div className="column">
                    <input
                      type="number"
                      name={`latitude[${rowIndex}]`}
                      placeholder={translations.location.latitude}
                      className="text-center border rounded px-2 py-1 text-sm"
                      value={formData.latitude[rowIndex]}
                      onChange={(event) => handleLatitudeChange(event, rowIndex)}
                    />
                  </div>

                  <div className="column mr-3">
                    <input
                      type="number"
                      name={`longitude[${rowIndex}]`}
                      placeholder={translations.location.longitude}
                      className="text-center border rounded px-2 py-1 text-sm"
                      value={formData.longitude[rowIndex]}
                      onChange={(event) => handleLongitudeChange(event, rowIndex)}
                    />
                  </div>

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
        </div>
        {/* <hr className="mt-2 mb-4" /> */}
      </div>
    </>
  );
}