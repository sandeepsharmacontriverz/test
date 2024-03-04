"use client"
import React, { useEffect, useState } from 'react';
import useTranslations from '@hooks/useTranslation'
import User from '@lib/User';
import useTitle from "@hooks/useTitle";
import { useRouter } from 'next/navigation';
import { toasterSuccess, toasterError } from '@components/core/Toaster'

import API from '@lib/Api';
import Link from 'next/link';
interface Country {
  id: number;
  county_name: string;
}
interface State {
  id: number;
  state_name: string;
}
export default function Page() {
  useTitle("Add Block")
  const router = useRouter()
  const [initializeInputFields] = useState(Array(16).fill(""))
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [districts, setDistricts] = useState([])
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    blockname: initializeInputFields
  })
  const [error, setError] = useState({
    countryname: "",
    statename: "",
    districtname: "",
    blockname: ""
  })


  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    if (formData.stateId) {
      getDistricts();
    }
  }, [formData.stateId]);

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

  const getDistricts = async () => {
    try {
      const res = await API.get(`location/get-districts?stateId=${formData.stateId}&status=true`)
      if (res.success) {
        setDistricts(res.data)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError({
      countryname: "",
      statename: "",
      districtname: "",
      blockname: "",
    });

    if (!formData.countryId) {
      setError((prevError) => ({
        ...prevError,
        countryname: "Country Name is Required",
      }));
    }

    if (!formData.stateId) {
      setError((prevError) => ({
        ...prevError,
        statename: "State Name is Required",
      }));
    }

    if (!formData.districtId) {
      setError((prevError) => ({
        ...prevError,
        districtname: "District Name is Required",

      }));
    }

    let isError = false;
    const newError: any = { ...error };
    newError.blockname = [];
    formData.blockname.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue)
      if (index === 0 && inputValue === '') {
        newError.blockname[index] = 'Taluk/Block Name is required.';
        isError = true;
      } else if (!valid) {
        if (inputValue != '') {
          newError.blockname[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      blockname: newError.blockname,
    }));

    if (formData.countryId && formData.stateId && formData.districtId && !isError) {
      const stateData = {
        districtId: Number(formData.districtId),
        blockName: formData.blockname.filter((block) => block !== "")
      };
      const url = "location/set-block";
      try {
        const response = await API.post(url, stateData);
        if (response.success) {
          if (response.data.pass.length > 0) {
            const dataPassed = response.data.pass;
            const passedName = dataPassed.map((name: any) => name.data.block_name).join(', ')
            toasterSuccess(`Following block/blocks have been added successfully: ${passedName} `)
          }
          if (response.data.fail.length > 0) {
            const dataFailed = response.data.fail;
            const failedName = dataFailed.map((name: any) => name.data.block_name).join(', ')
            toasterError(`Following block/blocks have been skipped as they already exist: ${failedName} `)
          }
          router.push('/master/location/block')
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  }
  const handleCancel = () => {
    setFormData({
      countryId: "",
      stateId: "",
      districtId: "",
      blockname: initializeInputFields,
    });
    setError({
      countryname: "",
      statename: "",
      districtname: "",
      blockname: "",
    });
    window.history.back();
  };
  useEffect(() => {
    User.role()
  }, [])

  const { translations, loading } = useTranslations();

  if (loading) { return <div> Loading...</div> }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleBlockChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = event.target;

    setFormData((prevData: any) => {
      const newBlockname = [...prevData.blockname];
      newBlockname[index] = value;

      return {
        ...prevData,
        blockname: newBlockname,
      };
    });
  };

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
                <Link href="/master/location/block">
                  Block
                </Link>
              </li>
              <li>Add Block</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex flex-wrap gap-5" >
          <div>
            <select
              value={formData.countryId}
              onChange={handleChange}
              className="w-60 border rounded px-2 py-1 mt-3 text-sm"
              name="countryId"
            >
              <option value="">Select Country *</option>
              {countries.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.county_name}
                </option>
              ))}
            </select>
            {error.countryname && (
              <div className="text-red-500 text-sm mt-1">
                {error.countryname}
              </div>
            )}
          </div>
          <div>
            <select
              value={formData.stateId}
              onChange={handleChange}
              className="w-60 border rounded px-2 py-1 mt-3 text-sm"
              // onChange={(event) => handleChange(event)}
              name="stateId"
            >
              <option value="">Select State *</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.state_name}
                </option>
              ))}
            </select>
            {error.statename && (
              <div className="text-red-500 text-sm mt-1">
                {error.statename}
              </div>
            )}
          </div>
          <div>
            <select
              value={formData.districtId}
              onChange={handleChange}
              name="districtId"
              className="w-60 border rounded px-2 py-1 mt-3 text-sm"
            >
              <option value="">Select District*</option>
              {districts?.map((district: any) => (
                <option key={district.id} value={district.id}>{district.district_name}</option>
              ))}
            </select>
            {error.districtname && (
              <div className="text-red-500 text-sm mt-1">
                {error.districtname}
              </div>
            )}
          </div>
        </div>
        <div className='input-container mt-4'>
          <div className="columns-4 mt-3 lg:columns-4 sm:columns-2 text-sm">
            {initializeInputFields.map((blockname, index) => (
              <div className="mb-2" key={index}>
                <input
                  id={`blockname-${index}`}
                  type="text"
                  name={`blockname[${index}]`}
                  placeholder={index === 0 ? translations.location.taluk + "*" : translations.location.taluk}
                  className={`text-center border rounded px-2 py-1 w-full ${error.blockname[index] !== "" ? 'border-red-500' : 'border'}`}
                  value={formData.blockname[index]}
                  onChange={(event) => handleBlockChange(event, index)}
                />
                {error.blockname[index] !== "" && (
                  <div className="text-red-500 text-sm">{error.blockname[index]}</div>
                )}
              </div>
            ))}

          </div>
        </div>

        <div className=" justify-between mt-4 px-2 space-x-3 border-y py-2">
          <button className="bg-green-500 rounded text-white px-2 py-2 text-sm " onClick={handleSubmit}>{translations.common.submit}</button>
          <button className='bg-gray-300 rounded text-black px-2 py-2 text-sm' onClick={handleCancel}>{translations.common.cancel}</button>
        </div>
      </div>
    </div>
  );
}
