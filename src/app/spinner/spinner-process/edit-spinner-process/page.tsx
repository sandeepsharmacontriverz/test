"use client";
import useTranslations from "@hooks/useTranslation";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import { DecimalFormat } from "@components/core/DecimalFormat";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("Edit Process");
  const [roleLoading, hasAccesss] = useRole();
  const spinnerId = User.spinnerId;

  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [from, setFrom] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherData, setOtherData] = useState("");
  const [yarnCount, setYarnCount] = useState<any>();
  const [cottonMix, setCottonMix] = useState<any>([]);
  const [cottonmixType, setCottonMixtype] = useState<any>();
  const [cottonMixQty, setCottonMixQty] = useState<any>([]);

  const [yarnCountMulti, setYarnCountMulti] = useState<any>();
  const [yarnQtyMulti, setYarnQtyMulti] = useState<any>([]);
  const [other, setOther] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [data, setData] = useState<any>([])

  const [yarnData, setYarnData] = useState<any>([])
  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    seasonId: "",
    otherMix: null,
    totalQty: null,
    yarnType: "",
    yarnCount: [],
    yarnQtyProduced: [],
    yarnRealisation: 0,
    netYarnQty: null,
    comber_noil: 0,
    noOfBox: null,
    batchLotNo: "",
    boxId: "",
    cottonmixType: [],
    cottonmixQty: [],
    processComplete: null,
    dyeingRequired: null,
    processName: "",
    processorName: "",
    dyeingAddress: "",
    yarnDelivered: null,
    processLoss: null,
    processNetYarnQty: 0,
  });
  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Spinner")) {
      const access = checkAccess("Spinner Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    if (spinnerId) {
      fetchProcesses()
    }
  }, [spinnerId])

  const fetchProcesses = async () => {
    try {
      const res = await API.get(
        `spinner-process?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setData(res.data[0]);
        setOther(res.data[0]?.yarn_type === "Combed"
          || res.data[0]?.yarn_type === "Carded"
          || res.data[0]?.yarn_type === "Semi Combed" ?
          false : true
        )
      }

    } catch (error) {
      console.log(error);
    }
  };

  const requiredFields = [
    "seasonId",
    "date",
    "programId",
    "otherMix",
    "yarnType",
    "otherData",
    "cottonmixType",
    "yarnRealisation",
    "yarnCount",
    "yarnQtyProduced",
    "batchLotNo",
    "processComplete",
    "dyeingRequired",
    "processorName",
    "processName",
    "processLoss",
    "dyeingAddress",
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    if (dataName === "errors") {
      if (requiredFields.includes(name)) {
        switch (name) {
          case "date":
            return value.length === 0 ? "Date is required" : "";

          case "batchLotNo":
            return value.trim() === ""
              ? "Batch Lot No is required"
              : errors.batchLotNo !== ""
                ? errors.batchLotNo
                : "";

          case "yarnQtyProduced":
            return value === null || formData.yarnQtyProduced?.length === 0
              ? "Yarn quanity Produced is required" :
              "";
          case "otherMix":
            return value === null ? "Please select any one option" : "";
          // case "noOfBox":
          //   return value === null
          //     ? "No of boxes/Cartons is required" : errors.noOfBox != "" ? errors.noOfBox : "";
          // case "cottonmixType":
          //   return formData.otherMix === true && totalBlend == 0
          //     ? "Please Fill the required fields"
          //     : errors.cottonmixType != ""
          //       ? errors.cottonmixType
          //       : "";
          // case "boxId":
          //   return errors.boxId != "" ? errors.boxId : "";
          case "yarnRealisation":
            return errors.yarnRealisation != "" ? errors.yarnRealisation : "";
          case "yarnType":
            return !other && value.trim() === "" ? "Please select any one option" : "";
          case "otherData":
            return other && value.trim() === ""
              ? "Others is Required" : errors.otherData !== ""
                ? errors.otherData : "";
          case "yarnCount":
            return value === null || formData.yarnCount?.length === 0
              ? "Yarn Quantity Produced(Kgs) is required"
              : "";
          case "processComplete":
            return value === null ? "Please select any one option" : "";
          case "dyeingRequired":
            return value === null ? "Please select any one option" : "";
          case "processorName":
            return formData.dyeingRequired === true && value.trim() === ""
              ? "Processor name is Required"
              : errors.processorName !== ""
                ? errors.processorName
                : "";
          case "processName":
            return formData.dyeingRequired === true && value.trim() === ""
              ? "Process name is Required"
              : errors.processName !== ""
                ? errors.processName
                : "";
          case "dyeingAddress":
            return formData.dyeingRequired === true && value.trim() === ""
              ? "Address is Required"
              : errors.dyeingAddress !== ""
                ? errors.dyeingAddress
                : "";
          case "processLoss":
            return formData.dyeingRequired === true && value === null
              ? "Process Loss is Required"
              : errors.processLoss !== ""
                ? errors.processLoss
                : "";
          default:
            return "";
        }
      }
    }
  };

  const onCancel = () => {
    router.push("/spinner/spinner-process");
    sessionStorage.removeItem("spinnerLint");
    sessionStorage.removeItem("comberNoil");
    sessionStorage.removeItem("spinnerChooseLint");
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

    newErrors["otherData"] = validateField("otherData", otherData, "errors");

    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setErrors(newErrors);
    }

    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("spinner-process", {
          ...formData,
          yarnType: other == true && otherData ? otherData : formData.yarnType,
          // chooseLint: chooseLint.chooseLint,
          // chooseComberNoil: chooseComberNoil.chooseComberNoil,
          spinnerId: spinnerId,
          yarns: yarnData
        });
        if (response.success) {
          toasterSuccess("Process Successfully Created");
          router.push("/spinner/spinner-process");
          sessionStorage.removeItem("spinnerLint");
          sessionStorage.removeItem("comberNoil");
          sessionStorage.removeItem("spinnerChooseLint");
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.log(error);
        setIsSubmitting(false);
      }
    } else {
      return;
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

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only Alphabets and special characters like comma(,),_,-,(),.",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value != "" && type == "numbers") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value != "" && type == "percentage") {
      if (Number(value) < 0 || Number(value) > 100) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Percentage value should be in between 0 and 100",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value != "" && type == "numeric") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: DecimalFormat(+value),
        }));
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (value != "" && type == "alphaNumeric") {
      const valid = regexAlphaNumeric.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like comma(,),.,_,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (type === "bill") {
      if (value != "") {
        const valid = regexBillNumbers.test(value);
        if (!valid) {
          setErrors((prev: any) => ({
            ...prev,
            [name]:
              "Accepts only AlphaNumeric values  and special characters like comma(,),_,-,(),/",
          }));
        } else {
          setErrors({ ...errors, [name]: "" });
        }
      }
      return;
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name == "processComplete") {
      if (value == "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
        }));
      }
    } else if (name == "otherMix") {
      if (value == "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
          cottonmixQty: [],
          cottonmixType: [],
        }));
      }
    } else if (name == "dyeingRequired") {
      if (value == "yes") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: true,
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: false,
          processName: "",
          processLoss: null,
          processNetYarnQty: null,
          processorName: "",
          dyeingAddress: "",
          yarnDelivered: null,
        }));
      }
    } else if (name == "yarnQtyProduced") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (name == "yarnType") {
      if (value == "Carded" || value == "Combed" || value == "Semi Combed") {
        setOther(false);
        setOtherData("");
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      } else {
        setOther(true);
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: "",
        }));
      }
    } else if (name == "otherData") {
      setOtherData(value);
    } else if (name == "noOfBox") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: parseInt(value),
      }));
    } else if (name == "programId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
      setErrors((prev: any) => ({
        ...prev,
        programId: "",
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (spinnerId) {
      getYarnCount();
      getCottonMix()
    }
  }, [spinnerId]);

  const getYarnCount = async () => {
    try {
      const res = await API.get(
        `spinner-process/get-yarn?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setYarnCount(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCottonMix = async () => {
    try {
      const res = await API.get(`cottonmix`);
      if (res.success) {
        setCottonMix(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addBlend = () => {
    if (cottonMixQty > 0 && cottonmixType?.value && cottonmixType?.value > 0) {
      if (formData?.cottonmixType?.includes(cottonmixType?.value)) {
        setErrors((prevData: any) => ({
          ...prevData,
          cottonmixType: "Already Exist",
        }));
      } else {
        setErrors((prevData: any) => ({
          ...prevData,
          cottonmixType: "",
        }));
        sessionStorage.setItem("spinnerLint", JSON.stringify(formData));
        setFormData((prevData: any) => ({
          ...prevData,
          cottonmixType: [...prevData.cottonmixType, Number(cottonmixType?.value)],
          cottonmixQty: [...prevData.cottonmixQty, Number(cottonMixQty)],
        }));
        setCottonMixtype(null);
        setCottonMixQty("");
      }
    } else {
      setErrors((prevData: any) => ({
        ...prevData,
        cottonmixType: "Select cotton Mix Quantity and Type",
      }));
    }
  };

  const removeBlend = (index: any) => {
    let blendType = formData.cottonmixType;
    let blendQty = formData.cottonmixQty;

    let arr1 = blendType.filter((element: any, i: number) => index !== i);
    let arr2 = blendQty.filter((element: any, i: number) => index !== i);
    sessionStorage.setItem("spinnerLint", JSON.stringify(formData));

    setFormData((prevData: any) => ({
      ...prevData,
      cottonmixType: arr1,
      cottonmixQty: arr2,
    }));
  };
  const Total = data?.cottonmix_qty?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0) || 0;

  if (loading || roleLoading || isSubmitting) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (!roleLoading && !Access?.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <NavLink href="/spinner/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/spinner/spinner-process">Process</NavLink>
              </li>
              <li>Edit Process</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100">
            <div className="row">
              <div className="borderFix pt-2 pb-2">
                <div className="row">
                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={from}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleFrom}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText={translations.common?.from + "*"}
                      className="w-100 shadow-none h-11 rounded-md my-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Season
                    </label>
                    <Select
                      name="seasonId"
                      value={{ label: data.season?.name, value: data.season?.name }}
                      menuShouldScrollIntoView={false}
                      isClearable
                      isDisabled
                      placeholder="Select Season"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    />

                  </div>
                </div>
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Program
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label
                    className="mt-1 d-flex mr-4 align-items-center"
                  >
                    <section>
                      <input
                        disabled
                        type="radio"
                        checked={data?.program?.program_name || ""}
                      />
                      <span></span>
                    </section>{" "}
                  </label>
                  {data?.program?.program_name}
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-4 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Do you want to blend? <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        disabled
                        checked={data.other_mix === true}
                        value={"yes"}
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        value="no"
                        disabled
                        checked={data.other_mix === false}
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>

              </div>

              {data?.other_mix == true && (
                <div className="col-12 col-sm-12 mt-4 py-2 border">
                  <h5 className="font-semibold">Blending</h5>
                  <div className="flex justify-between py-2">
                    <div className="w-1/4">
                      <label>Blend</label>
                    </div>
                    <div className="w-3/4">
                      <div className="flex gap-3">
                        <div className="w-1/3">
                          <Select
                            value={cottonmixType}
                            name="cottonmixType"
                            menuShouldScrollIntoView={false}
                            isClearable
                            isDisabled
                            placeholder="Select Cotton"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={
                              (cottonMix || []).map(({ id, cottonMix_name }: any) => ({
                                label: cottonMix_name,
                                value: id,
                              })) as unknown as readonly (
                                | string
                                | GroupBase<string>
                              )[]
                            }
                            onChange={(item: any) =>
                              setCottonMixtype(item)
                            }
                          />
                        </div>
                        <div className="w-1/3">
                          <input
                            type="number"
                            name="cottonMixQty"
                            disabled
                            placeholder="Quantity"
                            value={cottonMixQty || ""}
                            onChange={(e: any) => setCottonMixQty(e.target.value)}
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errors?.cottonmixType !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.cottonmixType}
                            </div>
                          )}
                        </div>
                        <div className="w-1/3">
                          <button
                            name="ginner"
                            type="button"
                            onClick={addBlend}
                            disabled
                            className="bg-orange-400 text-sm rounded text-white px-2 py-1.5"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {data?.cottonmix_type?.length > 0 &&
                        data?.cottonmix_type.map(
                          (item: any, index: number) => {
                            return (
                              <div
                                className="w-3/4 flex gap-3 mt-2 px-2 py-1 bg-gray-300"
                                key={index}
                              >
                                <div className="w-1/3">
                                  {cottonMix?.map((mix: any) => {
                                    if (mix.id === item) {
                                      return mix.cottonMix_name;
                                    }
                                  })}
                                </div>

                                <div className="w-1/3 text-sm">
                                  {data?.cottonmix_qty[index]}
                                </div>
                                <div className="w-1/3">
                                  <button
                                    name="ginner"
                                    type="button"
                                    onClick={() => removeBlend(index)}
                                    className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        )}

                      <div className="flex gap-3 mt-2 px-2 py-1">
                        <div className="flex w-1/2">
                          <div className="w-1/2 text-sm">Total:</div>
                          <div className="w-1/2 text-sm">{Total}</div>
                        </div>
                        <div className="flex w-1/2">
                          <div className="w-1/2 text-sm">Realisataion:</div>
                          <div className="w-1/2 text-sm">{data?.yarn_realisation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Total Lint/Blend (Kgs)
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="totalQty"
                  placeholder="Quantity"
                  value={data.total_qty || ""}
                  disabled
                />
              </div>

              <div className="col-12 col-sm-6 col-md-4 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Type of Yarn? <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="yarnType"
                        disabled
                        checked={data.yarn_type == "Carded"}
                      />
                      <span></span>
                    </section>{" "}
                    Carded
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="yarnType"
                        disabled
                        checked={data.yarn_type == "Combed"}
                      />
                      <span></span>
                    </section>{" "}
                    Combed
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="yarnType"
                        disabled
                        checked={data.yarn_type == "Semi Combed"}
                      />
                      <span></span>
                    </section>{" "}
                    Semi Combed
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name="yarnType"
                        disabled
                        checked={other == true}
                      />
                      <span></span>
                    </section>{" "}
                    Other
                  </label>
                  {other == true && (
                    <input
                      type="text"
                      placeholder="Type of Yarn"
                      value={data?.yarn_type}
                      disabled
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  )}
                  {errors?.otherData !== "" && (
                    <div className="text-sm text-red-500">{errors?.otherData}</div>
                  )}
                  {errors?.yarnType !== "" && (
                    <div className="text-sm text-red-500">{errors?.yarnType}</div>
                  )}
                </div>
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Yarn Count (Ne) <span className="text-red-500">*</span>
                </label>

                <Select
                  name="yarnCount"
                  value={yarnCountMulti}
                  menuShouldScrollIntoView={false}
                  isClearable
                  placeholder="Select Yarn Count"
                  className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                  isDisabled
                />
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <div className="row">
                  <div className="col-12 col-sm-8">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Yarn Quantity Produced(Kgs){" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="yarnQtyProduced"
                      disabled
                      placeholder="Quantity"
                    />

                  </div>
                  <div className="col-12 col-sm-4 flex items-center">
                    <button
                      name="multiYarn"
                      type="button"
                      disabled
                      className="bg-orange-400 text-sm rounded text-white px-2 py-1.5"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 py-2 border">
                {data?.yarn_count?.length > 0 &&
                  data?.yarn_count?.map((item: any, index: number) => {
                    return (
                      <div key={index} className="row">
                        <div className="col-12 col-sm-6 mt-4">
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            type="text"
                            name="totalQty"
                            placeholder="Quantity"
                            value={yarnCount?.map((yarn: any) => {
                              if (yarn.id === item) {
                                return yarn.yarnCount_name;
                              }
                              return null;
                            })}
                            disabled
                          />
                        </div>
                        <div className="col-12 col-sm-3 mt-4">
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            type="text"
                            name="totalQty"
                            placeholder="Quantity"
                            value={data?.yarn_qty_produced[index]}
                            disabled
                          />
                        </div>
                      </div>
                    );
                  })}

              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Yarn Realisation (%) <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  placeholder="Yarn Realisation"
                  value={data.yarn_realisation || ""}
                  disabled
                />
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Net Yarn Quantity (Kgs)
                </label>
                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="netYarnQty"
                  placeholder="Net Yarn Qty"
                  disabled
                  value={data.net_yarn_qty || ""}
                />
              </div>

              <div className="col-12 col-sm-6  mt-4 ">
                <label className="text-gray-500 text-[12px] font-medium">
                  Comber Noil (Kgs)
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="comber_noil"
                  placeholder="Comber Noil"
                  disabled
                  value={data.comber_noil + " Kgs" || "0.00 Kgs"}
                />
              </div>
              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Batch/Lot No <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  onBlur={(e) => onBlur(e, "bill")}
                  name="batchLotNo"
                  placeholder="Batch Lot No"
                  value={formData.batchLotNo || ""}
                  onChange={(e) => handleChange("batchLotNo", e.target.value)}
                />
                {errors?.batchLotNo !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.batchLotNo}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Do you want to Complete the Process{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`processComplete`}
                        disabled
                        value="yes"
                        checked={data.process_complete === true}
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        value="no"
                        checked={data.process_complete === false}
                        disabled

                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>

              </div>
              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Dyeing/Other Process Required?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        value="yes"
                        checked={data.dyeing_required === true}
                        disabled
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        value="no"
                        checked={data.dyeing_required === false}
                        disabled

                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>

              </div>
            </div>
            {data.dyeing_required == true && (
              <>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">Dyeing/Other Process:</h4>
                  <div className="row">
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name of The Processor{" "}
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="processorName"
                        placeholder="Processor Name"
                        value={data.dyeing?.processor_name || ""}
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Address
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="dyeingAddress"
                        placeholder="Address"
                        value={data.dyeing?.dyeing_address || ""}
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name Process
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="processName"
                        placeholder="Process Name"
                        value={data.dyeing?.process_name || ""}
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Qty of Yarn Delivered
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="yarnDelivered"
                        value={data.net_yarn_qty + " Kgs" || "0.00 Kgs" || ''}
                        type="text"
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Process Loss (%) If Any?{" "}
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        name="processLoss"
                        placeholder="Process Loss (%) If Any?"
                        value={data.dyeing?.process_loss || ""}
                        disabled
                      />
                    </div>

                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Net Yarn Qty
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        name="processNetYarnQty"
                        disabled
                        value={data.dyeing?.net_yarn + " Kgs" || "0.00 Kgs" || ""}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
            <section>
              <button
                className="btn-purple mr-2"
                style={
                  isSubmitting
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                SUBMIT
              </button>
              <button className="btn-outline-purple" onClick={() => onCancel()}>
                CANCEL
              </button>
            </section>
          </div>
        </div>
      </div >
    );
  }
}
