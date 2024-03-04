"use client";
import { useEffect, useRef, useState } from "react";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import { useRouter } from "next/navigation";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
interface Country {
  id: number;
  county_name: string;
}
interface State {
  id: number;
  state_name: string;
}
export default function Page() {
  useTitle("Add Village");
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    blockId: "",
    latitude: Array(16).fill(""),
    longitude: Array(16).fill(""),
    villageName: Array(16).fill(""),
  });

  const [error, setError] = useState<any>({
    countries: '',
    state: '',
    district: '',
    block: '',
    village: ''
  });

  useEffect(() => {
    User.role();
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

  useEffect(() => {
    if (formData.districtId) {
      getBlocks();
    }
  }, [formData.districtId]);

  const getCountries = async () => {
    const url = "location/get-countries?status=true";
    try {
      const response = await API.get(url);
      if (response.data && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?countryId=${formData.countryId}&status=true`
      );
      if (res.success) {
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}&status=true`
      );
      if (res.success) {
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      const res = await API.get(
        `location/get-blocks?districtId=${formData.districtId}&status=true`
      );
      if (res.success) {
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
        stateId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        countries: "",
      }));
    } else if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        districtId: "",
        blockId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        state: "",
      }));
    } else if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
      }));
      setError((prevError: any) => ({
        ...prevError,
        district: "",
      }));
    } else if (name === "blockId") {
      setError((prevError: any) => ({
        ...prevError,
        block: "",
      }));
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleVillageChange = (event: any, index: any) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      villageName: prevData.villageName.map((name, i) =>
        i === index ? value : name
      ),
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
      longitude: prevData.longitude.map((lon, i) =>
        i === index ? value : lon
      ),
    }));
  };




  const handleErrors = () => {
    let isError = false;

    if (!formData.countryId || formData.countryId === "") {
      setError((prevError: any) => ({
        ...prevError,
        countries: "Country is required",
      }));
      isError = true;
    }

    if (!formData.stateId) {
      setError((prevError: any) => ({
        ...prevError,
        state: "State Name is required",
      }));
      isError = true;
    }

    if (!formData.districtId) {
      setError((prevError: any) => ({
        ...prevError,
        district: "District Name is required",
      }));
      isError = true;
    }

    if (!formData.blockId) {
      setError((prevError: any) => ({
        ...prevError,
        block: "Block Name is required",
      }));
      isError = true;
    }

    const newError: any = { ...error };
    newError.village = [];
    formData.villageName.map((inputValue, index) => {
      const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
      const valid = regex.test(inputValue);

      if (index === 0 && inputValue === '') {
        newError.village[index] = 'Village Name is required.';
        isError = true;

      } else if (!valid) {
        if (inputValue != '') {
          newError.village[index] = 'Enter Only Alphabets, Digits, Space, (, ), - and _';
          isError = true;
        }
      }
    });
    setError((prevError: any) => ({
      ...prevError,
      village: newError.village,
    }));


    return isError;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (handleErrors()) {
      return;
    }
    if (
      formData.countryId &&
      formData.stateId &&
      formData.districtId &&
      formData.blockId &&
      formData.villageName[0] !== ""
    ) {
      const villageData = {
        blockId: Number(formData.blockId),
        village: formData.villageName
          .map((villageName: any, index: any) => ({
            villageName: villageName,
            latitude: formData.latitude[index],
            longitude: formData.longitude[index],
          }))
          .filter((village: any) => village.villageName !== ""),
      };

      const url = "location/set-village";
      try {
        const response = await API.post(url, villageData);
        if (response.data.pass.length > 0) {
          const dataPassed = response.data.pass;
          const passedName = dataPassed.map((name: any) => name.data.village_name).join(', ')
          toasterSuccess(`Following village/villages have been added successfully: ${passedName} `)
        }
        if (response.data.fail.length > 0) {
          const dataFailed = response.data.fail;
          const failedName = dataFailed.map((name: any) => name.data.village_name).join(', ')
          toasterError(`Following village/villages have been skipped as they already exist: ${failedName} `)
        }
        router.push('/master/location/village')
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
                  <Link href="/master/location/village">
                    Village
                  </Link>
                </li>
                <li>Add Village</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="flex flex-wrap">
            <div>
              <select
                value={formData.countryId}
                onChange={(event) => handleChange(event)}
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
              {error?.countries && (
                <div className="text-red-500 text-sm mt-1">{error.countries}</div>
              )}
            </div>
            <div>
              <select
                value={formData.stateId}
                onChange={(event) => handleChange(event)}
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
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
              {error?.state && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.state}
                </div>
              )}
            </div>
            <div>
              <select
                value={formData.districtId}
                onChange={(event) => handleChange(event)}
                name="districtId"
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              >
                <option value="">Select District*</option>
                {districts?.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {error?.district && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.district}
                </div>
              )}
            </div>
            <div>
              <select
                value={formData.blockId}
                onChange={(event) => handleChange(event)}
                name="blockId"
                className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
              >
                <option value="">Select Block*</option>
                {blocks?.map((block: any) => (
                  <option key={block.id} value={block.id}>
                    {block.block_name}
                  </option>
                ))}
              </select>
              {error?.block && (
                <div className="text-red-500 text-sm ml-5 mt-1">
                  {error.block}
                </div>
              )}
            </div>
          </div>

          <div className="input-container mt-4">
            <div className="input-container mt-4">
              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="column gap-3 flex mt-4 m">
                  <div>
                    <input
                      type="text"
                      name={`villageName[${rowIndex}]`}
                      placeholder={translations.location.village}
                      className={`text-center text-sm border rounded px-2 py-1 ${rowIndex === 0 && error.village
                        ? "border-red-500"
                        : "border"
                        }`}
                      value={formData.villageName[rowIndex]}
                      onChange={(event) => handleVillageChange(event, rowIndex)}
                    />

                    {/* {rowIndex === 0 && error?.village && (
                    <div className="text-red-500 text-sm">
                      {error.village}
                    </div>
                  )} */}

                    {error.village[rowIndex] !== "" && (
                      <div className="text-red-500 text-sm">{error.village[rowIndex]}</div>
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
