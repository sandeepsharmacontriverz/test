"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "next/navigation";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Form from "react-bootstrap/Form";


export default function page() {
  useTitle("Edit Farm");
  const [roleLoading] = useRole();
  const searchParams = useSearchParams();
  const farmId: any = searchParams.get("id");
  const farm: any = searchParams.get("farmId")
  const [data, setData] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [season, setSeason] = useState<any>([]);

  const [errors, setErrors] = useState({
    area: "",
    seasonId: "",
    agriTotalArea: "",
    agriEstimatedYield: "",
    cottonTotalArea: "",
  });

  const [formData, setFormData] = useState<any>({
    id: farmId,
    farmerId: "",
    programId: "",
    seasonId: "",
    agriTotalArea: "",
    agriEstimatedYield: "",
    agriEstimatedProd: "",
    cottonTotalArea: "",
    totalEstimatedCotton: "",
  });

  const router = useRouter();

  useEffect(() => {
    getFarmerData();
    getSeasons();
  }, []);

  useEffect(() => {
    if (formData.agriTotalArea && formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        agriEstimatedProd: (formData.agriTotalArea * formData.agriEstimatedYield)?.toFixed(2),
      }));
    }

    if (formData.cottonTotalArea * formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        totalEstimatedCotton:
          (formData.cottonTotalArea * formData.agriEstimatedYield)?.toFixed(2),
      }));
    }
  }, [
    formData.agriTotalArea,
    formData.cottonTotalArea,
    formData.agriEstimatedYield,
  ]);

  useEffect(() => {
    if (Number(formData.cottonTotalArea) > Number(formData.agriTotalArea)) {
      setErrors((prevError) => ({
        ...prevError,
        cottonTotalArea: "Value should be lesser than total agriculture area",
      }));
    } else {
      setErrors((prevError) => ({
        ...prevError,
        cottonTotalArea: "",
      }));
    }
  }, [formData.cottonTotalArea, formData.agriTotalArea]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const getFarmerData = async () => {
    const url = `farmer/farm/get-farm?id=${farmId}`;
    try {
      const response = await API.get(url);
      setData(response.data.farmer);
      setFormData((prevData: any) => ({
        ...prevData,
        programId: response.data?.program_id,
        farmerId: response.data?.farmer_id,
        seasonId: response.data?.season_id,
        agriTotalArea: response.data?.agri_total_area,
        agriEstimatedYield: response.data?.agri_estimated_yeld,
        agriEstimatedProd: response.data?.agri_estimated_prod,
        cottonTotalArea: response.data?.cotton_total_area,
        totalEstimatedCotton: response.data?.total_estimated_cotton,
      }));
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSeasons = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      setSeason(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleSubmit = async () => {
    let isError = false;

    if (!formData.agriTotalArea) {
      setErrors((prevError) => ({
        ...prevError,
        agriTotalArea: "This field is required",
      }));
      isError = true;
    }
    if (!formData.seasonId) {
      setErrors((prevError) => ({
        ...prevError,
        seasonId: "Season is required",
      }));
      isError = true;

    }
    if (!formData.agriEstimatedYield) {
      setErrors((prevError) => ({
        ...prevError,
        agriEstimatedYield: "This field is required",
      }));
      isError = true;

    }
    if (!formData.cottonTotalArea) {
      setErrors((prevError) => ({
        ...prevError,
        cottonTotalArea: "This field is required",
      }));
      isError = true;

    }

    if (!isError) {
      const url = `farmer/farm`;
      setIsSubmitting(true);
      try {
        const response = await API.put(url, formData);
        if (response.success) {
          toasterSuccess("Farm Updated Successfully", 3000, formData.id);
          router.push(`/services/farmer-registration/view-farmer-details?farmer=${formData.farmerId}&id=${farm}`);
        }
        else {
          setIsSubmitting(false);
          toasterError(response.error.code, 3000, farm)
        }
      } catch (error) {
        console.log(error, "error");
        toasterError("Failed to update farm", 3000, formData.id);
        setIsSubmitting(false);
      }
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
                <li>Services</li>
                <li>
                  <Link href={`/services/farmer-registration/view-farmer-details?farmer=${formData.farmerId}&id=${farm}`}>
                    Farmer
                  </Link>
                </li>
                <li>Edit Farm</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <h2 className="text-xl font-semibold">EDIT FARM DETAILS</h2>
            <div className="customFormSet">
              <div className="w-100">
                <div className="mt-4">
                  <h4 className="text-md font-semibold">FARMER INFORMATION</h4>
                </div>
                <div className="row mb-4">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Farmer Name
                    </label>
                    <p className="mt-1">{data?.firstName + " " + data?.lastName}</p>
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season *
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="seasonId"
                      onChange={handleChange}
                      value={formData.seasonId}
                    >
                      <option value="">Select a Season</option>
                      {season.map((season: any) => (
                        <option key={season.id} value={season.id}>
                          {season.name}
                        </option>
                      ))}
                    </Form.Select>
                    {errors.seasonId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.seasonId}
                      </p>
                    )}
                  </div>
                </div>
                <hr />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">AGRICULTURE AREA:</h4>
                </div>
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Agriculture Area *
                    </label>
                    <input
                      placeholder="Enter Total Agriculture Area"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      value={formData.agriTotalArea}
                      name="agriTotalArea"
                      onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                      onChange={handleChange}
                    />
                    {errors.agriTotalArea && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.agriTotalArea}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Estimated Yield (Kg/Ac) *
                    </label>
                    <input
                      placeholder="Enter Estimated Yield (Kg/Ac)"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="agriEstimatedYield"
                      onChange={handleChange}
                      onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                      value={formData.agriEstimatedYield}
                    />
                    {errors.agriEstimatedYield && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.agriEstimatedYield}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Estimated Production *
                    </label>
                    <input
                      placeholder="Enter Total Estimated Production"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="agriEstimatedProd"
                      // onChange={handleChange}
                      value={
                        (formData.agriTotalArea * formData.agriEstimatedYield)?.toFixed(2)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-md font-semibold">COTTON AREA:</h4>
                </div>
                <div className="row">
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Cotton Area *
                    </label>
                    <input
                      placeholder="Enter Total Cotton Area"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="cottonTotalArea"
                      onChange={handleChange}
                      onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                      value={formData.cottonTotalArea}
                    />
                    {errors.cottonTotalArea && (
                      <p className="text-red-500 w-full text-sm mt-1">
                        {errors.cottonTotalArea}
                      </p>
                    )}
                  </div>
                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Estimated Cotton *
                    </label>
                    <input
                      placeholder="Enter Total Estimated Cotton"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      disabled
                      name="totalEstimatedCotton"
                      // onChange={handleChange}
                      value={
                        (formData.cottonTotalArea * formData.agriEstimatedYield)?.toFixed(2)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                <section>
                  <button className="btn-purple mr-2"      
                  disabled={isSubmitting}
                    style={
                      isSubmitting
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    } 
                    onClick={handleSubmit}>
                    SUBMIT
                  </button>
                  <button
                    className="btn-outline-purple"
                    onClick={() => router.push(`/services/farmer-registration/view-farmer-details?farmer=${formData.farmerId}&id=${farm}`)}
                  >
                    BACK
                  </button>
                </section>
                <section>
                  <button
                    className="btn-outline-purple"
                    onClick={() => router.push("/services/farmer-registration")}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
