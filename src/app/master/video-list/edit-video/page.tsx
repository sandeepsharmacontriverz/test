"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { toasterSuccess } from "@components/core/Toaster";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const processorData = [
  "Trader",
  "Garment",
  "Knitter",
  "Weaving",
  "Spinner",
  "Ginner",
  "Fabric",
];

export default function page() {
  useTitle("Edit Video");
  const [roleLoading] = useRole();
  const router = useRouter();

  const searchParams = useSearchParams();
  const id: any = searchParams.get("id");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [initialCountry, setInitialCountry] = useState([]);
  const [initialBrand, setInitialBrand] = useState([]);
  const [formData, setFormData] = useState<any>({
    id: "",
    country: "",
    brand: "",
    processor: "",
    title: "",
    description: "",
    video: "",
  });
  const [error, setError] = useState({
    country: "",
    brand: "",
    processor: "",
    title: "",
    description: "",
    video: "",
  });

  const getVideoList = async () => {
    const url = `video`;
    try {
      const response = await API.get(url);
      const filteredVideo = response.data.filter(
        (video: any) => video.id === parseInt(id, 10)
      );
      if (filteredVideo.length > 0) {
        const selectedVideo: any = filteredVideo[0];

        const matchCountryNames: any = countryOptions
          .filter((country: any) => selectedVideo.country.includes(country.id))
          .map((country: any) => country.county_name);

        setInitialCountry(matchCountryNames);

        const matchBrandNames: any = brandOptions
          .filter((brand: any) => selectedVideo.brand.includes(brand.id))
          .map((brand: any) => brand.brand_name);

        setInitialBrand(matchBrandNames);

        setFormData({
          id: selectedVideo.id,
          country: selectedVideo.country,
          brand: selectedVideo.brand,
          processor: selectedVideo.processor,
          title: selectedVideo.title,
          description: selectedVideo.description,
          video: selectedVideo.video,
        });
        setData(filteredVideo);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    setIsClient(true);
    getVideoList();
  }, [countryOptions, brandOptions]);


  const dataUpload = async (e: any) => {
    const allowedFormats = ["mp4", "m4a", "avi", "wmv"];
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    const maxFileSize = 500 * 1024 * 1024;
    if (selectedFile.size > maxFileSize) {
      setError((prevError) => ({
        ...prevError,
        video: "File size exceeds the maximum limit (500MB).",
      }));

      e.target.value = "";
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError((prevError) => ({
        ...prevError,
        video:
          "Invalid file format.Upload a valid Format video",
      }));

      e.target.value = "";
      return;
    }

    const url = "file/upload";
    const dataVideo = new FormData();
    dataVideo.append("file", selectedFile);

    try {
      const response = await API.postFile(url, dataVideo);
      if (response.success) {
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          video: response.data,
        }));

        setError((prevError) => ({
          ...prevError,
          video: "",
        }));
      }
    } catch (error) {
      console.error(error, "error");
    }
  };

  const handleChange = async (e: any) => {
    if (e.target.name === "video") {
      dataUpload(e);
    } else {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError({
      country: "",
      brand: "",
      processor: "",
      title: "",
      description: "",
      video: "",
    });
    if (formData.country.length === 0) {
      setError((prevError) => ({
        ...prevError,
        country: "Country is required",
      }));
    }
    if (formData.brand.length === 0) {
      setError((prevError) => ({
        ...prevError,
        brand: "Brand is required",
      }));
    }
    if (!formData.processor) {
      setError((prevError) => ({
        ...prevError,
        processor: "Processor is required",
      }));
    }

    if (!formData.title) {
      setError((prevError) => ({
        ...prevError,
        title: "Title  is required",
      }));
    }
    if (!formData.description) {
      setError((prevError) => ({
        ...prevError,
        description: "Description  is required",
      }));
    }

    if (!formData.video || error.video) {
      setError((prevError) => ({
        ...prevError,
        video: "Video is required and must be in a valid format.",
      }));
    } else {
      if (
        formData.country &&
        formData.brand &&
        formData.processor &&
        formData.title &&
        formData.description &&
        formData.video
      ) {
        const url = "video";
        try {
          const response = await API.put(url, formData);
          if (response.success) {
            toasterSuccess("Record edited successfully");
            router.back();
          }
        } catch (error) {
          console.log(error, "error");
        }
      }
    }
  };

  const getBrandNames = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrandOptions(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getCountriesNames = async () => {
    const url = "location/get-countries";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountryOptions(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  useEffect(() => {
    getBrandNames();
    getCountriesNames();
  }, []);

  const handleSelectionChange = (selectedOptions: string[], name: string) => {
    if (name === "country") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = countryOptions.find((option: any) => {
            return option.county_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, country: result };
      });
    } else if (name === "brand") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = brandOptions.find((option: any) => {
            return option.brand_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, brand: result };
      });
    }
  };

  if (!roleLoading) {
    return (
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
                  <Link href="/master/video-list">
                    Video
                  </Link>
                </li>
                <li>Edit Video</li>
              </ul>
            </div>
          </div>
        </div>
        {isClient ? (
          <>
            <hr className="mt-8 mb-8 border-black border-2 w-full" />
            <div className="bg-white rounded-md p-4">

              <div className="flex justify-center items-center ">
                <div className="justify-center">
                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Country{" "}
                    </label>
                    <div className="w-80 px-2 text-sm ml-32">
                      <MultiSelectDropdown
                        initiallySelected={initialCountry}
                        name="country"
                        options={countryOptions?.map((item: any) => {
                          return item.county_name;
                        })}
                        onChange={handleSelectionChange}
                      />
                      {error.country && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Brand{" "}
                    </label>
                    <div className="w-80 px-2 text-sm ml-32">
                      <MultiSelectDropdown
                        initiallySelected={initialBrand}
                        name="brand"
                        options={brandOptions?.map((item: any) => {
                          return item.brand_name;
                        })}
                        onChange={handleSelectionChange}
                      />
                      {error.brand && (
                        <p className="text-red-500 text-sm mt-1">{error.brand}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Processor Type{" "}
                    </label>
                    <div>
                      <select
                        className="w-80 border rounded px-2 py-1 text-sm ml-20"
                        value={formData.processor}
                        name="processor"
                        onChange={handleChange}
                      >
                        <option value="">Select Processor</option>
                        {processorData?.map((name: any) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      {error.processor && (
                        <p className="text-red-500 text-sm ml-24  mt-1">
                          {error.processor}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Title{" "}
                    </label>
                    <div>
                      <input
                        type="text"
                        onChange={handleChange}
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        className="w-80  border rounded px-2 py-1 text-sm ml-40"
                      />
                      {error.title && (
                        <p className="text-red-500 ml-40 text-sm mt-1">
                          {error.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Description{" "}
                    </label>
                    <div>
                      <input
                        type="text"
                        onChange={handleChange}
                        name="description"
                        value={formData.description}
                        placeholder="Description"
                        className="w-80 border rounded px-2 py-1 text-sm ml-32"
                      />
                      {error.description && (
                        <p className="text-red-500 text-sm ml-32 mt-1">
                          {error.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex mt-5 justify-between">
                    <label className="block text-sm font-medium text-gray-700 sm:col-span-4 ml-5">
                      Video Upload{" "}
                    </label>
                    <div>
                      <input
                        type="file"
                        onChange={handleChange}
                        name="video"
                        className="w-80 text-center border rounded px-2 py-1 text-sm ml-32"
                      />
                      <p className="text-sm text-gray-500 ml-32 mt-2 ">
                        (Max: 500mb) (Format: mp4/m4a/avi/wmv){" "}
                      </p>

                      {formData.video && (
                        <p className="text-sm ml-32 text-gray-500 mt-2 truncate max-w-xs">
                          {formData.video}
                        </p>
                      )}
                      {error.video && (
                        <p className="text-red-500 ml-32 text-sm mt-1">
                          {error.video}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* <hr className=" mt-5 mb-5" /> */}

              <div className="justify-between mt-4 px-2 space-x-3 ">
                <button
                  className="bg-green-500 rounded text-white px-2 py-2 text-sm"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  className="bg-gray-300 rounded text-black px-2 py-2 text-sm"
                  onClick={() => router.back()}
                  type="button"
                >
                  Cancel
                </button>
              </div>
              {/* <hr className="mt-5 mb-5" /> */}
            </div>
          </>
        ) : (
          "Loading"
        )}
      </div>
    );
  }
}
