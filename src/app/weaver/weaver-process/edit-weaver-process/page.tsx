"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Form from "react-bootstrap/Form";
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
    useTitle("Edit Process");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [from, setFrom] = useState<Date | null>(new Date());
    const [chooseYarn, setChooseYarn] = useState<any>([]);
    const [Access, setAccess] = useState<any>({});
    const [data, setData] = useState<any>([])
    const [weftCottonmixType, setWeftCottonMixtype] = useState<any>();
    const [weftCottonmixQty, setWeftCottonmixQty] = useState<any>();
    const [totalBlend, setTotalBlend] = useState<any>(0);

    const [cottonMix, setCottonMix] = useState<any>([]);

    const [fabric, setFabric] = useState<any>();

    const [weavFabType, setWeavFabType] = useState<any>();
    const [weavFabLength, setWeavFabLength] = useState<any>();
    const [weavGsm, setWeavGsm] = useState<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [fileName, setFileName] = useState({
        blendInvoice: "",
        blendDocuments: [],
    });

    const [formData, setFormData] = useState<any>({
        date: new Date(),
        programId: null,
        seasonId: null,
        garmentOrderRef: "",
        brandOrderRef: "",
        yarnQty: 0,
        additionalYarnQty: 0,
        blendChoosen: null,
        cottonmixType: [],
        cottonmixQty: [],
        blendMaterial: "",
        blendVendor: "",
        totalYarnQty: null,
        fabricType: [],
        fabricLength: [],
        fabricGsm: [],
        batchLotNo: "",
        jobDetailsGarment: "",
        noOfRolls: "",
        // physicalTraceablity: false,
        totalFabricLength: 0,
        blendInvoice: null,
        blendDocuments: [],
        dyeingRequired: null,
        processName: "",
        reelLotNo: "",
        processorName: "",
        dyeingAddress: "",
        yarnDelivered: null,
        processLoss: null,
        processNetYarnQty: 0,
    });

    const [errors, setErrors] = useState<any>({});
    const weaverId = User.weaverId;

    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
            const access = checkAccess("Weaver Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);

    useEffect(() => {
        if (weaverId) {
            fetchProcess();
            getFabricType()
            getCottonMix()
        }
    }, [weaverId]);

    console.log(data, "data");

    const fetchProcess = async () => {
        try {
            const response = await API.get(
                `weaver-process/process?weaverId=${weaverId}`
            );
            if (response.success) {
                const { blend_invoice, blend_document, ...restData } = response.data[5];
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setData({
                    ...restData,
                    blend_document: blend_document.map((url: any) => url.split('/').pop()),
                    blend_invoice: getFileId(blend_invoice),
                });
            }

        } catch (error) {
            console.error(error);
        }
    };

    const getFabricType = async () => {
        try {
            const res = await API.get(`fabric-type`);
            if (res.success) {
                setFabric(res.data);
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
        if (name === "blendDocuments") {
            let filesLink: any = [...formData.blendDocuments];
            let filesName: any = [...fileName.blendDocuments];

            for (let i = 0; i < e.target.files.length; i++) {
                if (!e.target.files[i]) {
                    return setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: "No File Selected",
                    }));
                } else {
                    if (!allowedFormats.includes(e.target.files[i]?.type)) {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            [name]: "Invalid file format.Upload a valid Format",
                        }));

                        e.target.value = "";
                        return;
                    }

                    const maxFileSize = 5 * 1024 * 1024;

                    if (e.target.files[i].size > maxFileSize) {
                        setErrors((prevError: any) => ({
                            ...prevError,
                            [name]: `File size exceeds the maximum limit (5MB).`,
                        }));

                        e.target.value = "";
                        return;
                    }
                }
                dataVideo.set("file", e.target.files[i]);
                try {
                    const response = await API.postFile(url, dataVideo);
                    if (response.success) {
                        filesLink.push(response.data);
                        filesName.push(e.target.files[i].name);

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
                [e.target.name]: filesLink,
            }));
            setFileName((prevFile: any) => ({
                ...prevFile,
                [e.target.name]: filesName,
            }));
        } else {
            if (!e.target.files[0]) {
                return setErrors((prevError: any) => ({
                    ...prevError,
                    [e.target.name]: "No File Selected",
                }));
            } else {
                if (!allowedFormats.includes(e.target.files[0]?.type)) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: "Invalid file format.Upload a valid Format",
                    }));

                    e.target.value = "";
                    return;
                }

                const maxFileSize = 5 * 1024 * 1024;

                if (e.target.files[0].size > maxFileSize) {
                    setErrors((prevError: any) => ({
                        ...prevError,
                        [name]: `File size exceeds the maximum limit (5MB).`,
                    }));

                    e.target.value = "";
                    return;
                }

                setErrors((prevError: any) => ({
                    ...prevError,
                    [e.target.name]: "",
                }));
            }
            dataVideo.append("file", e.target.files[0]);
            try {
                const response = await API.postFile(url, dataVideo);
                if (response.success) {
                    setFileName((prevFile: any) => ({
                        ...prevFile,
                        [e.target.name]: e.target.files[0].name,
                    }));
                    setFormData((prevFormData: any) => ({
                        ...prevFormData,
                        [e.target.name]: response.data,
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

    const handleChange = (event: any, val?: any) => {
        const { name, value } = event.target;
        if (name === "transactionViaTrader") {
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: val,
            }));
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
        }
        // else if (name === "physicalTraceablity") {
        //   if (value == "yes") {
        //     setFormData((prevData: any) => ({
        //       ...prevData,
        //       [name]: true,
        //     }));
        //   } else {
        //     setFormData((prevData: any) => ({
        //       ...prevData,
        //       [name]: false,
        //     }));
        //   }
        // }
        else if (name === "buyerType") {
            setErrors((prev: any) => ({
                ...prev,
                buyerId: "",
                fabricId: "",
            }));
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));
        } else if (name === "blendChoosen") {
            if (value == "Yes") {
                setFormData((prevData: any) => ({
                    ...prevData,
                    [name]: true,
                }));
            } else {
                setFormData((prevData: any) => ({
                    ...prevData,
                    [name]: false,
                    cottonmixType: [],
                    cottonmixQty: [],
                }));
            }
        } else {
            if (name === "blendDocuments" || name === "blendInvoice") {
                dataUpload(event, name);
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

        if (value != "" && type === "alphabets") {
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

        if (value != "" && type === "alphaNumeric") {
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

        if (value != "" && type === "billNumbers") {
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
    };

    const addWeav = () => {
        if (
            weavFabType?.length > 0 &&
            weavGsm?.length > 0 &&
            weavFabLength?.length > 0
        ) {
            const parsedGsm = weavGsm;
            const parsednetweight = Number(weavFabLength);

            const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
            const valid = regexAlphaNumeric.test(parsedGsm);
            if (formData.totalFabricLength > formData.totalYarnQty || (formData.totalYarnQty > 0 && formData.totalYarnQty - formData.totalFabricLength < parsednetweight)) {
                setErrors((prevData: any) => ({
                    ...prevData,
                    fabricType: "Cannot Add Items.Total Fabric Net Weight cannot exceeds Total Yarn Utilized fabric.",
                    fabricGsm: "",
                    fabricLength: "",
                }));
            }
            else if (formData.fabricType?.includes(Number(weavFabType))) {
                setErrors((prevData: any) => ({
                    ...prevData,
                    fabricType: "Already Exist",
                }));
            } else {
                setErrors((prevErrors: any) => ({
                    ...prevErrors,
                    fabricType: "",
                    fabricGsm:
                        parsedGsm?.length > 20
                            ? "Value should not exceed 20 characters"
                            : !valid
                                ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                                : "",
                    fabricLength:
                        parsednetweight <= 0
                            ? "Quantity must be greater than 0"
                            : parsednetweight.toString().length > 10
                                ? "Value should not exceed 10 characters"
                                : "",
                }));

                if (
                    parsedGsm.length < 20 &&
                    valid &&
                    parsednetweight > 0 &&
                    parsednetweight.toString().length < 10
                ) {
                    sessionStorage.setItem("savedData", JSON.stringify(formData));
                    setFormData((prevData: any) => ({
                        ...prevData,
                        fabricType: [...prevData.fabricType, Number(weavFabType)],
                        fabricGsm: [...prevData.fabricGsm, parsedGsm],
                        fabricLength: [...prevData.fabricLength, parsednetweight],
                    }));

                    setWeavFabType([]);
                    setWeavGsm([]);
                    setWeavFabLength([]);
                }
            }
        } else {
            setErrors((prevData: any) => ({
                ...prevData,
                fabricType:
                    weavFabType?.length === 0 || weavFabType === undefined
                        ? "Select knit Fabric is Required"
                        : "",
                fabricLength:
                    weavFabLength?.length === 0 || weavFabType === undefined
                        ? "Fabric Net Length is Required"
                        : "",
                fabricGsm:
                    weavGsm?.length === 0 || weavFabType === undefined
                        ? "This field is Required"
                        : "",
            }));
        }
    };

    const addBlend = () => {
        if (weftCottonmixQty?.length > 0 && weftCottonmixType?.length > 0) {
            if (formData.cottonmixType.includes(Number(weftCottonmixType))) {
                setErrors((prevData: any) => ({
                    ...prevData,
                    cottonmixType: "Already Exist",
                }));
            } else {
                setErrors((prevData: any) => ({
                    ...prevData,
                    cottonmixType: "",
                    cottonmixQty: "",
                }));
                sessionStorage.setItem("savedData", JSON.stringify(formData));
                setFormData((prevData: any) => ({
                    ...prevData,
                    cottonmixType: [...prevData.cottonmixType, Number(weftCottonmixType)],
                    cottonmixQty: [...prevData.cottonmixQty, Number(weftCottonmixQty)],
                }));
                setWeftCottonMixtype("");
                setWeftCottonmixQty("");
            }
        } else {
            setErrors((prevData: any) => ({
                ...prevData,
                cottonmixType: "Select cotton Mix Quantity and Type",
            }));
        }
    };

    const requiredSpinnerFields = [
        "seasonId",
        "date",
        "programId",
        "garmentOrderRef",
        "brandOrderRef",
        "blendMaterial",
        "blendVendor",
        "buyerType",
        "buyerId",
        "blendChoosen",
        "fabricId",
        "transactionViaTrader",
        "cottonmixType",
        "cottonmixQty",
        "baleIds",
        "fabricContruction",
        "fabricWeight",
        "fabricLength",
        "fabricType",
        "fabricGsm",
        "batchLotNo",
        "invoiceNo",
        "billOfLadding",
        "transporterName",
        "vehicleNo",
        "dyeingRequired",
        "jobDetailsGarment",
        "processName",
        "processorName",
        "dyeingAddress",
        "processLoss",
        // "physicalTraceablity",
        "noOfRolls",
    ];

    const validateField = (
        name: string,
        value: any,
        dataName: string,
        index: number = 0
    ) => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;

        if (requiredSpinnerFields.includes(name)) {
            switch (name) {

                case "garmentOrderRef":
                    return value === "" ? "Garment Order Reference No is Required" : regexAlphaNumeric.test(value) === false
                        ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                        : value.length > 50
                            ? "Value should not exceed 50 characters"
                            : "";
                case "blendMaterial":
                    return formData.blendChoosen === true && value.trim() === ""
                        ? "This Field is Required"
                        : regexAlphabets.test(value) === false
                            ? "Accepts only Alphabets and special characters like _,-,()"
                            : "";
                case "blendVendor":
                    return formData.blendChoosen === true && value.trim() === ""
                        ? "This Field is Required"
                        : regexBillNumbers.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                            : "";
                case "brandOrderRef":
                    return value === "" ? "Brand Order Reference No is Required" : regexAlphaNumeric.test(value) === false
                        ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                        : value.length > 50
                            ? "Value should not exceed 50 characters"
                            : "";
                case "blendChoosen":
                    return value?.length === 0 || value === null
                        ? "Please select any one option"
                        : "";
                // case "physicalTraceablity":
                //   return value?.length === 0 || value === null
                //     ? "Please select any one option"
                //     : "";
                case "batchLotNo":
                    return value.trim() === ""
                        ? "Batch/Lot No is required"
                        : value.length > 20
                            ? "Value should not exceed 20 characters"
                            : regexBillNumbers.test(value) === false
                                ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                                : "";

                case "cottonmixType":
                    return formData.blendChoosen === true &&
                        (value?.length === 0 || value === null)
                        ? "Blend Type is required"
                        : "";
                case "cottonmixQty":
                    return formData.blendChoosen === true &&
                        (value?.length === 0 || value === null)
                        ? "Blend Qunatity is required"
                        : "";
                case "fabricType":
                    return value?.length === 0 || value === null
                        ? "Fabric Type is required"
                        : "";
                case "fabricLength":
                    return value?.length === 0 || value === null
                        ? "Fabric length is required"
                        : "";
                case "fabricGsm":
                    return value?.length === 0 || value === null
                        ? "Fabric GSM is required"
                        : "";
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
                formData[fieldName as keyof any],
                "spinner"
            );
        });

        const hasWeaversErrors = Object.values(newSpinnerErrors).some(
            (error) => !!error
        );

        if (hasWeaversErrors) {
            setErrors(newSpinnerErrors);
        }
        if (!chooseYarn) {
            setErrors((prev: any) => ({
                ...prev,
                yarnQty: "Choose Yarn is Required",
            }));
            return;
        }

        if (!hasWeaversErrors) {
            try {
                setIsSubmitting(true);
                const response = await API.post("weaver-process/process", {
                    ...formData,
                    weaverId: weaverId,
                    chooseYarn: chooseYarn,
                });
                if (response.success) {
                    toasterSuccess("Process created successfully");
                    router.push("/weaver/weaver-process");
                    sessionStorage.removeItem("savedData");
                    sessionStorage.removeItem("savedWeaver");
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

    if (roleLoading || isSubmitting) {
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
            <>
                <div>
                    <div className="breadcrumb-box">
                        <div className="breadcrumb-inner light-bg">
                            <div className="breadcrumb-left">
                                <ul className="breadcrum-list-wrap">
                                    <li>
                                        <Link href="/weaver/dashboard" className="active">
                                            <span className="icon-home"></span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/weaver/weaver-process" className="active">
                                            Process
                                        </Link>
                                    </li>

                                    <li>Edit Process</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-4">
                        <div className="w-100 mt-4">
                            <div className="customFormSet">
                                <div className="w-100">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-2">
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
                                        <div className="col-12 col-sm-6 mt-2" >
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Date
                                            </label>

                                            <DatePicker
                                                selected={from}
                                                dateFormat={"dd-MM-yyyy"}
                                                maxDate={new Date()}
                                                onChange={handleFrom}
                                                disabled
                                                showYearDropdown
                                                placeholderText="From"
                                                className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />

                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Garment Order Reference No
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                value={data?.garment_order_ref || ""}
                                                placeholder="Garment Order Reference No"
                                            />

                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Brand Order Reference No
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                value={data.brand_order_ref || ""}
                                                placeholder=" Brand Order Reference No"
                                            />

                                        </div>


                                        {!chooseYarn && (

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
                                        )}
                                    </div>

                                    <div className="row">
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Quantity in kgs
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="yarnQty"
                                                value={`${formData.yarnQty} Kgs` || `0 kgs`}
                                                type="text"
                                                disabled
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Additional Yarn Quantity(in kgs)
                                            </label>
                                            <input
                                                type="text"
                                                name="additionalYarnQty"
                                                placeholder="Weft Yarn Qty"
                                                disabled
                                                value={`${formData.additionalYarnQty} Kgs` || `0 kgs`}
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Do you want to blend?{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blendChoosen"
                                                            checked={data.other_mix === true}
                                                            value="Yes"
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
                                                            name="blendChoosen"
                                                            checked={data.other_mix === false}
                                                            disabled
                                                            value="No"
                                                        />
                                                        <span></span>
                                                    </section>{" "}
                                                    No
                                                </label>
                                            </div>

                                        </div>

                                        {data.other_mix === true && (
                                            <>
                                                <hr className="mt-4" />

                                                <div className="col-12 col-sm-12 mt-4 py-2 ">
                                                    <h5 className="font-semibold">Blending</h5>
                                                    <div className="row">
                                                        <div className="col-12 col-sm-3 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Blend Type
                                                            </label>
                                                            <Form.Select
                                                                aria-label="fabricType"
                                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                                value={weftCottonmixType}
                                                                disabled
                                                                name="cottonmixType"

                                                            >
                                                                <option value="">Select</option>
                                                                {cottonMix?.map((item: any) => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {item.cottonMix_name}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>

                                                        </div>

                                                        <div className="col-12 col-sm-3 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                Blend Quantity
                                                            </label>
                                                            <input
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                type="number"
                                                                placeholder="Blend Quantity"
                                                                onBlur={(e) => onBlur(e, "numbers")}
                                                                name="cottonmixQty"
                                                                value={weftCottonmixQty || ""}
                                                                disabled
                                                            />

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

                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    <div className="flex gap-3 mt-2 px-2 py-1">
                                                        <div className="flex w-1/2">
                                                            <div className="w-1/2 text-sm">Total:</div>
                                                            <div className="w-1/2 text-sm">{totalBlend}</div>
                                                        </div>
                                                    </div>
                                                    <hr className="mt-4" />
                                                </div>

                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Name of the Blending Material
                                                    </label>
                                                    <input
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        type="text"
                                                        onBlur={(e) => onBlur(e, "alphabets")}
                                                        placeholder="Name of the Blending Material"
                                                        name="blendMaterial"
                                                        value={data.blend_material || ""}
                                                        disabled
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Blending Material Vendor Details
                                                    </label>
                                                    <textarea
                                                        className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        rows={3}
                                                        placeholder="Blending Material Vendor Details"
                                                        name="blendVendor"
                                                        value={data.blend_vendor || ""}
                                                        disabled
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Total yarn Utilized(Kgs)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                placeholder="Total Yarn Quantity (Kgs)"
                                                name="totalYarnQty"
                                                value={formData.totalYarnQty || ""}
                                            />
                                        </div>

                                        <hr className="mt-5" />
                                        <div className="row py-4">
                                            <div className="col-12 col-sm-3 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Weaver Fabric Type{" "}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <Form.Select
                                                    aria-label="fabricType"
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                                                    name="fabricType"
                                                    value={weavFabType || ""}
                                                    disabled
                                                >
                                                    <option value="">Select Fabric</option>
                                                    {fabric?.map((fabricType: any) => (
                                                        <option key={fabricType.id} value={fabricType.id}>
                                                            {fabricType.fabricType_name}
                                                        </option>
                                                    ))}
                                                </Form.Select>

                                            </div>

                                            <div className="col-12 col-sm-3 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Finished Fabric Length in Mts
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="number"
                                                    placeholder="Fabric Length"
                                                    name="fabricLength"
                                                    value={weavFabLength || []}
                                                    disabled
                                                />

                                            </div>
                                            <div className="col-12 col-sm-3 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Finished Fabric (GSM)
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
                                                    placeholder="Gsm"
                                                    name="fabricGsm"
                                                    value={weavGsm || []}
                                                    disabled
                                                />

                                            </div>

                                            <div className="col-12 col-sm-3 mt-4">
                                                <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                                                    <button
                                                        className="btn-purple mr-2"
                                                        disabled
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>

                                            {data.fabric_type?.length > 0 &&
                                                data.fabric_type?.map((item: any, index: number) => {
                                                    return (
                                                        <div
                                                            className="flex gap-3 mt-2 px-2 py-1 bg-gray-300"
                                                            key={index}
                                                        >
                                                            <div className="w-1/3">
                                                                {fabric?.map((mix: any) => {
                                                                    if (mix.id === item) {
                                                                        return mix.fabricType_name;
                                                                    }
                                                                })}
                                                            </div>
                                                            <div className="w-1/3 text-sm">
                                                                {data?.fabric_length[index]}
                                                            </div>
                                                            <div className="w-1/3 text-sm">
                                                                {data?.fabric_gsm[index]}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>

                                        <hr className="mt-4" />

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Total Finished Fabric Length(in Mts)
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                disabled
                                                placeholder="Total Finished Fabric Length"
                                                value={formData.totalFabricLength}
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Finished Batch/Lot No{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Batch/Lot No"
                                                name="batchLotNo"
                                                onBlur={(e) => onBlur(e, "billNumbers")}
                                                value={formData.batchLotNo || ""}
                                                onChange={(event) => handleChange(event)}
                                            />
                                            {errors.batchLotNo && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.batchLotNo}
                                                </p>
                                            )}
                                        </div>
                                        {data.program?.program_name === "REEL" &&
                                            <div className="col-12 col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Fabric Reel Lot No
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
                                                    placeholder="Fabric Reel Lot No"
                                                    disabled
                                                    value={data.reel_lot_no || ""}
                                                />

                                            </div>
                                        }
                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Job details from garment
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                placeholder="Job details for Garment"
                                                disabled
                                                value={data.job_details_garment || ""}
                                            />

                                        </div>

                                        <div className="col-12 col-sm-6  mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                No.of Rolls
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="number"
                                                placeholder="No.of Rolls"
                                                disabled
                                                value={data.no_of_rolls || ""}
                                            />

                                        </div>
                                    </div>
                                </div>

                                <hr className="mt-4" />
                                <div className="mt-4">
                                    <h4 className="text-md font-semibold">DOCUMENTS:</h4>
                                    <div className="row">
                                        {data.other_mix && (
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Upload Blending Invoice
                                                </label>
                                                <div className="inputFile">
                                                    <label>
                                                        Choose File <GrAttachment />
                                                        <input
                                                            name="blend_invoice"
                                                            type="file"
                                                            accept=".pdf,.zip, image/jpg, image/jpeg"
                                                            disabled
                                                        />
                                                    </label>
                                                </div>
                                                <p className="py-2 text-sm">
                                                    (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                </p>
                                                {data.blend_invoice && (
                                                    <div className="flex text-sm mt-1">
                                                        <GrAttachment />
                                                        <p className="mx-1">{data.blend_invoice}</p>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Blending material other documents
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    Choose File <GrAttachment />
                                                    <input
                                                        name="blendDocuments"
                                                        type="file"
                                                        multiple
                                                        disabled
                                                    />
                                                </label>
                                            </div>
                                            <p className="py-2 text-sm">
                                                (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                            </p>

                                            {data.blend_document &&
                                                data.blend_document.map((item: any, index: any) => (
                                                    <div className="flex text-sm mt-1" key={index}>
                                                        <GrAttachment />
                                                        <p className="mx-1">{item}</p>

                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                <hr className="mt-4" />
                                <div className="row">
                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Dyeing/Other Process Required?{" "}
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

                                    {data.dyeing_required == true && (
                                        <>
                                            <hr className="mt-4" />
                                            <div className="mt-4">
                                                <h4 className="text-md font-semibold">
                                                    Dyeing/Other Process:
                                                </h4>
                                                <div className="row">
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Name of The Processor
                                                            <span className="text-red-500">*</span>
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            disabled
                                                            name="processorName"
                                                            placeholder="Processor Name"
                                                            value={data.dyeing?.processor_name || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Address<span className="text-red-500">*</span>
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            placeholder="Address"
                                                            disabled
                                                            value={data.dyeing?.dyeing_address || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Name Process
                                                            <span className="text-red-500">*</span>
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            name="processName"
                                                            disabled
                                                            placeholder="Process Name"
                                                            value={data.dyeing?.process_name || ""}
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Qty of Yarn Delivered
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            name="yarnDelivered"
                                                            value={data.dyeing?.yarn_delivered || 0}
                                                            type="text"
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Process Loss (%) If Any?
                                                            <span className="text-red-500">*</span>
                                                        </label>

                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="number"
                                                            name="processLoss"
                                                            disabled
                                                            placeholder="Process Loss (%) If Any?"
                                                            value={data.dyeing?.process_loss || ""}
                                                        />

                                                    </div>

                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Net Yarn Qty
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            type="text"
                                                            disabled
                                                            value={data.dyeing?.net_yarn || 0}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
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
                                        <button
                                            className="btn-outline-purple"
                                            onClick={() => {
                                                router.push("/weaver/weaver-process");
                                                sessionStorage.removeItem("savedData");
                                                sessionStorage.removeItem("savedWeaver");
                                            }}
                                        >
                                            CANCEL
                                        </button>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
