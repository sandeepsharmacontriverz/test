"use client";
import React, { useState, useEffect } from "react";
import NavLink from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("New Sale");
  const [roleLoading, hasAccesss] = useRole();
  const spinnerId = User.spinnerId;
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const [from, setFrom] = useState<Date | null>(new Date());

  const [program, setProgram] = useState([]);
  const [season, setSeason] = useState<any>();
  const [buyerOptions, setBuyerOptions] = useState<any>();
  const [fileName, setFileName] = useState({
    contractFile: "",
    deliveryNotes: "",
    invoiceFile: [],
    qualityDoc: "",
    tcFiles: "",
  });
  const [formData, setFormData] = useState<any>({
    spinnerId: spinnerId,
    date: new Date(),
    programId: null,
    seasonId: null,
    orderRef: "",
    buyerType: "",
    buyerId: null,
    knitterId: null,
    totalQty: null,
    transactionViaTrader: null,
    noOfBoxes: null,
    batchLotNo: "",
    boxIds: "",
    reelLotNno: "",
    yarnType: "",
    yarnCount: null,
    invoiceNo: "",
    billOfLadding: "",
    transporterName: "",
    vehicleNo: "",
    buyerOption: "",
    processorName: "",
    processorAddress: "",
    transactionAgent: "",
    invoiceFile: [],
    price: null
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yarnCountName, setYarnCountName] = useState<any>([])


  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Spinner")) {
      const access = checkAccess("Spinner Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    getSeason();
  }, []);

  useEffect(() => {
    if (spinnerId) {
      getPrograms();
      getBuyerOptions();
      setFormData((prevData: any) => ({
        ...prevData,
        spinnerId,
      }));
    }
  }, [spinnerId]);

  useEffect(() => {
    const savedData: any = sessionStorage.getItem("spinnerSales");
    const yarnChoosen: any = sessionStorage.getItem("spinnerChooseYarn");
    const processData = JSON.parse(savedData);
    const yarnData = JSON.parse(yarnChoosen);
    if (processData || yarnData) {

      const reelLotNos = yarnData?.chooseYarn
        .map((item: any) => item.reelLotNo)
        .filter((value: any) => value !== null && value !== undefined);


      const reel = reelLotNos?.length > 0 ? reelLotNos?.join(", ") : "";

      setFormData({
        ...processData,
        reelLotNno: reel,
        totalQty: yarnData?.totalQuantityUsed,
        chooseYarn: yarnData?.chooseYarn,
        yarnType: yarnData?.chooseYarn[0]?.yarnType,
        yarnCount: yarnData?.chooseYarn[0]?.yarnCount,
      });

      const yarnCountNames = yarnData?.chooseYarn?.map((item: any) => item?.yarnCountName)
      const uniqueYarnCountNames = [...new Set(yarnCountNames)];
      setYarnCountName(uniqueYarnCountNames);
    }
  }, []);


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

  const getPrograms = async () => {
    try {
      const res = await API.get(
        `spinner-process/get-program?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBuyerOptions = async () => {
    try {
      const res = await API.get(
        `spinner-process/get-knitter-weaver?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setBuyerOptions(res.data);
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

  const getChooseYarn = () => {
    if (formData.programId) {
      sessionStorage.setItem("spinnerSales", JSON.stringify(formData));
      router.push(`/spinner/sales/choose-yarn?id=${formData.programId}`);
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose yarn",
      }));
    }
  };

  const dataUpload = async (e: any, name: any) => {
    const url = "file/upload";

    const allowedFormats = [
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const dataVideo = new FormData();
    if (name === "invoiceFile") {
      let filesLink: any = [...formData.invoiceFile];
      let filesName: any = [...fileName.invoiceFile];

      for (let i = 0; i < e?.length; i++) {
        if (!e[i]) {
          return setErrors((prevError: any) => ({
            ...prevError,
            [name]: "No File Selected",
          }));
        } else {
          if (!allowedFormats.includes(e[i]?.type)) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: "Invalid file format.Upload a valid Format",
            }));

            e = "";
            return;
          }

          const maxFileSize = 5 * 1024 * 1024;

          if (e[i].size > maxFileSize) {
            setErrors((prevError: any) => ({
              ...prevError,
              [name]: `File size exceeds the maximum limit (5MB).`,
            }));

            e = "";
            return;
          }
        }
        dataVideo.set("file", e[i]);
        try {
          const response = await API.postFile(url, dataVideo);
          if (response.success) {
            filesLink.push(response.data);
            filesName.push(e[i].name);

            setErrors((prev: any) => ({
              ...prev,
              [name]: "",
            }));
          }
        } catch (error) {
          console.log(error, "error");
        }
      }
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: filesLink,
      }));
      setFileName((prevFile: any) => ({
        ...prevFile,
        [name]: filesName,
      }));
    } else {
      if (!e) {
        return setErrors((prevError: any) => ({
          ...prevError,
          [e]: "No File Selected",
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

        setErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
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

          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };

  const removeImage = (index: any) => {
    let filename = fileName.invoiceFile;
    let fileNavLink = formData.invoiceFile;
    let arr1 = filename.filter((element: any, i: number) => index !== i);
    let arr2 = fileNavLink.filter((element: any, i: number) => index !== i);
    setFileName((prevData: any) => ({
      ...prevData,
      invoiceFile: arr1,
    }));
    setFormData((prevData: any) => ({
      ...prevData,
      invoiceFile: arr2,
    }));
  };

  // const handleChange = (event: any, val?: any) => {
  //   const { name, value } = event.target;
  //   if (
  //     name === "contractFile" ||
  //     name === "deliveryNotes" ||
  //     name === "invoiceFile" ||
  //     name === "qualityDoc" ||
  //     name === "tcFiles"
  //   ) {
  //     dataUpload(event, name);
  //     return;
  //   }
  //   else if (name === "transactionViaTrader") {
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: val,
  //       transactionAgent: val === "Yes" ? prevData.transactionAgent : "",
  //     }));
  //     setErrors((prev: any) => ({
  //       ...prev,
  //       transactionAgent: "",
  //     }));
  //   }
  //   else if (name === "buyerType") {
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       buyerId: null,
  //       knitterId: null,
  //       processorName: "",
  //       processorAddress: "",
  //       buyerOption: ""
  //     }));
  //     setErrors((prev: any) => ({
  //       ...prev,
  //       buyerId: "",
  //       knitterId: "",
  //       processorName: "",
  //       processorAddress: "",
  //     }));
  //     if (name === "buyerType" && value === "Mapped") {
  //       setFormData((prevData: any) => ({
  //         ...prevData,
  //         [name]: value,
  //         buyerId: null,
  //         knitterId: null,
  //         processorName: "",
  //         processorAddress: "",
  //       }));
  //     } else {
  //       setFormData((prevData: any) => ({
  //         ...prevData,
  //         [name]: value,
  //         buyerId: null,
  //         knitterId: null,
  //       }));
  //     }
  //   }
  //   else if (name === "buyerOption") {
  //     if (value !== "") {
  //       let newVal = value.split("-");
  //       let matchedBuyer: any;
  //       if (newVal.length > 1) {
  //         matchedBuyer = buyerOptions?.filter((item: any) => {
  //           return item.name === newVal[0] && item.type === newVal[1];
  //         });
  //         if (matchedBuyer.length > 0) {
  //           setFormData((prevData: any) => ({
  //             ...prevData,
  //             buyerId:
  //               newVal[1] === "weaver" ? Number(matchedBuyer[0]?.id) : null,
  //             knitterId:
  //               newVal[1] === "kniter" ? Number(matchedBuyer[0]?.id) : null,
  //           }));
  //         }
  //       }
  //     } else {
  //       setFormData((prevData: any) => ({
  //         ...prevData,
  //         buyerId: null,
  //         knitterId: null,
  //       }));
  //     }
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  //   else {
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  //   setErrors((prev: any) => ({
  //     ...prev,
  //     [name]: "",
  //   }));
  // };
  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "transactionViaTrader") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value === "Yes" ? true : false,
        transactionAgent: value === "Yes" ? prevData.transactionAgent : "",
      }));
    }
    else if (name === "buyerType") {
      setFormData((prevData: any) => ({
        ...prevData,
        buyerId: null,
        knitterId: null,
        processorName: "",
        processorAddress: "",
        buyerOption: ""
      }));
      setErrors((prev: any) => ({
        ...prev,
        buyerId: "",
        knitterId: "",
        processorName: "",
        processorAddress: "",
        buyerOption: ""
      }));
      if (name === "buyerType" && value === "Mapped") {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,
          knitterId: null,
          processorName: "",
          processorAddress: "",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
          buyerId: null,

          knitterId: null,
        }));
      }
    }
    else if (name === "buyerOption") {
      if (typeof value?.key === "string" && value.key !== "") {
        let newVal = value.key.split("-");
        let matchedBuyer: any;
        if (newVal.length > 1) {
          matchedBuyer = buyerOptions?.filter((item: any) => {
            return item.name === newVal[0] && item.type === newVal[1];
          });
          if (matchedBuyer.length > 0) {
            setFormData((prevData: any) => ({
              ...prevData,
              buyerId:
                newVal[1] === "weaver" ? Number(matchedBuyer[0]?.id) : null,
              knitterId:
                newVal[1] === "kniter" ? Number(matchedBuyer[0]?.id) : null,
            }));
          }
        }

      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          buyerId: null,
          knitterId: null,
        }));
      }
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      if (
        name === "contractFile" ||
        name === "deliveryNotes" ||
        name === "invoiceFile" ||
        name === "qualityDoc" ||
        name === "tcFiles"
      ) {
        dataUpload(value, name);
        return;
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: value,
        }));
      }
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };


  const onBlur = (e: any, type: any) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
    const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
    const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
    if (type === "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
      return;
    }

    if (type === "alphaNumeric") {
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
    }

    if (type === "billNumbers") {
      const valid = regexBillNumbers.test(value);
      if (!valid) {
        setErrors((prev: any) => ({
          ...prev,
          [name]:
            "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()",
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
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

    if (value != "" && type == "float") {
      if (Number(value) <= 0) {
        setErrors((prev: any) => ({
          ...prev,
          [name]: "Value Should be more than 0",
        }));
      } else {
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: Number(value).toFixed(2),
        }));
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
        if (Number(value)) {
          const formattedValue = Number(value) % 1 === 0 ? Number(value)?.toFixed(0) : Number(value)?.toFixed(2);
          const newVal = formattedValue.toString().replace(/\.00$/, '')
          setFormData((prevData: any) => ({
            ...prevData,
            [name]: Number(newVal),
          }));
          setErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      }
    }
  };

  const requiredSpinnerFields = [
    "seasonId",
    "date",
    "programId",
    "buyerType",
    "noOfBoxes",
    "boxIds",
    "transactionViaTrader",
    "transactionAgent",
    "processorName",
    "processorAddress",
    "buyerOption",
    "batchLotNo",
    "invoiceNo",
    "billOfLadding",
    "transporterName",
    "vehicleNo",
    "invoiceFile",
    "price"
  ];

  const validateField = (name: string, value: any, index: number = 0) => {
    if (requiredSpinnerFields.includes(name)) {
      switch (name) {
        case "seasonId":
          return value?.length === 0 || value === null || value === undefined
            ? "Season is required"
            : "";
        case "date":
          return value?.length === 0 || value === null
            ? "Date is required"
            : "";
        case "programId":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "noOfBoxes":
          return value === null || value === undefined ? "No of Boxes are required" : errors.noOfBoxes != "" ? errors.noOfBoxes : "";
        case "boxIds":
          return value.trim() === "" ? "Box Id is required" : errors.boxIds != "" ? errors.boxIds : "";
          case "price":
            return value === null ? "Price/Kg is required" : errors.price != "" ? errors.price : "";
        case "buyerType":
          return value.trim() === "" ? "Please select any one option" : "";
        case "transactionViaTrader":
          return value?.length === 0 || value === null
            ? "Please select any one option"
            : "";
        case "transactionAgent":
          return (formData.transactionViaTrader === true && value?.trim() === "")
            ? "Agent Details is required"
            : errors?.transactionAgent
              ? errors?.transactionAgent
              : "";
        case "buyerOption":
          return (formData.buyerType === "Mapped" && (value?.value === null || !value?.value))
            ? "Weaver/Knitter is required"
            : "";
        case "processorName":
          return formData.buyerType === "New Buyer" && value?.trim() === ""
            ? "This Field is required"
            : errors?.processorName
              ? errors?.processorName
              : "";
        case "processorAddress":
          return formData.buyerType === "New Buyer" && value?.trim() === ""
            ? "This Field is required"
            : errors?.processorAddress
              ? errors?.processorAddress
              : "";
        case "batchLotNo":
          return value.trim() === ""
            ? "Batch/Lot No is required"
            : errors?.batchLotNo
              ? errors?.batchLotNo
              : "";
        case "invoiceNo":
          return value.trim() === ""
            ? "Invoice No is required"
            : errors?.invoiceNo
              ? errors?.invoiceNo
              : "";
        case "billOfLadding":
          return value.trim() === ""
            ? "This field is required"
            : errors?.billOfLadding
              ? errors?.billOfLadding
              : "";
        case "transporterName":
          return value.trim() === ""
            ? "Transporter Name is required"
            : errors?.transporterName
              ? errors?.transporterName
              : "";
        case "vehicleNo":
          return value.trim() === ""
            ? "Vehicle No is required"
            : errors?.vehicleNo
              ? errors?.vehicleNo
              : "";
        case "invoiceFile":
          return value.length === 0
            ? "Invoice File is required"
            : ""
        default:
          return "";
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newSpinnerErrors: any = {};

    Object.keys(formData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any]
      );
    });

    const hasSpinnerErrors = Object.values(newSpinnerErrors).some(
      (error) => !!error
    );

    if (hasSpinnerErrors) {
      setErrors(newSpinnerErrors);
    }

    if (!formData.totalQty) {
      setErrors((prev: any) => ({
        ...prev,
        chooseYarn: "Choose Yarn is Required",
      }));
      return;
    }

    if (!hasSpinnerErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("spinner-process/sales", {
          ...formData,
          buyerOption: formData.buyerOption?.value
        })
        if (response.success) {
          toasterSuccess("Sales Successfully Created");
          sessionStorage.removeItem("spinnerSales");
          sessionStorage.removeItem("spinnerChooseYarn");
          router.push("/spinner/sales");
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        toasterError("An Error occurred.");
        setIsSubmitting(false);
      }
    } else {
      return;
    }
  };

  const onCancel = () => {
    sessionStorage.removeItem("spinnerSales");
    sessionStorage.removeItem("spinnerChooseYarn");
    router.push("/spinner/sales");
  };

  if (roleLoading || isSubmitting) {
    return <Loader />;
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access.create) {
    return (
      <>
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
                  <NavLink href="/spinner/sales">Sale</NavLink>
                </li>
                <li>New Sale</li>
              </ul>
            </div>

            <div className="bg-white rounded-md p-4">
              <div className="w-100 mt-4">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-sm-6 mt-4">
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
                        {errors?.seasonId && (
                          <div className="text-sm text-red-500">
                            {errors.seasonId}
                          </div>
                        )}
                      </div>
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
                          placeholderText="From"
                          className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        />
                        {errors.date && (
                          <p className="text-red-500  text-sm mt-1">
                            {errors.date}
                          </p>
                        )}
                      </div>
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
                                  checked={formData.programId == program.id}
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
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Order Reference
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          name="orderRef"
                          value={formData.orderRef || ""}
                          onChange={(e) => handleChange("orderRef", e.target.value)}
                          onBlur={(e) => onBlur(e, "alphaNumeric")}
                          type="text"
                          placeholder="Order Reference"
                        />
                        {errors?.orderRef !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.orderRef}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Choose Yarn <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <button
                            name="chooseYarn"
                            type="button"
                            onClick={() => getChooseYarn()}
                            className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                          >
                            Choose Yarn
                          </button>
                          <p className="text-sm flex items-center px-3">
                            {formData?.totalQty || 0} Kgs chosen
                          </p>
                        </div>
                        {errors?.chooseYarn !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.chooseYarn}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Choose Buyer <span className="text-red-500">*</span>
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="buyerType"
                                checked={formData.buyerType === "Mapped"}
                                onChange={(e) => handleChange("buyerType", e.target.value)}
                                value="Mapped"
                              />
                              <span></span>
                            </section>{" "}
                            Mapped
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="buyerType"
                                checked={formData.buyerType === "New Buyer"}
                                onChange={(e) => handleChange("buyerType", e.target.value)}
                                value="New Buyer"
                              />
                              <span></span>
                            </section>{" "}
                            New Buyer
                          </label>
                        </div>
                        {errors?.buyerType !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.buyerType}
                          </div>
                        )}
                      </div>
                      {formData.buyerType === "Mapped" ? (
                        <>
                          <div className="col-12 col-sm-6 mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Weaver/Knitter <span className="text-red-500">*</span>
                            </label>
                            {/* <Form.Select
                              aria-label="Weaver"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                              name="buyerOption"
                              value={formData.buyerOption || ""}
                              onChange={(event) => handleChange(event)}
                            >
                              <option value="">Select Weaver/Knitter</option>
                              {buyerOptions?.map((item: any) => (
                                <option
                                  key={item.id + "-" + item.type}
                                  value={item.name + "-" + item.type}
                                >
                                  {item.name + " - " + item.type}
                                </option>
                              ))}
                            </Form.Select> */}
                            <Select
                              name="buyerOption"
                              value={formData.buyerOption || ""}
                              menuShouldScrollIntoView={false}
                              isClearable
                              placeholder="Select Weaver/Knitter"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={(buyerOptions || []).map(({ id, name, type }: any) => ({
                                label: name + "-" + type,
                                value: id,
                                key: name + "-" + type
                              }))}
                              onChange={(item: any) => {
                                handleChange("buyerOption", item);
                              }}
                            />
                            {errors?.buyerOption && (
                              <div className="text-sm text-red-500">
                                {errors.buyerOption}
                              </div>
                            )}
                          </div>
                        </>
                      ) : formData.buyerType === "New Buyer" ? (
                        <>
                          <div className="col-12 col-sm-6  mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Processor Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              name="processorName"
                              value={formData.processorName || ""}
                              onChange={(e) => handleChange("processorName", e.target.value)}
                              onBlur={(e) => onBlur(e, "alphabets")}
                              type="text"
                              placeholder="Processor Name"
                            />
                            {errors?.processorName && (
                              <div className="text-sm text-red-500">
                                {errors.processorName}
                              </div>
                            )}
                          </div>
                          <div className="col-12 col-sm-6  mt-4">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              name="processorAddress"
                              value={formData.processorAddress}
                              onChange={(e) => handleChange("processorAddress", e.target.value)}
                              onBlur={(e) => onBlur(e, "billNumbers")}
                              placeholder="Address"
                              rows={3}
                            />
                            {errors?.processorAddress !== "" && (
                              <div className="text-sm text-red-500">
                                {errors.processorAddress}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Transaction via Trader{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="transactionViaTrader"
                                checked={formData.transactionViaTrader === true}
                                onChange={(e) => handleChange("transactionViaTrader", e.target.value)}
                                value={"Yes"}
                              />
                              <span></span>
                            </section>{" "}
                            Yes
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                type="radio"
                                name="transactionViaTrader"
                                checked={formData.transactionViaTrader === false}
                                onChange={(e) => handleChange("transactionViaTrader", e.target.value)}
                                value={""}
                              />
                              <span></span>
                            </section>{" "}
                            No
                          </label>
                        </div>
                        {errors?.transactionViaTrader !== "" && (
                          <div className="text-sm text-red-500">
                            {errors.transactionViaTrader}
                          </div>
                        )}
                      </div>
                      {formData.transactionViaTrader && (
                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Agent Details <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="transactionAgent"
                            value={formData.transactionAgent}
                            onChange={(e) => handleChange("transactionAgent", e.target.value)}
                            onBlur={(e) => onBlur(e, "billNumbers")}
                            placeholder="Agent Details"
                            rows={3}
                          />
                          {errors?.transactionAgent !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.transactionAgent}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Total Yarn Quantity (Kgs)
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          disabled
                          placeholder="Total Yarn Quantity (Kgs)"
                          name="totalQty"
                          value={formData.totalQty || ""}
                          onChange={(e) => handleChange("totalQty", e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Yarn Count
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          disabled
                          placeholder="Yarn Count"
                          name="yarncount"
                          value={yarnCountName}
                          onChange={(e) => handleChange("yarncount", e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          No of Boxes/Cartons <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="number"
                          placeholder="No of Boxes/Cartons"
                          name="noOfBoxes"
                          value={formData.noOfBoxes || ""}
                          onChange={(e) => handleChange("noOfBoxes", e.target.value)}
                        />
                        {errors.noOfBoxes && (
                          <p className="text-red-500  text-sm mt-1">
                            {errors.noOfBoxes}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Batch/Lot No <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          placeholder="Batch/Lot No"
                          name="batchLotNo"
                          onBlur={(e) => onBlur(e, "billNumbers")}
                          value={formData.batchLotNo || ""}
                          onChange={(e) => handleChange("batchLotNo", e.target.value)}
                        />
                        {errors.batchLotNo && (
                          <p className="text-red-500  text-sm mt-1">
                            {errors.batchLotNo}
                          </p>
                        )}
                      </div>

                      <div className="col-12 col-sm-6 mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          REEL Lot No
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          disabled
                          placeholder="REEL Lot No"
                          name="reelLotNno"
                          value={formData.reelLotNno || ""}
                          onChange={(e) => handleChange("reelLotNno", e.target.value)}
                        />
                      </div>

                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Box ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="text"
                          placeholder="Box ID"
                          onBlur={(e) => onBlur(e, "alphaNumeric")}
                          name="boxIds"
                          value={formData.boxIds}
                          onChange={(e) => handleChange("boxIds", e.target.value)}
                        />
                        {errors?.boxIds !== "" && (
                          <div className="text-sm pt-1 text-red-500">{errors?.boxIds} </div>
                        )}
                      </div>

                      <div className="col-12 col-sm-6  mt-4">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Price/Kg <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          type="number"
                          placeholder="Price/Kg"
                          name="price"
                          value={formData.price}
                      onBlur={(e) => onBlur(e, "numeric")}
                          onChange={(e) => handleChange("price", e.target.value)}
                        />
                        {errors?.price !== "" && (
                          <div className="text-sm pt-1 text-red-500">{errors?.price} </div>
                        )}
                      </div>

                    </div>
                    <hr className="mt-4" />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">OTHER INFORMATION:</h4>
                      <div className="row">
                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Invoice No <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="invoiceNo"
                            value={formData.invoiceNo || ""}
                            onChange={(e) => handleChange("invoiceNo", e.target.value)}
                            onBlur={(e) => onBlur(e, "billNumbers")}
                            type="text"
                            placeholder="Invoice No *"
                          />
                          {errors.invoiceNo && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.invoiceNo}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            LR/BL No <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="billOfLadding"
                            value={formData.billOfLadding || ""}
                            onChange={(e) => handleChange("billOfLadding", e.target.value)}
                            type="text"
                            onBlur={(e) => onBlur(e, "billNumbers")}
                            placeholder="Bill Of Ladding"
                          />
                          {errors.billOfLadding && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.billOfLadding}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Transporter Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="transporterName"
                            value={formData.transporterName || ""}
                            onChange={(e) => handleChange("transporterName", e.target.value)}
                            onBlur={(e) => onBlur(e, "alphabets")}
                            type="text"
                            placeholder="Transporter Name"
                          />
                          {errors.transporterName && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.transporterName}
                            </p>
                          )}
                        </div>
                        <div className="col-12 col-sm-6  mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Vehicle No <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            name="vehicleNo"
                            value={formData.vehicleNo || ""}
                            onChange={(e) => handleChange("vehicleNo", e.target.value)}
                            onBlur={(e) => onBlur(e, "alphaNumeric")}
                            type="text"
                            placeholder="Vehicle No"
                          />
                          {errors.vehicleNo && (
                            <p className="text-red-500  text-sm mt-1">
                              {errors.vehicleNo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr className="mt-4" />
                    <div className="mt-4">
                      <h4 className="text-md font-semibold">OTHER DOCUMENTS:</h4>
                      <div className="row">
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Upload Quality Document
                          </label>
                          <div className="inputFile">
                            <label>
                              Choose File <GrAttachment />
                              <input
                                type="file"
                                name="qualityDoc"
                                accept=".pdf,.zip, image/jpg, image/jpeg"
                                onChange={(e) => handleChange("qualityDoc", e?.target?.files?.[0])}
                              />
                            </label>
                          </div>
                          <p className="py-2 text-sm">
                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                          </p>
                          {fileName.qualityDoc && (
                            <div className="flex text-sm mt-1">
                              <GrAttachment />
                              <p className="mx-1">{fileName.qualityDoc}</p>
                            </div>
                          )}
                          {errors?.qualityDoc !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.qualityDoc}
                            </div>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Upload TC's
                          </label>
                          <div className="inputFile">
                            <label>
                              Choose File <GrAttachment />
                              <input
                                name="tcFiles"
                                type="file"
                                accept=".pdf,.zip, image/jpg, image/jpeg"
                                onChange={(e) => handleChange("tcFiles", e?.target?.files?.[0])}
                              />
                            </label>
                          </div>
                          <p className="py-2 text-sm">
                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                          </p>
                          {fileName.tcFiles && (
                            <div className="flex text-sm mt-1">
                              <GrAttachment />
                              <p className="mx-1">{fileName.tcFiles}</p>
                            </div>
                          )}
                          {errors?.tcFiles !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.tcFiles}
                            </div>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Contract Files
                          </label>
                          <div className="inputFile">
                            <label>
                              Choose File <GrAttachment />
                              <input
                                name="contractFile"
                                type="file"
                                accept=".pdf,.zip, image/jpg, image/jpeg"
                                onChange={(e) => handleChange("contractFile", e?.target?.files?.[0])}
                              />
                            </label>
                          </div>
                          <p className="py-2 text-sm">
                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                          </p>
                          {fileName.contractFile && (
                            <div className="flex text-sm mt-1">
                              <GrAttachment />
                              <p className="mx-1">{fileName.contractFile}</p>
                            </div>
                          )}
                          {errors?.contractFile !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.contractFile}
                            </div>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Invoice Files <span className="text-red-500">*</span>
                          </label>
                          <div className="inputFile">
                            <label>
                              Choose File <GrAttachment />
                              <input
                                name="invoiceFile"
                                type="file"
                                multiple
                                accept=".pdf,.zip, image/jpg, image/jpeg"
                                onChange={(e) => handleChange("invoiceFile", e?.target?.files)}
                              />
                            </label>
                          </div>
                          <p className="py-2 text-sm">
                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                          </p>
                          {errors?.invoiceFile !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.invoiceFile}
                            </div>
                          )}
                          {fileName.invoiceFile &&
                            fileName.invoiceFile.map((item: any, index: any) => (
                              <div className="flex text-sm mt-1" key={index}>
                                <GrAttachment />
                                <p className="mx-1">{item}</p>
                                <div className="w-1/3">
                                  <button
                                    name="handle"
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-sm rounded text-black px-2 font-semibold"
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        <div className="col-12 col-sm-6 mt-4">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Delivery Notes
                          </label>
                          <div className="inputFile">
                            <label>
                              Choose File <GrAttachment />
                              <input
                                name="deliveryNotes"
                                type="file"
                                accept=".pdf,.zip, image/jpg, image/jpeg"
                                onChange={(e) => handleChange("deliveryNotes", e?.target?.files?.[0])}
                              />
                            </label>
                          </div>
                          <p className="py-2 text-sm">
                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                          </p>
                          {fileName.deliveryNotes && (
                            <div className="flex text-sm mt-1">
                              <GrAttachment />
                              <p className="mx-1">{fileName.deliveryNotes}</p>
                            </div>
                          )}
                          {errors?.deliveryNotes !== "" && (
                            <div className="text-sm text-red-500">
                              {errors.deliveryNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr className="mt-4" />
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
                        <button className="btn-outline-purple" onClick={onCancel}>
                          CANCEL
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
