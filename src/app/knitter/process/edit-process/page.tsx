"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "@components/core/Loader";
import Link from "@components/core/nav-link";
import { GrAttachment } from "react-icons/gr";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

export default function page() {
    const { translations, loading } = useTranslations();
    useTitle("Edit Process");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});

    const [data, setData] = useState<any>([])

    const [from, setFrom] = useState<Date | null>(new Date());
    const [cotton, setCotton] = useState<any>();
    const [fabric, setFabric] = useState<any>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [fileName, setFileName] = useState({
        blendDocuments: [],
        blendInvoice: "",
    });
    const [errors, setErrors] = useState<any>({});

    const [formData, setFormData] = useState<any>({
        knitterId: "",
        seasonId: null,
        date: new Date().toISOString(),
        programId: null,
        brandorderRef: "",
        blendMaterial: "",
        vendorDetails: "",
        garmentOrder: "",
        cottonmixType: [],
        cottonmixQty: [],
        // traceability: false,
        contractFile: "",
        quantChooseYarn: "",
        processorName: "",
        processLoss: "",
        totalQty: "",
        agentDetails: "",
        nameProcess: "",
        yarnDeliveryFinal: "",
        yarnDelivery1: "",
        address: "",
        blend: "",
        KnitFabric: [],
        knitWeight: [],
        fabricGsm: [],
        fabricWeight: [],
        reelLotNo: "",
        dyeing: "",
        jobDetailsGarment: "",
        noroll: "",
        batchlotno: "",
        totalfabric: "",
        blendDocuments: [],
        blendInvoice: null,
    });

    const knitterId = User.knitterId;


    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
            const access = checkAccess("Knitter Process");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);


    useEffect(() => {
        if (knitterId) {
            fetchSales()
            getCottonMix()
            getKnitFabric()
        }
    }, [knitterId])

    const fetchSales = async () => {
        try {
            const response = await API.get(
                `knitter-process/process?knitterId=${knitterId}`
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
    const getCottonMix = async () => {
        try {
            const res = await API.get("cottonmix");
            if (res.success) {
                setCotton(res.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const getKnitFabric = async () => {
        try {
            const res = await API.get("fabric-type");
            if (res.success) {
                setFabric(res.data);
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

    const handleChange = (name?: any, value?: any, event?: any) => {
        if (name === "processLoss") {
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
                setFormData((prevData: any) => ({
                    ...prevData,
                    [name]: value,
                }));
            }
            return;
        }
        if (name === "programId") {
            setFormData((prevData: any) => ({
                ...prevData,
                [name]: value,
            }));
        }

        if (name === "blend" || name === "dyeing") {
            setFormData((prevFormData: any) => ({
                ...prevFormData,
                [name]: value === "Yes" ? true : false,
            }));
        }
        // else if (name === "traceability") {
        //   setFormData((prevData: any) => ({
        //     ...prevData,
        //     traceability: value === "Yes" ? true : false,
        //   }));
        // }
        else {
            if (name === "blendDocuments" || name === "blendInvoice") {
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

    const onBlur = (e: any, type: string) => {
        const { name, value } = e.target;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
        const regexBillNumbers = /^[().,\-/_a-zA-Z0-9 ]*$/;
        const errors = {};

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
                    [name]: Number(value).toFixed(2),
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

    const validateForm = () => {
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;
        const regexAlphabets = /^[(),.\-_a-zA-Z ]*$/;
        const newErrors = {} as Partial<any>;

        if (!formData.garmentOrder) {
            newErrors.garmentOrder = "Garment Order Reference No is Required";
        }
        if (formData.garmentOrder) {
            if (regexAlphaNumeric.test(formData.garmentOrder) === false) {
                newErrors.garmentOrder =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.garmentOrder && errors.garmentOrder) {
                newErrors.garmentOrder = errors.garmentOrder;
            }
        }

        if (formData.garmentOrder && formData.garmentOrder.length > 50) {
            newErrors.garmentOrder = " Value should not exceed 50 characters";
        }
        if (!formData.brandorderRef) {
            newErrors.brandorderRef = "brand Order Reference No is Required";
        }
        if (formData.brandorderRef) {
            if (regexAlphaNumeric.test(formData.brandorderRef) === false) {
                newErrors.brandorderRef =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.brandorderRef && errors.brandorderRef) {
                newErrors.brandorderRef = errors.brandorderRef;
            }
        }
        if (formData.brandorderRef && formData.brandorderRef.length > 50) {
            newErrors.brandorderRef = " Value should not exceed 50 characters";
        }
        if (formData.blend === "") {
            newErrors.blend = "Select Blend is Required";
        } else {
            delete newErrors.blend;
        }
        if (formData.blend === true && formData.cottonmixType?.length === 0) {
            newErrors.cottonmixType = "Select Cotton is Required";
        }
        if (formData.blend === true && formData.cottonmixQty?.length === 0) {
            newErrors.cottonmixQty = "Select Quantity is Required";
        }
        if (!formData.batchlotno) {
            newErrors.batchlotno = "Batch Lot No is Required";
        }
        if (formData.batchlotno) {
            if (regexAlphaNumeric.test(formData.batchlotno) === false) {
                newErrors.batchlotno =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.batchlotno && errors.batchlotno) {
                newErrors.batchlotno = errors.batchlotno;
            }
        }


        if (formData.blend === true && !formData.blendMaterial) {
            newErrors.blendMaterial = "This Field is Required";
        }
        if (formData.blendMaterial) {
            if (regexAlphaNumeric.test(formData.blendMaterial) === false) {
                newErrors.blendMaterial =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.blendMaterial && errors.blendMaterial) {
                newErrors.blendMaterial = errors.blendMaterial;
            }
        }
        if (formData.vendorDetails) {
            if (regexAlphaNumeric.test(formData.vendorDetails) === false) {
                newErrors.vendorDetails =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.vendorDetails && errors.vendorDetails) {
                newErrors.vendorDetails = errors.vendorDetails;
            }
        }
        if (formData.blend === true && !formData.vendorDetails) {
            newErrors.vendorDetails = "This Field is Required";
        }
        if (formData.jobDetailsGarment && errors.jobDetailsGarment) {
            newErrors.jobDetailsGarment = errors.jobDetailsGarment;
        }
        if (formData.jobDetailsGarment) {
            if (regexAlphaNumeric.test(formData.jobDetailsGarment) === false) {
                newErrors.jobDetailsGarment =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.jobDetailsGarment && errors.jobDetailsGarment) {
                newErrors.jobDetailsGarment = errors.jobDetailsGarment;
            }
        }
        if (formData.dyeing === "") {
            newErrors.dyeing = "Select Dyeing/Other Process is Required";
        }
        if (formData.dyeing === true) {
            if (!formData.processorName) {
                newErrors.processorName = "Processor Name is Required";
            } else if (formData.processorName?.length > 20) {
                newErrors.processorName = "Value should not exceed 20 characters";
            }
        }
        if (formData.dyeing === true) {
            if (regexAlphabets.test(formData.processorName) === false) {
                newErrors.processorName =
                    "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
            }
            if (
                formData.dyeing === true &&
                formData.processorName &&
                errors.processorName
            ) {
                newErrors.processorName = errors.processorName;
            }
        }
        if (formData.dyeing === true) {
            if (!formData.address) {
                newErrors.address = "Address  is Required";
            } else if (formData.address?.length > 20) {
                newErrors.address = "Value should not exceed 20 characters";
            }
        }
        if (formData.dyeing === true) {
            if (regexAlphaNumeric.test(formData.address) === false) {
                newErrors.address =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.dyeing === true && formData.address && errors.address) {
                newErrors.address = errors.address;
            }
        }
        if (formData.dyeing === true) {
            if (!formData.nameProcess) {
                newErrors.nameProcess = "Processor Name  is Required";
            } else if (formData.nameProcess?.length >= 10) {
                newErrors.nameProcess = "Value should not exceed 10 characters";
            }
        }
        if (formData.dyeing === true) {
            if (regexAlphabets.test(formData.nameProcess) === false) {
                newErrors.nameProcess =
                    "Accepts only Alphabets and special characters like comma(,),_,-,(),.";
            }
            if (
                formData.dyeing === true &&
                formData.nameProcess &&
                errors.nameProcess
            ) {
                newErrors.nameProcess = errors.nameProcess;
            }
        }
        if (formData.dyeing === true && !formData.processLoss) {
            newErrors.processLoss = "Process Loss  is Required";
        } else if (
            formData.dyeing &&
            (formData.processLoss < 0 || formData.processLoss > 100)
        ) {
            newErrors.processLoss = "Process Loss should be between 0 and 100";
        }


        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);

            const url = "knitter-process/process";
            const mainFormData = {
                knitterId: knitterId,
                date: formData.date,
                programId: Number(formData.programId),
                seasonId: Number(formData.seasonId),
                garmentOrderRef: formData.garmentOrder,
                brandOrderRef: formData.brandorderRef,
                // yarnQty: chooseYarn,
                // additionalYarnQty: yarnTotal,
                blendChoosen: formData.blend,
                cottonmixType: formData.cottonmixType,
                cottonmixQty: formData.cottonmixQty,
                blendMaterial: formData.blendMaterial,
                blendVendor: formData.vendorDetails,
                // totalYarnQty: yarnQty,
                fabricType: formData.KnitFabric,
                fabricGsm: formData.fabricGsm,
                fabricWeight: formData.knitWeight,
                batchLotNo: formData.batchlotno,
                jobDetailsGarment: formData.jobDetailsGarment,
                noOfRolls: Number(formData.noroll),
                // physicalTraceablity: formData.traceability,
                // totalFabricWeight: totalFabric,
                blendInvoice: formData.blendInvoice,
                blendDocuments: formData.blendDocuments,
                dyeingRequired: formData.dyeing,
                processName: formData.nameProcess,
                processorName: formData.processorName,
                dyeingAddress: formData.address,
                // yarnDelivered: totalFabric,
                processLoss: Number(formData.processLoss),
                // processNetYarnQty: finishedWeight,
                // chooseYarn: chooseyarnData,
                reelLotNo: formData.reelLotNo,
            };
            const mainResponse = await API.post(url, mainFormData);
            if (mainResponse.success) {
                toasterSuccess(
                    "Process created successfully",
                    3000,
                    mainFormData.knitterId
                );
                setIsSubmitting(false);
                router.push("/knitter/process");
                sessionStorage.removeItem("knitterProcess");
                sessionStorage.removeItem("selectedProcess");
            }
        } else {
            setIsSubmitting(false);
        }
    };

    const Total = data?.cottonmix_type?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0) || 0;


    if (loading || roleLoading || isSubmitting) {
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
            <>
                <div>
                    <div className="breadcrumb-box">
                        <div className="breadcrumb-inner light-bg">
                            <div className="breadcrumb-left">
                                <ul className="breadcrum-list-wrap">
                                    <li>
                                        <Link href="/knitter/dashboard" className="active">
                                            <span className="icon-home"></span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/knitter/process">
                                            {translations?.knitterInterface?.Process}
                                        </Link>
                                    </li>
                                    <li>
                                        Edit Process
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-4">
                        <div className="w-100">
                            <div className="customFormSet">
                                <div className="w-100">
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                Season
                                            </label>
                                            <Select
                                                name="seasonId"
                                                value={data.season?.name ? { label: data.season?.name, value: data.season?.name } : null}
                                                menuShouldScrollIntoView={false}
                                                isClearable
                                                isDisabled
                                                placeholder="Select Season"
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                            />

                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.transactions?.date}{" "}
                                            </label>
                                            <DatePicker
                                                selected={from ? from : null}
                                                dateFormat={"dd-MM-yyyy"}
                                                onChange={handleFrom}
                                                disabled
                                                maxDate={new Date()}
                                                showYearDropdown
                                                className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                            {errors.date && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.date}
                                                </p>
                                            )}
                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.GarmentOrderReference}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                value={data?.garment_order_ref || ""}
                                                placeholder={
                                                    translations?.knitterInterface?.GarmentOrderReference
                                                }
                                            />

                                        </div>
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.BrandOrderReference}
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                value={data.brand_order_ref || ""}
                                                placeholder={
                                                    translations?.knitterInterface?.BrandOrderReference
                                                }
                                            />

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
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.Quantity}
                                            </label>
                                            <input
                                                name="quantChooseYarn"
                                                value={data?.yarn_qty + " Kgs" || ""}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                disabled

                                            />
                                        </div>


                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.AdditionalYarn}
                                            </label>
                                            <input
                                                value={data?.additional_yarn_qty + " Kgs" || ""}
                                                onChange={(event) => handleChange(event)}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                disabled

                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className=" col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.wantblend}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blend"
                                                            disabled
                                                            checked={data.other_mix === true}
                                                            value="Yes"
                                                            className="form-radio"
                                                        />
                                                        <span></span>
                                                    </section>
                                                    Yes
                                                </label>
                                                <label className="mt-1 d-flex mr-4 align-items-center">
                                                    <section>
                                                        <input
                                                            type="radio"
                                                            name="blend"
                                                            disabled
                                                            checked={data.other_mix === false}
                                                            value="No"
                                                            className="form-radio"
                                                        />
                                                        <span></span>
                                                    </section>
                                                    No
                                                </label>
                                            </div>

                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.TotalUtil}
                                            </label>
                                            <input
                                                name="totalQty"
                                                value={data?.total_yarn_qty + " Kgs" || ""}
                                                type="text"
                                                placeholder="totalQty"
                                                readOnly
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>
                                    </div>

                                    {data.other_mix === true && (
                                        <>
                                            <hr className="mt-4" />

                                            <div className="col-12 col-sm-12 mt-4 py-2 ">
                                                <h5 className="font-semibold">
                                                    {translations?.knitterInterface?.Blending}
                                                </h5>
                                                <div className="row">
                                                    <div className="col-12 col-sm-3 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.cotton}{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <Select
                                                            menuShouldScrollIntoView={false}
                                                            isClearable
                                                            isDisabled
                                                            placeholder="Select Cotton"
                                                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"

                                                        />
                                                    </div>

                                                    <div className="col-12 col-sm-3 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.knitterInterface?.quantity}{" "}
                                                            <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            name="cottonMixQty"
                                                            disabled
                                                            type="number"
                                                            placeholder={
                                                                translations?.knitterInterface?.quantity
                                                            }
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-4 mt-4">
                                                        <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                                                            <button
                                                                className="btn-purple mr-2"
                                                                disabled

                                                            >
                                                                {translations?.common?.add}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {data?.cottonmix_type?.length > 0 &&
                                                        data?.cottonmix_type.map(
                                                            (item: any, index: number) => {
                                                                const selectedCottonMix = cotton?.find(
                                                                    (mix: any) => mix.id === item
                                                                );
                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        className="w-3/4 flex gap-3 mt-2 px-2 py-1 bg-gray-300"
                                                                    >
                                                                        <div className="w-1/3">
                                                                            {selectedCottonMix?.cottonMix_name || ""}
                                                                        </div>
                                                                        <div className="w-1/3">
                                                                            {data?.cottonmix_type[index] || ""}
                                                                        </div>
                                                                        <div className="w-1/3">
                                                                            <button
                                                                                // onClick={() => removeBlend(index)}
                                                                                className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                                                                disabled
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
                                                            <div className="w-1/2 text-sm">
                                                                {translations?.knitterInterface?.total}:
                                                            </div>
                                                            <div className="w-1/2 ">{Total}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr className="mt-4" />
                                            </div>
                                        </>
                                    )}
                                    {data.other_mix === true && (
                                        <>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.blendmaterial}{" "}
                                                    </label>
                                                    <input
                                                        name="blendMaterial"
                                                        value={data.blend_material || ""}
                                                        type="text"
                                                        readOnly
                                                        placeholder={
                                                            translations?.knitterInterface?.blendmaterial
                                                        }
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />

                                                </div>
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.vendor}{" "}
                                                    </label>
                                                    <textarea
                                                        name="vendorDetails"
                                                        value={data.blend_vendor || ""}
                                                        readOnly
                                                        placeholder={translations?.knitterInterface?.vendor}
                                                        rows={3}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                </div>
                                            </div>
                                            <hr className="mt-5" />
                                        </>
                                    )}

                                    <div className="row">
                                        <div className="col-12 col-sm-3 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.KnitFabricType}{" "}
                                            </label>
                                            <Select
                                                name="KnitFabric"
                                                menuShouldScrollIntoView={false}
                                                isClearable
                                                placeholder={translations?.common?.SelectknitFab}
                                                className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                isDisabled
                                            />
                                        </div>
                                        <div className="col-12 col-sm-3 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.FinishedFabricNetWeight}{" "}
                                            </label>
                                            <input
                                                name="knitWeight"
                                                disabled
                                                type="number"
                                                placeholder={
                                                    translations?.knitterInterface?.FinishedFabricNetWeight
                                                }
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>
                                        <div className="col-12 col-sm-3 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.FinishedFabricGSM}{" "}
                                            </label>
                                            <input
                                                name="fabricGsm"
                                                disabled
                                                type="text"
                                                placeholder={
                                                    translations?.knitterInterface?.FinishedFabricGSM
                                                }
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>
                                        <div className="col-12 col-sm-3 mt-4">
                                            <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                                                <button className="btn-purple mr-2" disabled>
                                                    {translations?.common?.add}
                                                </button>
                                            </div>
                                        </div>
                                        {data?.fabric_type?.length > 0 &&
                                            data?.fabric_type?.map((item: any, index: number) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex gap-3 mt-2 px-2 py-1 bg-gray-300"
                                                    >
                                                        <div className="w-1/3">
                                                            {fabric?.map((mix: any) => {
                                                                if (mix.id === item) {
                                                                    return mix.fabricType_name;
                                                                }
                                                            })}
                                                        </div>

                                                        <div className="w-1/3 text-sm">
                                                            {data?.fabric_weight[index]}
                                                        </div>
                                                        <div className="w-1/3 text-sm">
                                                            {data?.fabric_gsm[index]}
                                                        </div>

                                                        <div className="w-1/3">
                                                            <button
                                                                name="ginner"
                                                                type="button"
                                                                disabled
                                                                className="bg-red-500 text-sm rounded text-white px-2 py-1"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    <div className="row">
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.TotalFab}
                                            </label>
                                            <input
                                                name="totalfabric"
                                                value={data?.total_fabric_weight ? data?.total_fabric_weight + " Kgs" : 0 + " Kgs" || ""}
                                                type="text"
                                                readOnly
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.FinishedBatch}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="batchlotno"
                                                value={formData.batchlotno || ""}
                                                onBlur={(e) => onBlur(e, "bill")}
                                                onChange={(e) => handleChange("batchlotno", e.target.value)}
                                                type="text"
                                                placeholder={
                                                    translations?.knitterInterface?.FinishedBatch
                                                }
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                            {errors.batchlotno && (
                                                <p className="text-red-500  text-sm mt-1">
                                                    {errors.batchlotno}
                                                </p>
                                            )}
                                        </div>
                                        {data.program?.program_name === "REEL" &&
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.FabricReelLotNo}
                                                </label>
                                                <input
                                                    name="reelLotNo"
                                                    value={data.reel_lot_no || ""}
                                                    type="text"
                                                    readOnly
                                                    placeholder={
                                                        translations?.knitterInterface?.FabricReelLotNo
                                                    }
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />

                                            </div>
                                        }

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.JobDetailsfromgarments}
                                            </label>
                                            <input
                                                value={data.job_details_garment || ""}
                                                type="text"
                                                disabled
                                                placeholder={
                                                    translations?.knitterInterface?.JobDetailsfromgarments
                                                }
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />

                                        </div>
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.rolls}{" "}
                                            </label>
                                            <input
                                                value={data.no_of_rolls || ""}
                                                disabled
                                                type="number"
                                                placeholder={translations?.knitterInterface?.rolls}
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />

                                        </div>
                                    </div>
                                    <hr className="mt-4" />
                                    <p className="font-bold py-2 mt-4">DOCUMENTS:</p>
                                    <div className="row">
                                        {data.other_mix === true && (
                                            <>
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.knitterInterface?.uploadblend}
                                                    </label>
                                                    <div className="inputFile">
                                                        <label>
                                                            {translations?.knitterInterface?.ChooseFile}{" "}
                                                            <GrAttachment />
                                                            <input
                                                                name="blendInvoice"
                                                                type="file"
                                                                disabled
                                                                accept=".pdf,.zip, image/jpg, image/jpeg"
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

                                            </>
                                        )}
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.blendother}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}
                                                    <GrAttachment />
                                                    <input
                                                        name="blendDocuments"
                                                        type="file"
                                                        multiple
                                                        disabled
                                                        accept=".pdf,.zip, image/jpg, image/jpeg"
                                                        onChange={(e) => handleChange("blendDocuments", e?.target?.files)}
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
                                                        <div className="w-1/3">

                                                        </div>
                                                    </div>
                                                ))}

                                        </div>
                                        <hr className="mt-4" />
                                        <div className="row">
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.DyeingOther}{" "}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                disabled
                                                                checked={data.dyeing_required === true}
                                                                value="Yes"
                                                            />
                                                            <span></span>
                                                        </section>
                                                        Yes
                                                    </label>
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                disabled
                                                                checked={data.dyeing_required === false}
                                                                value="No"
                                                            />
                                                            <span></span>
                                                        </section>
                                                        No
                                                    </label>
                                                </div>
                                            </div>

                                            {data.dyeing_required === true && (
                                                <>
                                                    <hr className="mt-4" />
                                                    <div className="row mt-2">
                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.nameProcess}{" "}
                                                                <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                disabled
                                                                name="processorName"
                                                                value={data.dyeing?.processor_name || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.nameProcess
                                                                }
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.common?.address}{" "}
                                                                <span className="text-red-500">*</span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                name="address"
                                                                disabled
                                                                value={data.dyeing?.dyeing_address || ""}
                                                                placeholder={translations?.common?.address}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.dyeingName}{" "}
                                                                <span className="text-red-500">*</span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                name="nameProcess"
                                                                disabled
                                                                value={data.dyeing?.process_name || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.dyeingName
                                                                }
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-sm font-medium text-gray-700"></label>
                                                            <input
                                                                type="text"
                                                                name="yarnDelivery1"
                                                                disabled
                                                                value={data.total_fabric_weight || 0}
                                                                onChange={(e) => handleChange("yarnDelivery1", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                readOnly
                                                            />
                                                        </div>

                                                        <div className="col-6 mt-4">
                                                            <label className="text-gray-500 text-[12px] font-medium">
                                                                {translations?.knitterInterface?.processloss}{" "}
                                                                <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="processLoss"
                                                                disabled
                                                                value={data.dyeing?.process_loss || ""}
                                                                placeholder={
                                                                    translations?.knitterInterface?.processloss
                                                                }
                                                                onChange={(e) => handleChange("processLoss", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            />

                                                        </div>

                                                        <div className="col-6 mt-4 mb-5">
                                                            <label className="text-sm font-medium text-gray-700"></label>
                                                            <input
                                                                type="text"
                                                                name="yarnDeliveryFinal"
                                                                value={data?.dyeing?.net_yarn || ""}
                                                                onChange={(e) => handleChange("yarnDeliveryFinal", e.target.value)}
                                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <hr className="mt-5 mb-5" />
                                <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
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
                                        {translations?.common?.submit}
                                    </button>
                                    <button
                                        className="btn-outline-purple"
                                        onClick={() => {
                                            router.push("/knitter/process");
                                            sessionStorage.removeItem("knitterProcess");
                                            sessionStorage.removeItem("selectedProcess");
                                        }}
                                    >
                                        {translations?.common?.cancel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
