"use client";
import useTranslations from "@hooks/useTranslation";
import React, { useState, useEffect, useRef } from "react";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import * as XLSX from "xlsx";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  toasterError,
  toasterInfo,
  toasterSuccess,
} from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("New Process");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [Access, setAccess] = useState<any>({});

  const ginnerId = User.ginnerId;

  const [jsonStructure, setJsonStructure] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState("");

  const [season, setSeason] = useState<any>();
  const [program, setProgram] = useState<any>();
  const [from, setFrom] = useState<Date | null>(new Date());
  const [chooseCottonData, setChoosecottonData] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSelected, setIsSelected] = useState<any>(true);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [dataLength, setDataLength] = useState(0);

  const [formData, setFormData] = useState<any>({
    programId: "",
    seasonId: null,
    date: new Date(),
    totalQty: null,
    noOfBales: null,
    got: null,
    lotNo: "",
    heapNumber: "",
    heapRegister: null,
    weighBridge: null,
    deliveryChallan: null,
    baleProcess: null,
    reelLotNno: "",
    pressNo: "",
  });

  const [fileName, setFileName] = useState({
    upload: "",
    heapRegister: "",
    weighBridge: "",
    deliveryChallan: "",
    baleProcess: "",
  });

  const [ginOutRange, setGinOutRange] = useState<any>({
    from: "",
    to: "",
  });

  const requiredFields = ["seasonId", "date", "lotNo", "got", "upload", "heapNumber", "heapRegister", "weighBridge", "deliveryChallan", "baleProcess"];
  useEffect(() => {
    if (ginnerId) {
      fetchProcessesLength();
      getGinnerData();
      getSeason();
      getProgram();
    }
  }, [ginnerId]);

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Ginner")) {
      const access = checkAccess("Ginner Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (ginnerId) {
      const savedData: any = sessionStorage.getItem("ginnerProcess");
      const totalQuantity: any = sessionStorage.getItem("ginnerCotton");
      const processData = JSON.parse(savedData);
      const cottonData = JSON.parse(totalQuantity);
      if (processData) {
        setFormData(processData);
      }
      setFormData((prev: any) => ({
        ...prev,
        totalQty: !cottonData ? "" : Number(cottonData[0]?.total_qty_used),
      }));

      setChoosecottonData(cottonData);
    }
  }, [ginnerId]);

  useEffect(() => {
    if (jsonStructure && formData.totalQty) {
      const baleWeight = jsonStructure?.map((bale: any) => {
        return bale.weight;
      });
      const sum = baleWeight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );

      const hasZeroInBaleWeight = jsonStructure?.some((bale: any) => {
        const weight = bale.weight;
        return weight == 0;
      });

      if (hasZeroInBaleWeight) {
        setErrors((prev: any) => ({
          ...prev,
          got: "",
          upload: "bale weight cannot be 0, please upload again.",
        }));
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          upload: "",
        }));

        setFormData((prev: any) => ({
          ...prev,
          got: null,
          noOfBales: null,
        }));
        return;
      }

      const notValid = isNaN(sum);
      if (notValid) {
        setErrors((prev: any) => ({
          ...prev,
          got: "",
          upload: "Some fields are missing; please upload complete Excel",
        }));

        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          upload: "",
        }));

        setFormData((prev: any) => ({
          ...prev,
          got: null,
          noOfBales: null,
        }));
        return;
      } else {
        gotPercentage();
        setFormData((prev: any) => ({
          ...prev,
          noOfBales: jsonStructure?.length,
        }));
      }
    }
  }, [jsonStructure, formData.totalQty]);

  useEffect(() => {
    if (formData.programId) {
      const foundProgram = program?.find(
        (program: any) => program.id == formData.programId
      );
      if (foundProgram && foundProgram.program_name === "REEL") {
        getReelLotNumber();
        setSelectedProgram("REEL");
      } else {
        setSelectedProgram("");
        setFormData((prev: any) => ({
          ...prev,
          reelLotNno: "",
        }));
      }
    }
  }, [program, formData.programId]);

  useEffect(() => {
    if (formData.totalQty) {
      setIsSelected(false);
    }
  }, [formData.totalQty]);

  const fetchProcessesLength = async () => {
    try {
      const res = await API.get(`ginner-process?ginnerId=${ginnerId}`);
      if (res.success) {
        setDataLength(res.data?.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinnerData = async () => {
    const url = `ginner/get-ginner?id=${ginnerId}`;
    try {
      const response = await API.get(url);
      setGinOutRange({
        from: response.data?.outturn_range_from,
        to: response.data?.outturn_range_to,
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getReelLotNumber = async () => {
    const foundProgram = program?.find(
      (program: any) => program.id == formData.programId
    );
    if (foundProgram && foundProgram.program_name === "REEL") {
      try {
        const res = await API.get(
          `ginner-process/reel?ginnerId=${ginnerId}&programId=${formData.programId}`
        );
        if (res.success) {
          setFormData((prev: any) => ({
            ...prev,
            reelLotNno: res.data?.id,
          }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getSeason = async () => {
    try {
      const res = await API.get(`season`);
      if (res.success) {
        setSeason(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProgram = async () => {
    try {
      const res = await API.get(
        `ginner-process/get-program?ginnerId=${ginnerId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFrom = (date: any) => {
    let d = new Date(date);
    d.setHours(d.getHours() + 5);
    d.setMinutes(d.getMinutes() + 30);
    const newDate: any = d.toISOString();
    setFrom(date);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      date: newDate,
    }));
  };
  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target.files[0];

    const expectedHeaders = [
      "Press No",
      "Weight"
    ];

    const allowedFormats = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/vnd.ms-excel",
    ];


    if (file) {
      if (!allowedFormats.includes(file?.type)) {
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: "",
        }));
        setErrors((prevError: any) => ({
          ...prevError,
          [event.target.name]: "Invalid file format.",
        }));

        event.target.value = "";
        return;
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any = XLSX.utils.sheet_to_json(sheet, {
        range: 1,
      });

      const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

      if (headers.length === 0 || !validateHeaders(headers, expectedHeaders)) {
        setJsonStructure(null);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          got: null,
          noOfBales: null,
        }));
        setErrors((prevError: any) => ({
          ...prevError,
          upload: "Invalid or empty file",
        }));
        event.target.value = "";
        return;
      } else {
        const convertedData = jsonData.map((item: any) => ({
          baleNo: item["Press No"],
          weight: Number(item["Weight"]),
        }));

        const bales: any = convertedData.map((data: any) => {
          return Number(data.baleNo);
        });

        const pressNo = Math.min(...bales) + "-" + Math.max(...bales);
        setFormData((prev: any) => ({
          ...prev,
          pressNo: pressNo,
        }));

        setJsonStructure(convertedData);
        setFileName((prevFile: any) => ({
          ...prevFile,
          [event.target.name]: event.target.files[0].name,
        }));

        setErrors((prev: any) => ({
          ...prev,
          upload: "",
        }));
      }
    }
  };
  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";
    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const dataVideo = new FormData();
    if (!e) {
      return setErrors((prevError: any) => ({
        ...prevError,
        [name]: "No File Selected",
      }));
    } else {
      if (!allowedFormats.includes(e?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "Invalid file format.Upload a valid Format",
        }));

        e = "";
        return;
      }

      const maxFileSize = 5 * 1024 * 1024;

      if (e.size > maxFileSize) {
        setErrors((prevError: any) => ({
          ...prevError,
          [name]: `File size exceeds the maximum limit (5MB).`,
        }));

        e = "";
        return;
      }
    }

    dataVideo.append("file", e);

    try {
      const response = await API.postFile(url, dataVideo);
      if (response.success) {
        setFileName((prevFile: any) => ({
          ...prevFile,
          [name]: e.name,
        }));

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [name]: response.data,
        }));

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }

  };

  const gotPercentage: any = () => {
    if (jsonStructure && formData.totalQty) {
      const baleWeight = jsonStructure?.map((bale: any) => {
        return bale.weight;
      });
      const sum = baleWeight?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );

      const finalVal = (sum / Number(formData?.totalQty)) * 100;

      if (
        finalVal < Number(ginOutRange.from) ||
        finalVal > Number(ginOutRange.to)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          got: `GOT out of range. GOT should be between ${ginOutRange.from} and ${ginOutRange.to}`,
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          got: "",
        }));
        setFormData((prev: any) => ({
          ...prev,
          got: finalVal.toFixed(2),
        }));
      }
      toasterInfo(`Gin Out Turn is ${finalVal.toFixed(2)}%`, 3000, 1);
    }
  };

  const chooseCotton = () => {
    if (formData.programId) {
      sessionStorage.setItem("ginnerProcess", JSON.stringify(formData));
      router.push(
        `/ginner/ginner-process/choose-cotton?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose cotton",
      }));
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (
      name === "heapRegister" ||
      name === "weighBridge" ||
      name === "deliveryChallan" ||
      name === "baleProcess"
    ) {
      dataUpload(value, name);
      return;
    }
    else if (name === "programId" || name === "seasonId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: Number(value),
      }));
    }
    else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prevErrors: any) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const onBlur = (e: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;

    const valid = regexAlphaNumeric.test(value);
    if (!valid) {
      setErrors((prev: any) => ({
        ...prev,
        [name]:
          "Accepts only AlphaNumeric values and special characters like _,-,()",
      }));
    } else {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const onCancel = () => {
    router.push("/ginner/ginner-process");
    sessionStorage.removeItem("ginnerProcess");
    sessionStorage.removeItem("ginnerCotton");
  };

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const valid = regexAlphaNumeric.test(formData.lotNo);

    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "date":
            return value.length === 0 ? "Date is required" : "";
          case "seasonId":
            return value?.length === 0 || value === null || value === undefined
              ? "Season is required"
              : "";
          case "got":
            return errors.got != "" ? errors.got : "";
          case "lotNo":
            return value === "" || value === null || value === undefined
              ? "Lot No is required"
              : !valid
                ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                : "";
          case "upload":
            return errors.upload !== "" ? errors.upload : "";
          case "heapNumber":
            return value === "" || value === null || value === undefined
              ? "Heap Number is required"
              : !valid
                ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                : "";
          case "heapRegister":
            return value === null ? "Heap Register is required" : errors.heapRegister != "" ? errors.heapRegister != "" : '';
          case "weighBridge":
            return value === null ? "Weigh Bridge is required" : errors.weighBridge != "" ? errors.weighBridge != "" : '';
          case "deliveryChallan":
            return value === null ? "Delivery Challan is required" : errors.deliveryChallan != "" ? errors.deliveryChallan != "" : ''
          case "baleProcess":
            return value === null ? "Bale Process is required" : errors.baleProcess != "" ? errors.baleProcess != "" : ''
          default:
            return "";
        }
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newErrors: any = {};
    Object.keys(formData).forEach((fieldName: string) => {
      newErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "errors"
      );
    });

    const hasErrors = Object.values(newErrors).some((error) => !!error);
    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!jsonStructure) {
      setErrors((prev: any) => ({
        ...prev,
        upload: "Csv/Excel is required",
      }));
    }

    if (!hasErrors && jsonStructure) {
      setIsSelected(true);
      setIsLoading(true)
      try {
        const response = await API.post("ginner-process", {
          ...formData,
          ...formData,
          got: formData.got !== null && formData.got !== "" ? parseFloat(formData.got) : null,
          ginnerId: ginnerId,
          bales: jsonStructure,
          chooseCotton: chooseCottonData
        });
        if (response.success) {
          toasterSuccess("Process Successfully Created");
          router.push("/ginner/ginner-process");
          sessionStorage.removeItem("ginnerProcess");
          sessionStorage.removeItem("ginnerCotton");
        } else {
          setIsSelected(false);
          setIsLoading(false)
          toasterError(response.error.code, 3000, formData?.ginnerId);
        }
      } catch (error) {
        setIsSelected(false);
        setIsLoading(false)
      }
    } else {
      return;
    }
  };

  if (loading || roleLoading || isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  if (!roleLoading && Access?.create) {

    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <NavLink href="/ginner/dashboard" className="active">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/ginner/ginner-process">Process</NavLink>
                </li>
                <li>New Process</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-md p-4">
            <div className="w-100 mt-4">
              <div className="customFormSet">
                <div className="row">
                  <div className="col-lg-8 col-md-10 col-sm-12">
                    <div className="row">
                      <p className="col-lg-5 col-md-8 col-sm-12 mb-2 text-sm">
                        Download valid excel format to use in upload:
                      </p>

                      <div className="col-lg-6 col-md-8 col-sm-12 mb-2">
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <button
                              name="ginner"
                              onClick={() =>
                                handleDownload(
                                  "/files/ginner_csv_format.xlsx",
                                  "ginner",
                                  "xlsx"
                                )
                              }
                              className="btn-purple flex p-2"
                            >
                              <FaDownload className="mr-2" />
                              Download
                            </button>
                          </div>
                          {dataLength > 0 && (
                            <div className="col-lg-6 col-md-6 col-sm-12 ">
                              <button
                                name="ginner"
                                type="button"
                                onClick={() =>
                                  router.push(
                                    "/ginner/quality-parameter/upload-test-ginner"
                                  )
                                }
                                className="bg-orange-400 flex rounded-lg text-white font-semibold p-2"
                              >
                                Upload Test Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-100">
                  <div className="row">
                    <div className="borderFix pt-2 pb-2">
                      <div className="row">
                        <div className="col-12 col-sm-6  my-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <DatePicker
                            selected={from}
                            maxDate={new Date()}
                            dateFormat={"dd-MM-yyyy"}
                            onChange={handleFrom}
                            showYearDropdown
                            placeholderText={translations.common.from + "*"}
                            className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>
                        <div className="col-12 col-sm-6 my-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Season <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="seasonId"
                            value={formData.seasonId ? { label: season?.find((seasonId: any) => seasonId.id === formData.seasonId)?.name, value: formData.seasonId } : null}
                            menuShouldScrollIntoView={false}
                            isClearable
                            placeholder="Select Season"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={(season || []).map(({ id, name }: any) => ({
                              label: name,
                              value: id,
                              key: id
                            }))}
                            onChange={(item: any) => {
                              handleChange("seasonId", item?.value);
                            }}
                          />
                          {errors?.seasonId !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.seasonId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {!chooseCottonData && (
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program <span className="text-red-500">*</span>
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          {program?.map((program: any) => (
                            <label
                              className="mt-1 d-flex mr-4 align-items-center"
                              key={program.id}
                            >
                              <section>
                                <input
                                  type="radio"
                                  name="programId"
                                  checked={formData.programId === program.id}
                                  value={program.id || ""}
                                  onChange={() => handleChange("programId", program.id)}

                                />
                                <span></span>
                              </section>{" "}
                              {program.program_name}
                            </label>
                          ))}
                        </div>
                        {errors?.programId !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.programId}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Choose Cotton <span className="text-red-500">*</span>
                      </label>
                      <button
                        name="chooseLint"
                        type="button"
                        onClick={chooseCotton}
                        className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                      >
                        Choose Cotton
                      </button>
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Total Quantity(Kg/MT)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="totalQty"
                        value={formData.totalQty || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        No of Bales Produced
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="noOfBales"
                        value={formData.noOfBales || ""}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Gin Out Turn (GOT)
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        disabled
                        name="got"
                        value={formData.got || ""}
                        onChange={handleChange}
                      />
                      {errors?.got !== "" && (
                        <div className="text-sm text-red-500">{errors.got}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Lot No <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Lot No"
                        onBlur={onBlur}
                        name="lotNo"
                        value={formData.lotNo || ""}
                        onChange={(e) => handleChange("lotNo", e.target.value)}
                      />
                      {errors?.lotNo !== "" && (
                        <div className="text-sm text-red-500">{errors.lotNo}</div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Heap Number <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        placeholder="Heap Number"
                        onBlur={onBlur}
                        name="heapNumber"
                        value={formData.heapNumber || ""}
                        onChange={(e) => handleChange("heapNumber", e.target.value)}
                      />
                      {errors?.heapNumber !== "" && (
                        <div className="text-sm text-red-500">{errors.heapNumber}</div>
                      )}
                    </div>

                    {selectedProgram == "REEL" && (
                      <div className="col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          REEL Lot No
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          disabled
                          name="reelLotNno"
                          value={formData.reelLotNno}
                          onChange={handleChange}
                        />
                      </div>
                    )}

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload CSV/Excel <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile mt-1">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            ref={fileInputRef}
                            name="upload"
                            onChange={excelToJson}
                            onClick={(e: any) => {
                              e.target.value = null;
                            }}
                          />
                        </label>
                      </div>
                      {fileName.upload && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.upload}</p>
                        </div>
                      )}
                      {errors?.upload !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.upload}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Heap Register <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            type="file"
                            name="heapRegister"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) => handleChange("heapRegister", e?.target?.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.heapRegister && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.heapRegister}</p>
                        </div>
                      )}
                      {errors?.heapRegister !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.heapRegister}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Weigh Bridge Receipt <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="weighBridge"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) => handleChange("weighBridge", e?.target?.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.weighBridge && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.weighBridge}</p>
                        </div>
                      )}
                      {errors?.weighBridge !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.weighBridge}
                        </div>
                      )}
                    </div>
                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Delivery Challan <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="deliveryChallan"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) => handleChange("deliveryChallan", e?.target?.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.deliveryChallan && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.deliveryChallan}</p>
                        </div>
                      )}
                      {errors?.deliveryChallan !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.deliveryChallan}
                        </div>
                      )}
                    </div>

                    <div className="col-12 col-sm-6 mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Upload Bale Process <span className="text-red-500">*</span>
                      </label>
                      <div className="inputFile">
                        <label>
                          Choose File <GrAttachment />
                          <input
                            name="baleProcess"
                            type="file"
                            accept="image/jpg, image/jpeg , image/png"
                            onChange={(e) => handleChange("baleProcess", e?.target?.files?.[0])}
                          />
                        </label>
                      </div>
                      <p className="py-2 text-sm">
                        (Max: 5MB) (Format: jpg/jpeg/png)
                      </p>
                      {fileName.baleProcess && (
                        <div className="flex text-sm mt-1">
                          <GrAttachment />
                          <p className="mx-1">{fileName.baleProcess}</p>
                        </div>
                      )}
                      {errors?.baleProcess !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.baleProcess}
                        </div>
                      )}
                    </div>


                  </div>
                </div>
                <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      disabled={isSelected}
                      style={
                        isSelected
                          ? { cursor: "not-allowed", opacity: 0.8 }
                          : { cursor: "pointer", backgroundColor: "#D15E9C" }
                      }
                      onClick={(e) => handleSubmit(e)}
                    >
                      SUBMIT
                    </button>
                    <button
                      className="btn-outline-purple"
                      onClick={() => onCancel()}
                    >
                      CANCEL
                    </button>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
