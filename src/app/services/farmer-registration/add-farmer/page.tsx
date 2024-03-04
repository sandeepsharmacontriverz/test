"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Form from "react-bootstrap/Form";
import DatePicker from "react-datepicker";

import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Loader from "@components/core/Loader";

import "react-datepicker/dist/react-datepicker.css";
import "react-tabs/style/react-tabs.css";

export default function page() {
  useTitle("Add Farmer");
  const [roleLoading] = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [programs, setProgram] = useState<any>();
  const [brands, setBrands] = useState<any>();
  const [farmGroups, setFarmGroups] = useState<any>();
  const [icsNames, setIcsNames] = useState<any>();
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [villages, setVillages] = useState<any>();
  const [joiningDate, setJoiningDate] = useState<any>();
  const [selectedProgram, setSelectedProgram] = useState<any>("");
  const [season, setSeason] = useState<any>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState<string>("");

  const [formData, setFormData] = useState<any>({
    programId: "",
    brandId: "",
    farmGroupId: "",
    firstName: "",
    lastName: "",
    code: "",
    countryId: "",
    stateId: "",
    seasonId: undefined,
    districtId: "",
    blockId: "",
    villageId: "",
    joiningDate: undefined,
    icsId: undefined,
    tracenetId: "",
    certStatus: undefined,
    agriTotalArea: "",
    agriEstimatedYield: "",
    agriEstimatedProd: "",
    cottonTotalArea: "",
    totalEstimatedCotton: "",
  });

  const [errors, setErrors] = useState({
    programId: "",
    brandId: "",
    farmGroupId: "",
    firstName: "",
    lastName: "",
    code: "",
    countryId: "",
    stateId: "",
    districtId: "",
    blockId: "",
    villageId: "",
    joiningDate: "",
    icsId: "",
    tracenetId: "",
    certStatus: "",
    totalCottonArea: "",
    seasonId: "",
    agriTotalArea: "",
    agriEstimatedYield: "",
    cottonTotalArea: "",
  });

  useEffect(() => {
    getPrograms();
    getCountries();
    getSeasons();
  }, []);

  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      icsId: undefined,
      tracenetId: "",
      certStatus: undefined,
    }));
    setFarmGroups([]);
    setBrands([]);

    if (formData.programId) {
      getBrands();
    }
  }, [formData.programId]);

  useEffect(() => {
    setFarmGroups([]);
    if (formData.brandId) {
      getFarmGroups();
    }
  }, [formData.brandId]);

  useEffect(() => {
    setIcsNames([]);
    if (formData.farmGroupId) {
      getIcsName();
    }
  }, [formData.farmGroupId]);

  useEffect(() => {
    setDistricts([]);
    setBlocks([]);
    setVillages([]);
    if (formData.countryId) {
      getStates();
    }
  }, [formData.countryId]);

  useEffect(() => {
    setBlocks([]);
    setVillages([]);
    if (formData.stateId) {
      getDistricts();
    }
  }, [formData.stateId]);

  useEffect(() => {
    setVillages([]);
    if (formData.districtId) {
      getBlocks();
    }
  }, [formData.districtId]);

  useEffect(() => {
    if (formData.blockId) {
      getVillages();
    }
  }, [formData.blockId]);

  useEffect(() => {
    if (formData.agriTotalArea && formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        agriEstimatedProd: (
          formData.agriTotalArea * formData.agriEstimatedYield
        )?.toFixed(2),
      }));
    }

    if (formData.cottonTotalArea * formData.agriEstimatedYield) {
      setFormData((prevData: any) => ({
        ...prevData,
        totalEstimatedCotton: (
          formData.cottonTotalArea * formData.agriEstimatedYield
        )?.toFixed(2),
      }));
    }
  }, [
    formData.agriTotalArea,
    formData.cottonTotalArea,
    formData.agriEstimatedYield,
  ]);
  useEffect(() => {
    if (formData.agriTotalArea && formData.agriEstimatedYield) {
      const newAgriEstimatedProd = (
        formData.agriTotalArea * formData.agriEstimatedYield
      )?.toFixed(2);
      if (newAgriEstimatedProd !== formData.agriEstimatedProd) {
        setFormData((prevData: any) => ({
          ...prevData,
          agriEstimatedProd: newAgriEstimatedProd,
        }));
      }
    }

    if (formData.cottonTotalArea && formData.agriEstimatedYield) {
      const newTotalEstimatedCotton = (
        formData.cottonTotalArea * formData.agriEstimatedYield
      )?.toFixed(2);
      if (newTotalEstimatedCotton !== formData.totalEstimatedCotton) {
        setFormData((prevData: any) => ({
          ...prevData,
          totalEstimatedCotton: newTotalEstimatedCotton,
        }));
      }
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

  const getSeasons = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      setSeason(response.data);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getPrograms = async () => {
    try {
      const res = await API.get("program");
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      if (formData.programId) {
        const res = await API.get(`brand?programId=${formData.programId}`);
        if (res.success) {
          setBrands(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFarmGroups = async () => {
    try {
      if (formData.brandId) {
        const res = await API.get(`farm-group?brandId=${formData.brandId}`);
        if (res.success) {
          setFarmGroups(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getIcsName = async () => {
    try {
      if (formData.farmGroupId) {
        const res = await API.get(`ics?farmGroupId=${formData.farmGroupId}`);
        if (res.success) {
          setIcsNames(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      if (formData.countryId) {
        const res = await API.get(
          `location/get-states?countryId=${formData.countryId}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getDistricts = async () => {
    try {
      const res = await API.get(
        `location/get-districts?stateId=${formData.stateId}`
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
        `location/get-blocks?districtId=${formData.districtId}`
      );
      if (res.success) {
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVillages = async () => {
    try {
      const res = await API.get(
        `location/get-villages?blockId=${formData.blockId}`
      );
      if (res.success) {
        setVillages(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    let isError = false;
    if (!formData.programId || formData.programId == "") {
      setErrors((prev) => ({
        ...prev,
        programId: "Program name is required",
      }));
      isError = true;
    }
    if (!formData.brandId || formData.brandId == "") {
      setErrors((prev) => ({
        ...prev,
        brandId: "Brand name is required",
      }));
      isError = true;
    }
    if (!formData.farmGroupId || formData.farmGroupId == "") {
      setErrors((prev) => ({
        ...prev,
        farmGroupId: "Farm Group name is required",
      }));
      isError = true;
    }
    if (!formData.firstName || formData.firstName == "") {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name is required",
      }));
      isError = true;
    }
    if (!formData.code || formData.code == "") {
      setErrors((prev) => ({
        ...prev,
        code: "Farmer code is required",
      }));
      isError = true;
    }
    if (!formData.countryId || formData.countryId == "") {
      setErrors((prev) => ({
        ...prev,
        countryId: "Country name is required",
      }));
      isError = true;
    }
    if (!formData.stateId || formData.stateId == "") {
      setErrors((prev) => ({
        ...prev,
        stateId: "State name is required",
      }));
      isError = true;
    }
    if (!formData.districtId || formData.districtId == "") {
      setErrors((prev) => ({
        ...prev,
        districtId: "District name is required",
      }));
      isError = true;
    }
    if (!formData.blockId || formData.blockId == "") {
      setErrors((prev) => ({
        ...prev,
        blockId: "Block name is required",
      }));
      isError = true;
    }
    if (!formData.villageId || formData.villageId == "") {
      setErrors((prev) => ({
        ...prev,
        villageId: "Village name is required",
      }));
      isError = true;
    }
    if (!formData.seasonId || formData.seasonId == "") {
      setErrors((prev) => ({
        ...prev,
        seasonId: "Season is required",
      }));
      isError = true;
    }
    if (!formData.joiningDate || formData.joiningDate == "") {
      setErrors((prev) => ({
        ...prev,
        joiningDate: "Date of Joining is required",
      }));
      isError = true;
    }
    if (
      selectedProgram === "Organic" &&
      (!formData.certStatus || formData.certStatus == "")
    ) {
      setErrors((prev) => ({
        ...prev,
        certStatus: "Selection of atleast one option is required",
      }));
      isError = true;
    }
    if (!formData.agriTotalArea || formData.agriTotalArea == "") {
      setErrors((prev) => ({
        ...prev,
        agriTotalArea: "Total Agriculture Area is required",
      }));
      isError = true;
    }
    if (!formData.agriEstimatedYield || formData.agriEstimatedYield == "") {
      setErrors((prev) => ({
        ...prev,
        agriEstimatedYield: "Estimated Yield is required",
      }));
      isError = true;
    }
    if (!formData.cottonTotalArea || formData.cottonTotalArea == "") {
      setErrors((prev) => ({
        ...prev,
        cottonTotalArea: "Total Cotton Area is required",
      }));
      isError = true;
    }

    if (!isError) {
      if (formData.tracenetId == "") {
        formData.tracenetId = undefined;
      }
      setIsSubmitting(true);
      try {
        const res = await API.post("farmer", formData);
        if (res.success) {
          toasterSuccess("Farmer created Successfully", 3000, formData.code);
          router.push("/services/farmer-registration");
          setIsSubmitting(false);
        } else {
          toasterError(res.error?.code, 3000, formData.code);
          setIsSubmitting(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        console.log(error);
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "programId") {
      setSelectedProgram("");
      let isOrganic = programs.filter(
        (item: any) => item.program_name === "Organic" && item.id == value
      );
      if (isOrganic?.length > 0) {
        setSelectedProgram("Organic");
      }
    }

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        brandId: "",
        farmGroupId: "",
        icsId: "",
      }));
    }

    if (name === "brandId") {
      setFormData((prevData: any) => ({
        ...prevData,
        farmGroupId: "",
        icsId: "",
      }));
    }

    if (name === "farmGroupId") {
      setFormData((prevData: any) => ({
        ...prevData,
        icsId: "",
      }));
    }

    if (name === "countryId") {
      setFormData((prevData: any) => ({
        ...prevData,
        stateId: "",
        blockId: "",
        districtId: "",
        villageId: "",
      }));
    }
    if (name === "stateId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        districtId: "",
        villageId: "",
      }));
    }
    if (name === "districtId") {
      setFormData((prevData: any) => ({
        ...prevData,
        blockId: "",
        villageId: "",
      }));
    }
    if (name === "blockId") {
      setFormData((prevData: any) => ({
        ...prevData,
        villageId: "",
      }));
    }

    setErrors((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const hanleKeyDownForNumberInput = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const allowedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleFrom = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setJoiningDate(date);

    setFormData((prevData: any) => ({
      ...prevData,
      joiningDate: newDate,
    }));

    setErrors((prevData: any) => ({
      ...prevData,
      joiningDate: "",
    }));
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
    setFormData((prevData: any) => ({
      ...prevData,
      certStatus: value,
    }));
    setErrors((prevData: any) => ({
      ...prevData,
      certStatus: "",
    }));
  };

  const onBlur = (e: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    if (name == "firstName") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        if (formData.firstName != "") {
          setErrors((prev) => ({
            ...prev,
            firstName:
              "Accepts only Alphabets and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "lastName") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        if (formData.lastName != "") {
          setErrors((prev) => ({
            ...prev,
            lastName:
              "Accepts only Alphabets and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "code") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        if (formData.code != "") {
          setErrors((prev) => ({
            ...prev,
            code: "Accepts only AlphaNumeric values and special characters like _,-,()",
          }));
        }
      }
    }
    if (name == "tracenetId") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        if (formData.tracenetId != "") {
          setErrors((prev) => ({
            ...prev,
            tracenetId:
              "Accepts only AlphaNumeric values and special characters like _,-,()",
          }));
        }
      }
    }
  };

  const onSaveNext = () => {
    let isError = false;

    if (!formData.programId || formData.programId == "") {
      setErrors((prev) => ({
        ...prev,
        programId: "Program name is required",
      }));
      isError = true;
    }
    if (!formData.brandId || formData.brandId == "") {
      setErrors((prev) => ({
        ...prev,
        brandId: "Brand name is required",
      }));
      isError = true;
    }
    if (!formData.farmGroupId || formData.farmGroupId == "") {
      setErrors((prev) => ({
        ...prev,
        farmGroupId: "Farm Group name is required",
      }));
      isError = true;
    }
    if (!formData.firstName || formData.firstName == "") {
      setErrors((prev) => ({
        ...prev,
        firstName: "First name is required",
      }));
      isError = true;
    }

    if (!formData.code || formData.code == "") {
      setErrors((prev) => ({
        ...prev,
        code: "Farmer code is required",
      }));
      isError = true;
    }
    if (!formData.countryId || formData.countryId == "") {
      setErrors((prev) => ({
        ...prev,
        countryId: "Country name is required",
      }));
      isError = true;
    }
    if (!formData.stateId || formData.stateId == "") {
      setErrors((prev) => ({
        ...prev,
        stateId: "State name is required",
      }));
      isError = true;
    }
    if (!formData.districtId || formData.districtId == "") {
      setErrors((prev) => ({
        ...prev,
        districtId: "District name is required",
      }));
      isError = true;
    }
    if (!formData.blockId || formData.blockId == "") {
      setErrors((prev) => ({
        ...prev,
        blockId: "Block name is required",
      }));
      isError = true;
    }
    if (!formData.villageId || formData.villageId == "") {
      setErrors((prev) => ({
        ...prev,
        villageId: "Village name is required",
      }));
      isError = true;
    }

    if (!formData.joiningDate || formData.joiningDate == "") {
      setErrors((prev) => ({
        ...prev,
        joiningDate: "Date of Joining is required",
      }));
      isError = true;
    }
    if (
      selectedProgram === "Organic" &&
      (!formData.certStatus || formData.certStatus == "")
    ) {
      setErrors((prev) => ({
        ...prev,
        certStatus: "Selection of atleast one option is required",
      }));
      isError = true;
    }

    if (
      !isError &&
      !errors.code &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.tracenetId
    ) {
      setTabIndex(1);
      setIsSaved(true);
    }
  };

  const { translations, loading } = useTranslations();
  if (roleLoading || loading) {
    return (
      <div>
        {" "}
        <Loader />
      </div>
    );
  }
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
                <Link href="/services/farmer-registration">
                  Farmer Registration
                </Link>
              </li>
              <li>Add Farmer</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <Tabs
          className="cutsomTabDesigns"
          selectedIndex={tabIndex}
          onSelect={(index) => setTabIndex(index)}
        >
          <TabList>
            <Tab>
              <span className={`${isSaved ? "doneAlready" : ""}`}>1</span>Farmer
              Details<div></div>
            </Tab>
            <Tab>
              <span>2</span>Farm Details<div></div>
            </Tab>
          </TabList>

          <TabPanel>
            <div className="w-100">
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Programme *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="programId"
                        onChange={handleChange}
                        value={formData.programId}
                      >
                        <option value="">Select a Program</option>
                        {programs?.map((program: any) => (
                          <option key={program.id} value={program.id}>
                            {program.program_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.programId && (
                        <p className="text-red-500 mt-1">{errors.programId}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Brand *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="brandId"
                        onChange={handleChange}
                        value={formData.brandId}
                      >
                        <option value="">Select a Brand</option>
                        {brands?.map((brand: any) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.brand_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.brandId && (
                        <p className="text-red-500 mt-1">{errors.brandId}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Farm Group *
                      </label>
                      <Form.Select
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="farmGroupId"
                        onChange={handleChange}
                        value={formData.farmGroupId}
                      >
                        <option value="">Select a Form Group</option>
                        {farmGroups?.map((farmGroup: any) => (
                          <option key={farmGroup.id} value={farmGroup.id}>
                            {farmGroup.name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.farmGroupId && (
                        <p className="text-red-500 mt-1">
                          {errors.farmGroupId}
                        </p>
                      )}
                    </div>
                    {selectedProgram === "Organic" && (
                      <>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            ICS Name *
                          </label>
                          <Form.Select
                            aria-label="Default select example"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="icsId"
                            onChange={handleChange}
                            value={formData.icsId}
                          >
                            <option value="">Select an ICS Name</option>
                            {icsNames?.map((icsName: any) => (
                              <option key={icsName.id} value={icsName.id}>
                                {icsName.ics_name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Tracenet ID *
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            type="text"
                            name="tracenetId"
                            // onBlur={onBlur}
                            value={formData.tracenetId}
                            placeholder="TraceNet Name"
                            onChange={handleChange}
                          />
                          {errors.tracenetId && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.tracenetId}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Certification Status *
                          </label>
                          <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="1"
                                  type="radio"
                                  name="certStatus"
                                  value="IC1"
                                  checked={selectedOption === "IC1"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC1
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="2"
                                  type="radio"
                                  name="certStatus"
                                  value="IC2"
                                  checked={selectedOption === "IC2"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC2
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="3"
                                  type="radio"
                                  name="certStatus"
                                  value="IC3"
                                  checked={selectedOption === "IC3"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC3
                            </label>
                            <label className="mt-1 d-flex mr-4 align-items-center">
                              <section>
                                <input
                                  id="4"
                                  type="radio"
                                  name="certStatus"
                                  value="Organic"
                                  checked={selectedOption === "Organic"}
                                  onChange={handleRadioChange}
                                />
                                <span></span>
                              </section>{" "}
                              IC4
                            </label>
                          </div>
                          {errors.certStatus && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.certStatus}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-100 mt-4">
              <h2 className="text-xl font-semibold">PERSONAL INFORMATION</h2>
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Date of Joining *
                      </label>
                      <DatePicker
                        selected={joiningDate}
                        onChange={handleFrom}
                        maxDate={new Date()}
                        showYearDropdown
                        placeholderText={translations.common.from + "*"}
                        className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      />
                      {errors.joiningDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.joiningDate}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        First Name *
                      </label>
                      <input
                        placeholder="Farmer First Name"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        // onBlur={onBlur}
                        autoComplete="off"
                        value={formData.firstName}
                        name="firstName"
                        onChange={handleChange}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Last Name *
                      </label>
                      <input
                        placeholder="Farmer Last Name"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        autoComplete="off"
                        // onBlur={onBlur}
                        value={formData.lastName}
                        name="lastName"
                        onChange={handleChange}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Farmers Code *
                      </label>
                      <input
                        placeholder="Enter Farmer Code"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        // onBlur={onBlur}
                        value={formData.code}
                        name="code"
                        onChange={handleChange}
                      />
                      {errors.code && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.code}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Select Country *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="countryId"
                        onChange={handleChange}
                        value={formData.countryId}
                      >
                        <option value="">Select a Country</option>
                        {countries?.map((countries: any) => (
                          <option key={countries.id} value={countries.id}>
                            {countries.county_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.countryId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.countryId}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        State *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="stateId"
                        onChange={handleChange}
                        value={formData.stateId}
                      >
                        <option value="">Select a State</option>
                        {states?.map((states: any) => (
                          <option key={states.id} value={states.id}>
                            {states.state_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.stateId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.stateId}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        District *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="districtId"
                        onChange={handleChange}
                        value={formData.districtId}
                      >
                        <option value="">Select a District</option>
                        {districts?.map((districts: any) => (
                          <option key={districts.id} value={districts.id}>
                            {districts.district_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.districtId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.districtId}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Taluka/Block *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="blockId"
                        onChange={handleChange}
                        value={formData.blockId}
                      >
                        <option value="">Select a Block</option>
                        {blocks?.map((blocks: any) => (
                          <option key={blocks.id} value={blocks.id}>
                            {blocks.block_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.blockId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.blockId}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Village *
                      </label>
                      <Form.Select
                        aria-label="Default select example"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                        name="villageId"
                        onChange={handleChange}
                        value={formData.villageId}
                      >
                        <option value="">Select a Village</option>
                        {villages?.map((villages: any) => (
                          <option key={villages.id} value={villages.id}>
                            {villages.village_name}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.villageId && (
                        <p className="text-red-500 ml-4 text-sm mt-1">
                          {errors.villageId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button className="btn-purple mr-2" onClick={onSaveNext}>
                      SAVE & NEXT
                    </button>
                    {/* <button className="btn-outline-purple">BACK</button> */}
                  </section>
                  <section>
                    <button
                      className="btn-outline-purple"
                      onClick={() =>
                        router.push("/services/farmer-registration")
                      }
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="w-100 mt-4">
              <h2 className="text-xl font-semibold">FARM DETAILS</h2>
              <div className="customFormSet">
                <div className="w-100">
                  <div className="row">
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
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Agriculture Area *
                      </label>
                      <input
                        placeholder="Enter Total Agriculture Area"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="agriTotalArea"
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.agriTotalArea}
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
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.agriEstimatedYield}
                        onChange={handleChange}
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
                        name="agriEstimatedProd"
                        disabled
                        value={(
                          formData.agriTotalArea * formData.agriEstimatedYield
                        )?.toFixed(2)}
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-4 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Cotton Area *
                      </label>
                      <input
                        placeholder="Enter Total Cotton Area"
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="cottonTotalArea"
                        onKeyDown={hanleKeyDownForNumberInput}
                        value={formData.cottonTotalArea}
                        onChange={handleChange}
                      />
                      <p className="text-red-500 w-full h-5 text-sm mt-1">
                        {errors.cottonTotalArea && errors.cottonTotalArea}
                      </p>
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
                        value={(
                          formData.cottonTotalArea * formData.agriEstimatedYield
                        )?.toFixed(2)}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      disabled={isSubmitting}
                      style={
                        isSubmitting
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : { cursor: "pointer", backgroundColor: "#D15E9C" }
                      }
                      onClick={handleSubmit}
                    >
                      SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => setTabIndex(0)}
                    >
                      BACK
                    </button>
                  </section>
                  <section>
                    <button
                      className="btn-outline-purple"
                      onClick={() =>
                        router.push("/services/farmer-registration")
                      }
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}
// }
