"use client";
import React, { useEffect, useState } from 'react';
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';
import useTitle from "@hooks/useTitle";
import API from '@lib/Api';
import { useRouter } from 'next/navigation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import Link from 'next/link';
interface Country {
  id: number;
  county_name: string;
}

interface State {
  id: number;
  state_name: string;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Add District")
  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districts: initializeInputFields,
  });
  const [error, setError] = useState({
    country: "",
    state: "",
    districts: '',
  })
  useEffect(() => {
    User.role()
  }, [])
  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

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

  const getStates = async () => {
    try {
      const res = await API.get(`location/get-states?countryId=${formData.countryId}&status=true`)
      if (res.success) {
        setStates(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    index: number = 0
  ) => {
    const { name, value } = event.target;

    if (name === "county_name") {
      setFormData((prevData) => ({
        ...prevData,
        countryId: value,
      }));
    } else if (name === "state_name") {
      setFormData((prevData) => ({
        ...prevData,
        stateId: value,
      }));
    } else {
      setFormData((prevData) => {
        const updateDistrictName = [...prevData.districts];
        updateDistrictName[index] = value;
        return {
          ...prevData,
          districts: updateDistrictName,
        };
      });
    }

    setError({
      country: "",
      state: "",
      districts: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      countryId: "",
      stateId: "",
      districts: initializeInputFields,
    });
    setError({
      country: "",
      state: "",
      districts: "",
    });
    window.history.back();
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.countryId) {
      setError((prevError) => ({
        ...prevError,
        country: "Please select a country",
      }));
    }

    if (!formData.stateId) {
      setError((prevError) => ({
        ...prevError,
        state: "Please select a state",
      }));
    }

    let isError = false;
    const newError: any = { ...error };
    newError.districts = [];
    formData.districts.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.districts[index] = 'District Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.districts[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      districts: newError.districts,
    }));

    if (formData.countryId && formData.stateId && !isError) {
      const stateData = {
        stateId: Number(formData.stateId),
        districtName: formData.districts.filter((district) => district !== "")
      };
      const url = "location/set-district";
      try {
        const response = await API.post(url, stateData);
        if (response.success) {
          if (response.data.pass.length > 0) {
            const dataPassed = response.data.pass;
            const passedName = dataPassed.map((name: any) => name.data.district_name).join(', ')
            toasterSuccess(`Following district/districts have been added successfully: ${passedName} `)
          }
          if (response.data.fail.length > 0) {
            const dataFailed = response.data.fail;
            const failedName = dataFailed.map((name: any) => name.data.district_name).join(', ')
            toasterError(`Following district/districts have been skipped as they already exist: ${failedName} `)
          }
          router.push('/master/location/district')
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const { translations, loading } = useTranslations();

  if (loading) { return <div> Loading...</div> }



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
              <li>Location</li>
              <li>
                <Link href="/master/location/district">
                  District
                </Link>
              </li>
              <li>Add District</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className=" ml-4 mt-3">
          <div className="flex gap-4">
            <div>
              <select className="w-60 border rounded px-2 py-1 text-sm"
                value={formData.countryId}
                onChange={(event) => handleChange(event)}
                name="county_name" >
                <option value="" className="text-sm">
                  Select Countries
                </option>
                {countries.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error.country && <p className="text-red-500 text-sm mt-1">{error.country}</p>}
            </div>
            <div>
              <select
                value={formData.stateId}
                onChange={(event) => handleChange(event)}
                name="state_name"
                placeholder="Select Country"
                className="w-60 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}

              </select>
              {error.state && <p className="text-red-500 text-sm mt-1">{error.state}</p>}
            </div>
          </div>

          <div className='input-container mt-4'>
            <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
              {initializeInputFields.map((district, index) => (
                <div className="mb-2" key={index}>
                  <input
                    id={`districts-${index}`}
                    type="text"
                    name="district_name"
                    placeholder={index === 0 ? translations.location.districtName + "*" : translations.location.districtName}
                    className={`text-center border rounded px-2 py-1 ${error.districts[index] !== "" ? 'border-red-500' : 'border'}`}
                    defaultValue={district}
                    onChange={(event) => handleChange(event, index)}
                  />
                  {error.districts[index] !== "" && (
                    <div className="text-red-500 text-sm">{error.districts[index]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="justify-between mt-4 px-2 space-x-3 ">
            <button className="bg-green-500 rounded text-white px-2 py-2 text-sm" onClick={handleSubmit}>{translations.common.submit}</button>
            <button className='bg-gray-300 rounded text-black px-2 py-2 text-sm' onClick={handleCancel}>{translations.common.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
