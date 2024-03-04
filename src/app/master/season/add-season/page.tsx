"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation"
import API from "@lib/Api";
import { useRouter } from "next/navigation";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  useTitle("Add Season");
  const [roleLoading] = useRole();
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [errorCode, setErrorCode] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    from: null,
    to: null,
  });
  const [error, setError] = useState({
    name: "",
    from: "",
    to: "",
  });

  const addData = async () => {
    if (formData.name && formData.from && formData.to) {
      const url = "season";
      try {
        const response = await API.post(url, formData);
        if (response.success) {
          toasterSuccess(
            `Following season(s) have been added successfully: ${response.data.name} `
          );
          router.back();
        } else {
          toasterError(response.error.code);
          setErrorCode(response.error.code);
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let isError = false;
    const regex: any = /^[0-9\-]+$/;
    const valid = regex.test(formData.name);
    if (!formData.name || !valid) {
      setError((prevError) => ({
        ...prevError,
        name: !formData.name ? "Season Name is required" : "Enter Only Digits and hyphen(-)",
      }));
      isError = true;
    } else {
      setError((prevError) => ({
        ...prevError,
        name: "",
      }));
    }
    if (formData.from === null) {
      setError((prevError) => ({
        ...prevError,
        from: "From date is required",
      }));
      isError = true;
    } else {
      setError((prevError) => ({
        ...prevError,
        from: "",
      }));
    }
    if (formData.to === null) {
      setError((prevError) => ({
        ...prevError,
        to: "To date is required",
      }));
      isError = true;
    } else {
      setError((prevError) => ({
        ...prevError,
        to: "",
      }));
    }
    if (from && to && from > to) {
      alert("From year cannot be greater than To year.");
      isError = true;
    }

    if (!isError) {
      addData();
    }
  };
  const handleCancel = () => {
    window.history.back();
  };
  const handleFrom = (date: Date | null) => {
    if (date) {
      let d = new Date(date);
      d.setHours(d.getHours() + 5);
      d.setMinutes(d.getMinutes() + 30);
      const newDate: any = d.toISOString();
      setFrom(date);
      setFormData((prevFormData) => ({
        ...prevFormData,
        from: newDate,
      }));
    } else {
      setFrom(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        from: null,
      }));
    }
  };

  const handleEndDate = (date: Date | null) => {
    if (date) {
      let d = new Date(date);
      d.setHours(d.getHours() + 5);
      d.setMinutes(d.getMinutes() + 30);
      const newDate: any = d.toISOString();
      setTo(date);
      setFormData((prevFormData) => ({
        ...prevFormData,
        to: newDate,
      }));
    } else {
      setTo(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        to: null,
      }));
    }
  };

  const handleSeasonNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      name: value,
    }));
  };

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
                  <li>
                    <Link href="/dashboard" className="active">
                      <span className="icon-home"></span>
                    </Link>
                  </li>
                  <li>Master</li>
                  <li>
                    <Link href="/master/season">
                      Season
                    </Link>
                  </li>
                  <li>Add Season</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4">
            <div className="flex">
              <div>
                <input
                  type="text"
                  className="w-60 border rounded px-2 py-1 mt-3  text-sm"
                  placeholder={translations.seasonName + "*"}
                  value={formData.name}
                  onChange={handleSeasonNameChange}
                />

                {error.name ? (
                  <p className="text-red-500 text-sm mt-1">{error.name}</p>
                ) : (
                  errorCode && (
                    <p className="text-red-500 text-sm mt-1">{errorCode}</p>
                  )
                )}
              </div>
              <div>
                <DatePicker
                  selected={from}
                  selectsStart
                  startDate={from}
                  endDate={to}
                  onChange={handleFrom}
                  showYearDropdown
                  placeholderText={translations.common.from + "*"}
                  className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
                />
                {error.from && (
                  <p className="text-red-500 ml-5 text-sm mt-1">{error.from}</p>
                )}
              </div>
              <div>
                <DatePicker
                  selected={to}
                  selectsEnd
                  startDate={from}
                  endDate={to}
                  minDate={from}
                  onChange={handleEndDate}
                  showYearDropdown
                  placeholderText={translations.common.to + "*"}
                  className="w-60 border rounded px-2 py-1 mt-3 ml-5 text-sm"
                />
                {error.to && (
                  <p className="text-red-500 ml-5 text-sm mt-1">{error.to}</p>
                )}
              </div>
            </div>

            <div className=" justify-between mt-4 mx-4 space-x-3 border-t border-b py-2 px-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-green-600 text-sm rounded text-white px-2 py-1.5 "
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
    );
  }
}
