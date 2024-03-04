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
  useTitle("New Process");
  const [roleLoading, hasAccesss] = useRole();
  const spinnerId = User.spinnerId;

  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [from, setFrom] = useState<Date | null>(new Date());
  const [season, setSeason] = useState<any>();
  const [chooseLint, setchooseLint] = useState<any>([]);
  const [chooseComberNoil, setChooseComberNoil] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otherData, setOtherData] = useState("");
  const [program, setProgram] = useState<any>();
  const [yarnCount, setYarnCount] = useState<any>();
  const [cottonMix, setCottonMix] = useState<any>([]);
  const [cottonmixType, setCottonMixtype] = useState<any>();
  const [cottonMixQty, setCottonMixQty] = useState<any>([]);
  const [totalBlend, setTotalBlend] = useState<any>(0);
  const [blendRealization, setBlendRealization] = useState<any>(0);

  const [yarnCountMulti, setYarnCountMulti] = useState<any>();
  const [yarnQtyMulti, setYarnQtyMulti] = useState<any>([]);
  const [totalYarnQty, setTotalYarnQty] = useState<any>(0);
  const [other, setOther] = useState<any>(false);
  const [errors, setErrors] = useState<any>({});
  const [dataLength, setDataLength] = useState(0);

  const [yarnData, setYarnData] = useState<any>([])
  const [formData, setFormData] = useState<any>({
    date: new Date(),
    programId: null,
    seasonId: null,
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
    const savedData: any = sessionStorage.getItem("spinnerLint");
    const totalQuantity: any = sessionStorage.getItem("spinnerChooseLint");
    const comberData: any = sessionStorage.getItem("comberNoil");
    const processData = JSON.parse(savedData);
    const cottonData = JSON.parse(totalQuantity);
    const comber = JSON.parse(comberData);
    if (processData) {
      setFormData(processData);
    }
    setchooseLint(cottonData);
    setChooseComberNoil(comber ? comber : []);
  }, []);

  useEffect(() => {
    const cottonTotal = chooseLint?.totalQuantityUsed
      ? chooseLint?.totalQuantityUsed
      : 0;
    const comberTotal = chooseComberNoil?.totalQuantityUsed
      ? chooseComberNoil?.totalQuantityUsed
      : 0;

    const sum: any = DecimalFormat(formData.cottonmixQty.reduce(
      (accumulator: any, currentValue: any) => +accumulator + +currentValue,
      0
    ));

    const yarnQty: any = DecimalFormat(formData?.yarnQtyProduced?.reduce(
      (accumulator: any, currentValue: any) => +accumulator + +currentValue,
      0
    ));
    setTotalYarnQty(yarnQty)

    const blendRealization: any = DecimalFormat((sum * 99) / 100);

    const totlint: any = DecimalFormat(+cottonTotal + +comberTotal);
    const totblend: any = parseInt(blendRealization);

    if (cottonTotal > 0) {
      setErrors((prev: any) => ({
        ...prev,
        chooseLintReq: "",
      }));
    }

    setTotalBlend((sum));

    setBlendRealization(blendRealization);
    setFormData((prev: any) => ({
      ...prev,
      totalQty: DecimalFormat(+cottonTotal + +comberTotal + +sum),
    }));

    const maxRealisation = {
      Carded: 90,
      Combed: 80,
      "Semi Combed": 85,
      Other: 90,
    };

    if (formData.yarnType || other) {
      if (formData.yarnType == "Combed") {
        const comberNoil = (cottonTotal * 13) / 100;
        setFormData((prev: any) => ({
          ...prev,
          comber_noil: comberNoil,
        }));
      } else if (formData.yarnType == "Semi Combed") {
        const comberNoil = (cottonTotal * 7.5) / 100;
        setFormData((prev: any) => ({
          ...prev,
          comber_noil: comberNoil,
        }));
      } else if (other) {
        setFormData((prev: any) => ({
          ...prev,
          comber_noil: 0,
        }));
      } else {
        setFormData((prev: any) => ({
          ...prev,
          comber_noil: 0,
        }));
      }
    }

    if (yarnQty > 0 && totlint > 0) {
      const calYarnRealisation = DecimalFormat(
        ((parseFloat(yarnQty) - parseFloat(totblend)) /
          parseFloat(totlint)) *
        100
      );
      setFormData((prev: any) => ({
        ...prev,
        yarnRealisation: calYarnRealisation ? calYarnRealisation : 0,
      }));
      if (
        formData.yarnType == "Combed" &&
        (Number(calYarnRealisation) > maxRealisation.Combed ||
          Number(calYarnRealisation) < 0)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          yarnRealisation:
            "Yarn Realisation (%) should be <= 80 and greater than or equal to 0",
        }));
        return;
      } else if (
        formData.yarnType == "Semi Combed" &&
        (Number(calYarnRealisation) > maxRealisation["Semi Combed"] ||
          Number(calYarnRealisation) < 0)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          yarnRealisation:
            "Yarn Realisation (%) should be <= 85 and greater than or equal to 0",
        }));
        return;
      } else if (
        (formData.yarnType == "Carded" || other) &&
        (Number(calYarnRealisation) > maxRealisation.Carded ||
          Number(calYarnRealisation) > maxRealisation.Other ||
          Number(calYarnRealisation) < 0)
      ) {
        setErrors((prev: any) => ({
          ...prev,
          yarnRealisation:
            "Yarn Realisation (%) should be <= 90 and greater than or equal to 0",
        }));
        return;
      } else {
        setErrors((prev: any) => ({
          ...prev,
          yarnRealisation: "",
        }));
        return;
      }
    }
  }, [
    formData.cottonmixQty,
    formData.yarnQtyProduced,
    formData.yarnType,
    formData.yarnCount,
    other,
  ]);

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
          case "seasonId":
            return value?.length === 0 || value === null || value === undefined
              ? "Season is required"
              : "";
          case "batchLotNo":
            return value.trim() === ""
              ? "Batch Lot No is required"
              : errors.batchLotNo !== ""
                ? errors.batchLotNo
                : "";
          case "programId":
            return value === null ? "Please select any one option" : "";
          case "yarnQtyProduced":
            return value === null || formData.yarnQtyProduced?.length === 0
              ? "Yarn quanity Produced is required" :
              "";
          case "otherMix":
            return value === null ? "Please select any one option" : "";
          // case "noOfBox":
          //   return value === null
          //     ? "No of boxes/Cartons is required" : errors.noOfBox != "" ? errors.noOfBox : "";
          case "cottonmixType":
            return formData.otherMix === true && totalBlend == 0
              ? "Please Fill the required fields"
              : errors.cottonmixType != ""
                ? errors.cottonmixType
                : "";
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

    if (!chooseLint) {
      setErrors((prev: any) => ({
        ...prev,
        chooseLintReq: "Choose Lint is Required",
      }));
      return;
    }

    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("spinner-process", {
          ...formData,
          yarnType: other == true && otherData ? otherData : formData.yarnType,
          chooseLint: chooseLint.chooseLint,
          chooseComberNoil: chooseComberNoil.chooseComberNoil,
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
  // const handleChange = (name?: any, value?: any, event?: any) => {
  //   if (
  //     name === "heapRegister" ||
  //     name === "weighBridge" ||
  //     name === "deliveryChallan" ||
  //     name === "baleProcess"
  //   ) {
  //     dataUpload(value, name);
  //     return;
  //   }
  //   else if (name === "programId" || name === "seasonId") {
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: Number(value),
  //     }));
  //   }
  //   else {
  //     setFormData((prevData: any) => ({
  //       ...prevData,
  //       [name]: value,
  //     }));
  //   }
  //   setErrors((prevErrors: any) => ({
  //     ...prevErrors,
  //     [name]: "",
  //   }));
  // };
  // const handleChange = (name?: any, value?: any, event?: any) => {
  //   // const { value, name } = event.target;
  //   const updateFormData = (newData: any) => setFormData((prevData: any) => ({ ...prevData, ...newData }));
  //   switch (name) {
  //     case "processComplete":
  //     case "otherMix":
  //     case "dyeingRequired":
  //       updateFormData({ [name]: value });
  //       if (name === "otherMix" && value !== "yes") {
  //         updateFormData({
  //           cottonmixQty: [],
  //           cottonmixType: [],
  //         });
  //       }


  //       else if (name === "dyeingRequired" && value !== "yes") {
  //         updateFormData({
  //           processName: "",
  //           processLoss: null,
  //           processNetYarnQty: null,
  //           processorName: "",
  //           dyeingAddress: "",
  //           yarnDelivered: null,
  //         });
  //       }
  //       break;
  //     case "yarnQtyProduced":
  //     case "noOfBox":
  //     case "programId":
  //       updateFormData({ [name]: name === "noOfBox" ? parseInt(value) : value });
  //       if (name === "programId") {
  //         setErrors((prev: any) => ({ ...prev, programId: "" }));
  //       }
  //       break;
  //     case "yarnType":
  //       if (["Carded", "Combed", "Semi Combed"].includes(value)) {
  //         setOther(false);
  //         setOtherData("");
  //       } else {
  //         setOther(true);
  //       }
  //       updateFormData({ [name]: value });
  //       break;
  //     case "otherData":
  //       setOtherData(value);
  //       break;
  //     default:
  //       updateFormData({ [name]: value });
  //   }
  // };


  const handleChange = (name?: any, value?: any, event?: any) => {

    // const { value, name } = event.target;
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
      getSeason();
      getYarnCount();
      fetchProcessesLength();
      getProgram();
      getCottonMix();
    }
  }, [spinnerId]);

  useEffect(() => {
    setFormData((prevData: any) => ({
      ...prevData,
      netYarnQty: totalYarnQty ? totalYarnQty : 0,
      yarnDelivered: totalYarnQty ? totalYarnQty : 0,
      processNetYarnQty: formData.processLoss
        ? DecimalFormat(
          +totalYarnQty -
          + totalYarnQty * (+formData.processLoss / 100)
        )
        : +totalYarnQty || 0,
    }));
  }, [totalYarnQty, formData.processLoss]);

  const fetchProcessesLength = async () => {
    try {
      const res = await API.get(`spinner-process?spinnerId=${spinnerId}`);
      if (res.success) {
        setDataLength(res.data?.length);
      }
    } catch (error) {
      console.log(error);
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
        `spinner-process/get-program?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setProgram(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const chooseLintButton = () => {
    if (formData.programId !== null) {
      sessionStorage.setItem("spinnerLint", JSON.stringify(formData));
      router.push(
        `/spinner/spinner-process/choose-lint?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose lint",
      }));
    }
  };

  const choosedComberNoil = () => {
    if (formData.programId) {
      sessionStorage.setItem("spinnerLint", JSON.stringify(formData));
      router.push(
        `/spinner/spinner-process/choose-comber-noil?id=${formData.programId}`
      );
    } else {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose comber noil",
      }));
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

  const addMultiYarn = () => {
    if (Number(formData.totalQty) === 0 || formData.totalQty === null) {
      setErrors((prevData: any) => ({
        ...prevData,
        yarnCount: "Select Choose Lint",
      }));
      return;
    }
    if (yarnCountMulti?.value > 0 && yarnQtyMulti > 0) {
      setErrors((prevData: any) => ({
        ...prevData,
        yarnCount: "",
        yarnQtyProduced: ""
      }));
      if (Number(yarnQtyMulti) === 0) {
        setErrors((prevData: any) => ({
          ...prevData,
          yarnQtyProduced: "Quantity must be greater than 0",
        }));
      }
      else if (formData?.yarnCount?.includes(Number(yarnCountMulti?.value))) {
        setErrors((prevData: any) => ({
          ...prevData,
          yarnCount: "Already Exist",
        }));
      }
      else {
        const totalYarnQty = formData.yarnQtyProduced.reduce((acc: any, curr: any) => acc + curr, 0);
        if (totalYarnQty + Number(yarnQtyMulti) > Number(formData.totalQty)) {
          setErrors((prevData: any) => ({
            ...prevData,
            yarnQtyProduced: "Yarn Quantity Produced cannot be greater than Total Lint/Blend (Kgs)",
          }));
          return;
        }

        if (yarnCountMulti?.value > 0 && yarnQtyMulti > 0) {
          setErrors({
            yarnCount: "",
            yarnQtyProduced: "",
          });

          setFormData((prevData: any) => ({
            ...prevData,
            yarnCount: [...prevData.yarnCount, Number(yarnCountMulti?.value)],
            yarnQtyProduced: [...prevData.yarnQtyProduced, Number(yarnQtyMulti)],
            netYarnQty: totalYarnQty + Number(yarnQtyMulti),
          }));

          const newYarnData = {
            yarnCount: Number(yarnCountMulti?.value),
            yarnProduced: Number(yarnQtyMulti)
          };

          setYarnData((prevYarnData: any) => [...prevYarnData, newYarnData]);

          setYarnCountMulti(null);
          setYarnQtyMulti("");
        }
      }
    }
    else {
      setErrors((prevData: any) => ({
        ...prevData,
        yarnCount: "Select yarn count and yarn quantity produced",
      }));
    }
  };

  const removeYarn = (index: any) => {
    let yCount = formData.yarnCount;
    let yQty = formData.yarnQtyProduced;

    let arr1 = yCount.filter((element: any, i: number) => index !== i);
    let arr2 = yQty.filter((element: any, i: number) => index !== i);

    const updatedYarnData = [...yarnData];
    updatedYarnData.splice(index, 1);
    setYarnData(updatedYarnData);
    sessionStorage.setItem("spinnerLint", JSON.stringify(formData));

    setFormData((prevData: any) => ({
      ...prevData,
      yarnCount: arr1,
      yarnQtyProduced: arr2,
    }));
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
              <li>New Process</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100">
            {dataLength > 0 && (
              <div className="flex justify-left mb-4">
                <button
                  name="spinner"
                  type="button"
                  onClick={() =>
                    router.push("/spinner/quality-parameter/upload-test-spinner")
                  }
                  className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                >
                  Upload Test Report
                </button>
              </div>
            )}

            <div className="row">
              <div className="borderFix pt-2 pb-2">
                <div className="row">
                  <div className="col-12 col-sm-6  my-2">
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

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Choose Lint <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <button
                    name="chooseLint"
                    type="button"
                    onClick={chooseLintButton}
                    className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                  >
                    Choose Lint
                  </button>
                  <p className="text-sm flex items-center px-3">
                    {chooseLint?.totalQuantityUsed || 0} Kgs chosen
                  </p>
                </div>
                {errors?.chooseLintReq !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.chooseLintReq}
                  </div>
                )}
              </div>

              <div className="col-12 col-sm-6 mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Choose Comber Noil
                </label>
                <div className="flex">
                  <button
                    name="choosedComberNoil"
                    type="button"
                    onClick={choosedComberNoil}
                    className="bg-sky-500 flex text-sm rounded text-white px-3 py-1.5"
                  >
                    Choose Comber Noil
                  </button>
                  <p className="text-sm flex items-center px-3">
                    {chooseComberNoil?.totalQuantityUsed || 0} Kgs chosen
                  </p>
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
                        name="otherMix"
                        checked={formData.otherMix === true}
                        onChange={(e) => handleChange("otherMix", e.target.value)}
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
                        name={`otherMix`}
                        value="no"
                        checked={formData.otherMix === false}
                        onChange={(e) => handleChange("otherMix", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>
                {errors?.otherMix !== "" && (
                  <div className="text-sm text-red-500">{errors.otherMix}</div>
                )}
              </div>

              {formData.otherMix == true && (
                <div className="col-12 col-sm-12 mt-4 py-2 border">
                  <h5 className="font-semibold">Blending</h5>
                  <div className="flex justify-between py-2">
                    <div className="w-1/4">
                      <label>Blend</label>
                    </div>
                    <div className="w-3/4">
                      <div className="row">
                        <div className="lg:w-1/3 md:w-1/3 sm:w-full">
                          <Select
                            value={cottonmixType}
                            name="cottonmixType"
                            menuShouldScrollIntoView={false}
                            isClearable
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
                        <div className="lg:w-1/3 md:w-1/3 sm:w-full">
                          <input
                            type="number"
                            name="cottonMixQty"
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
                        <div className="lg:w-1/3 md:w-1/3 sm:w-full">
                          <button
                            name="ginner"
                            type="button"
                            onClick={addBlend}
                            className="bg-[#d15e9c] text-sm rounded text-white px-2 mt-1 h-11 w-16"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {
                        formData?.cottonmixType?.length > 0 && formData?.cottonmixType?.map(
                          (item: any, index: number) => {
                            return (
                              <div className="row py-2" key={index}>
                                <div className="col-12 col-sm-4">
                                  <input
                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                    type="text"
                                    value={cottonMix && cottonMix?.find((mix: any) => mix.id === item)?.cottonMix_name || ''}
                                    onChange={handleChange}
                                    disabled
                                  />
                                </div>
                                <div className="col-12 col-sm-4">
                                  <input
                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                    type="text"
                                    value={formData?.cottonmixQty[index] || ''}
                                    onChange={handleChange}
                                    disabled
                                  />
                                </div>
                                <div className="col-12 col-sm-3 mt-2">
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
                        <div className="w-1/2 flex gap-3 flex-wrap">
                          <div className="text-sm">Total:</div>
                          <div className="text-sm">{totalBlend}</div>
                        </div>
                        <div className="w-1/2 flex gap-3 flex-wrap">
                          <div className="text-sm">Realisataion:</div>
                          <div className="text-sm">{blendRealization}</div>
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
                  value={formData.totalQty || ""}
                  onChange={handleChange}
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
                        value="Carded"
                        checked={formData.yarnType == "Carded"}
                        onChange={(e) => handleChange("yarnType", e.target.value)}
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
                        value="Combed"
                        checked={formData.yarnType == "Combed"}
                        onChange={(e) => handleChange("yarnType", e.target.value)}
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
                        value="Semi Combed"
                        checked={formData.yarnType == "Semi Combed"}
                        onChange={(e) => handleChange("yarnType", e.target.value)}
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
                        value="Other"
                        checked={other == true}
                        onChange={(e) => handleChange("yarnType", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    Other
                  </label>
                  {other && (
                    <input
                      type="text"
                      name="otherData"
                      placeholder="Type of Yarn"
                      value={otherData}
                      onChange={(e) => handleChange("otherData", e.target.value)}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
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
                  options={
                    (yarnCount || []).map(({ id, yarnCount_name }: any) => ({
                      label: yarnCount_name,
                      value: id,
                    })) as unknown as readonly (
                      | string
                      | GroupBase<string>
                    )[]
                  }
                  onChange={(item: any) =>
                    setYarnCountMulti(item)
                  }
                />

                {errors?.yarnCount !== "" && (
                  <div className="text-sm text-red-500">{errors.yarnCount}</div>
                )}
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
                      // onBlur={(e) => onBlur(e, "numeric")}
                      name="yarnQtyProduced"
                      placeholder="Quantity"
                      value={yarnQtyMulti || ""}
                      onChange={(e: any) => setYarnQtyMulti(e.target.value)}
                    />
                    {errors?.yarnQtyProduced !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {errors?.yarnQtyProduced}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-sm-4 mt-4 flex items-center">
                    <button
                      name="multiYarn"
                      type="button"
                      onClick={addMultiYarn}
                      className="bg-[#d15e9c] text-sm rounded text-white px-2  h-11 w-16"

                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {
                formData?.yarnCount?.length > 0 && (
                  <div className="mt-4 border">
                    {
                      formData?.yarnCount?.length > 0 && formData?.yarnCount?.map(
                        (item: any, index: number) => {
                          return (
                            <div className="row py-2" key={index}>
                              <div className="col-12 col-sm-6 ">
                                <input
                                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                  type="text"
                                  value={yarnCount && yarnCount?.find((yarn: any) => yarn.id === item)?.yarnCount_name || ''}
                                  onChange={handleChange}
                                  disabled
                                />
                              </div>
                              <div className="col-12 col-sm-3">
                                <input
                                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                  type="text"
                                  value={formData?.yarnQtyProduced[index] || ''}
                                  onChange={handleChange}
                                  disabled
                                />
                              </div>
                              <div className="col-12 col-sm-3 mt-2">
                                <button
                                  name="multiYarn"
                                  type="button"
                                  onClick={() => removeYarn(index)}
                                  className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                >
                                  X
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>

                )
              }
              <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  Yarn Realisation (%) <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="text"
                  name="yarnRealisation"
                  placeholder="Yarn Realisation"
                  value={formData.yarnRealisation || ""}
                  disabled
                  onChange={handleChange}
                />
                {errors?.yarnRealisation !== "" && (
                  <div className="text-sm text-red-500">
                    {errors.yarnRealisation}
                  </div>
                )}
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
                  value={formData.netYarnQty || ""}
                  onChange={handleChange}
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
                  value={formData.comber_noil + " Kgs" || "0.00 Kgs"}
                  onChange={handleChange}
                />
              </div>

              {/* <div className="col-12 col-sm-6  mt-4">
                <label className="text-gray-500 text-[12px] font-medium">
                  No of Boxes/Cartons <span className="text-red-500">*</span>
                </label>

                <input
                  className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                  type="number"
                  onBlur={(e) => onBlur(e, "numbers")}
                  name="noOfBox"
                  placeholder="No of Box"
                  value={formData.noOfBox || ""}
                  onChange={handleChange}
                />
                {errors?.noOfBox !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.noOfBox}
                  </div>
                )}
              </div> */}

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

              {/* <div className="col-12 col-sm-6  mt-4">
              <label className="text-gray-500 text-[12px] font-medium">
                Box ID
              </label>

              <input
                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                type="text"
                onBlur={(e) => onBlur(e, "alphaNumeric")}
                name="boxId"
                placeholder="Box Id"
                value={formData.boxId || ""}
                onChange={handleChange}
              />
              {errors?.boxId !== "" && (
                <div className="text-sm pt-1 text-red-500">{errors?.boxId}</div>
              )}
            </div> */}

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
                        value="yes"
                        checked={formData.processComplete === true}
                        onChange={(e) => handleChange("processComplete", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`processComplete`}
                        value="no"
                        checked={formData.processComplete === false}
                        onChange={(e) => handleChange("processComplete", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>
                {errors?.processComplete !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.processComplete}
                  </div>
                )}
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
                        name={`dyeingRequired`}
                        value="yes"
                        checked={formData.dyeingRequired === true}
                        onChange={(e) => handleChange("dyeingRequired", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    Yes
                  </label>
                  <label className="mt-1 d-flex mr-4 align-items-center">
                    <section>
                      <input
                        type="radio"
                        name={`dyeingRequired`}
                        value="no"
                        checked={formData.dyeingRequired === false}
                        onChange={(e) => handleChange("dyeingRequired", e.target.value)}
                      />
                      <span></span>
                    </section>{" "}
                    No
                  </label>
                </div>
                {errors?.dyeingRequired !== "" && (
                  <div className="text-sm pt-1 text-red-500">
                    {errors?.dyeingRequired}
                  </div>
                )}
              </div>
            </div>
            {formData.dyeingRequired == true && (
              <>
                <hr className="mt-4" />
                <div className="mt-4">
                  <h4 className="text-md font-semibold">Dyeing/Other Process:</h4>
                  <div className="row">
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name of The Processor{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "alphabets")}
                        name="processorName"
                        placeholder="Processor Name"
                        value={formData.processorName || ""}
                        onChange={(e) => handleChange("processorName", e.target.value)}
                      />
                      {errors.processorName && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processorName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Address <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "bill")}
                        name="dyeingAddress"
                        placeholder="Address"
                        value={formData.dyeingAddress || ""}
                        onChange={(e) => handleChange("dyeingAddress", e.target.value)}
                      />
                      {errors.dyeingAddress && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.dyeingAddress}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Name Process <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="text"
                        onBlur={(e) => onBlur(e, "alphabets")}
                        name="processName"
                        placeholder="Process Name"
                        value={formData.processName || ""}
                        onChange={(e) => handleChange("processName", e.target.value)}
                      />
                      {errors.processName && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processName}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Qty of Yarn Delivered
                      </label>
                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="yarnDelivered"
                        value={formData.yarnDelivered + " Kgs" || "0.00 Kgs"}
                        onChange={(e) => handleChange("yarnDelivered", e.target.value)}
                        type="text"
                        disabled
                      />
                    </div>
                    <div className="col-12 col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Process Loss (%) If Any?{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        type="number"
                        onBlur={(e) => onBlur(e, "percentage")}
                        name="processLoss"
                        placeholder="Process Loss (%) If Any?"
                        value={formData.processLoss || ""}
                        onChange={(e) => handleChange("processLoss", e.target.value)}
                      />
                      {errors.processLoss && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.processLoss}
                        </p>
                      )}
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
                        value={formData.processNetYarnQty + " Kgs" || "0.00 Kgs"}
                        onChange={(e) => handleChange("processNetYarnQty", e.target.value)}
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
      </div>
    );
  }
}
