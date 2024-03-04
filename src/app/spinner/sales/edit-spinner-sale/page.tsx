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
import useTranslations from "@hooks/useTranslation";

export default function page() {
    const { translations, loading } = useTranslations();

    useTitle("Edit Sale");
    const [roleLoading, hasAccesss] = useRole();
    const spinnerId = User.spinnerId;
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});
    const [from, setFrom] = useState<Date | null>(new Date());
    const [buyerOptions, setBuyerOptions] = useState<any>();
    const [data, setData] = useState<any>([])

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
        invoice_file: [],
    });

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!roleLoading && hasAccesss?.processor?.includes("Spinner")) {
            const access = checkAccess("Spinner Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccesss]);

    useEffect(() => {
        if (spinnerId) {
            fetchSales()
        }
    }, [spinnerId])


    const fetchSales = async () => {
        try {
            const response = await API.get(
                `spinner-process/sales?spinnerId=${spinnerId}`
            );
            if (response.success) {
                const { invoice_file, contract_file, delivery_notes, tc_file, ...restData } = response.data[0];
                const getFileId = (path: any) => (path && path.split("file/")[1]);
                setData({
                    ...restData,
                    contract_file: getFileId(contract_file),
                    delivery_notes: getFileId(delivery_notes),
                    invoice_file: invoice_file.map((url: any) => url.split('/').pop()),
                    tc_file: getFileId(tc_file),
                });
            }
        } catch (error) {
            console.error(error);
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
        if (name === "invoice_file") {
            let filesLink: any = [...formData.invoice_file];
            let filesName: any = [...data.invoice_file];

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
            setData((prevFile: any) => ({
                ...prevFile,
                invoice_file: filesName,
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
                    setData((prevFile: any) => ({
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
                name === "invoice_file" ||
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
        "invoice_file",
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
                    return value === null ? "No of Boxes are required" : errors.noOfBoxes != "" ? errors.noOfBoxes : "";
                case "boxIds":
                    return value.trim() === "" ? "Box Id is required" : errors.boxIds != "" ? errors.boxIds : "";
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
                    return formData.buyerType === "Mapped" && value?.value === null || !value?.value
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
                case "invoice_file":
                    return (formData.invoice_file.length === 0 && data.invoice_file.length === 0)
                        ? "Invoice File is required"
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
                const response = await API.post("spinner-process/sales", formData);
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

    const removeImage = (index: any) => {
        let filename = data.invoice_file;
        let fileNavLink = formData.invoice_file;
        let arr1 = filename.filter((element: any, i: number) => index !== i);
        let arr2 = fileNavLink.filter((element: any, i: number) => index !== i);
        setData((prevData: any) => ({
            ...prevData,
            invoice_file: arr1,
        }));
        setFormData((prevData: any) => ({
            ...prevData,
            invoice_file: arr2,
        }));
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
                                <li>Edit Sale</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-md p-4">
                            <div className="w-100 mt-4">
                                <div className="customFormSet">
                                    <div className="w-100">
                                        <div className="row">
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
                                                        {data?.program?.program_name}

                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-12 col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Order Reference
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    value={data.order_ref || ""}
                                                    onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                    type="text"
                                                    disabled
                                                    placeholder="Order Reference"
                                                />

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
                                                                checked={data.buyer_type === "Mapped"}
                                                                value="Mapped"
                                                                disabled
                                                            />
                                                            <span></span>
                                                        </section>{" "}
                                                        Mapped
                                                    </label>
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                checked={data.buyer_type === "New Buyer"}
                                                                value="New Buyer"
                                                                disabled
                                                            />
                                                            <span></span>
                                                        </section>{" "}
                                                        New Buyer
                                                    </label>
                                                </div>

                                            </div>
                                            {data.buyer_type === "Mapped" ? (
                                                <>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Weaver/Knitter <span className="text-red-500">*</span>
                                                        </label>

                                                        <Select
                                                            name="buyerOption"
                                                            value={{ label: data.weaver?.name ? data.weaver?.name : data.knitter?.name, value: data.weaver?.name ? data.weaver?.name : data.knitter?.name }}
                                                            menuShouldScrollIntoView={false}
                                                            isClearable
                                                            placeholder="Select Weaver/Knitter"
                                                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"

                                                        />

                                                    </div>
                                                </>
                                            ) : data.buyer_type === "New Buyer" ? (
                                                <>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Processor Name <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            value={data.processor_name || ""}
                                                            type="text"
                                                            placeholder="Processor Name"
                                                            disabled
                                                        />

                                                    </div>
                                                    <div className="col-12 col-sm-6  mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            Address <span className="text-red-500">*</span>
                                                        </label>
                                                        <textarea
                                                            className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                            name="processorAddress"
                                                            value={data.processor_address || ""}
                                                            placeholder="Address"
                                                            rows={3}
                                                            disabled

                                                        />

                                                    </div>
                                                </>
                                            ) : (
                                                ""
                                            )}
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.transactionViatrader}{" "}
                                                </label>
                                                <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                                    <label className="mt-1 d-flex mr-4 align-items-center">
                                                        <section>
                                                            <input
                                                                type="radio"
                                                                disabled
                                                                name="transactionViaTrader"
                                                                checked={data.transaction_via_trader === true}
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
                                                                disabled
                                                                name="transactionViaTrader"
                                                                checked={data.transaction_via_trader === false}
                                                                className="form-radio"
                                                            />
                                                            <span></span>
                                                        </section>
                                                        No
                                                    </label>
                                                </div>
                                            </div>
                                            {data.transaction_via_trader === true && (
                                                <div className="col-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.agentDetails}{" "}
                                                    </label>
                                                    <textarea
                                                        value={data.transaction_agent}
                                                        disabled
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        placeholder={translations?.common?.agentDetails}
                                                        rows={3}
                                                    />

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
                                                    value={data.total_qty || ""}
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
                                                    value={data?.yarncount?.yarnCount_name || ""}
                                                />
                                            </div>

                                            <div className="col-12 col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    No of Boxes/Cartons <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
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
                                            {data?.program?.program_name === "REEL" &&
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        REEL Lot No
                                                    </label>
                                                    <input
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        type="text"
                                                        disabled
                                                        placeholder="REEL Lot No"
                                                        value={data.reel_lot_no || ""}
                                                    />
                                                </div>
                                            }

                                            <div className="col-12 col-sm-6  mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    Box ID <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    type="text"
                                                    placeholder="Box ID"
                                                    value={data.box_ids || ""}
                                                    disabled
                                                />

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
                                                        value={data.invoice_no || ""}
                                                        onBlur={(e) => onBlur(e, "billNumbers")}
                                                        type="text"
                                                        disabled
                                                        placeholder="Invoice No *"
                                                    />

                                                </div>
                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        LR/BL No <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        value={data.bill_of_ladding || ""}
                                                        type="text"
                                                        disabled
                                                        placeholder="Bill Of Ladding"
                                                    />

                                                </div>
                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        Transporter Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                        value={data.transporter_name || ""}
                                                        type="text"
                                                        disabled
                                                        placeholder="Transporter Name"
                                                    />

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
                                                                disabled
                                                            />
                                                        </label>
                                                    </div>
                                                    <p className="py-2 text-sm">
                                                        (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                    </p>
                                                    {data.quality_doc && (
                                                        <div className="flex text-sm mt-1">
                                                            <GrAttachment />
                                                            <p className="mx-1">{data.quality_doc}</p>
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="row">
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.uploadtc}
                                                        </label>
                                                        <div className="inputFile">
                                                            <label>
                                                                {translations?.knitterInterface?.ChooseFile}{" "}
                                                                <GrAttachment />
                                                                <input
                                                                    name="tcFiles"
                                                                    type="file"
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="py-2 text-sm">
                                                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                        </p>
                                                        {data.tc_file && (
                                                            <div className="flex text-sm mt-1">
                                                                <GrAttachment />
                                                                <p className="mx-1">{data.tc_file}</p>
                                                            </div>
                                                        )}

                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.ContractFiles}
                                                        </label>
                                                        <div className="inputFile">
                                                            <label>
                                                                {translations?.knitterInterface?.ChooseFile}
                                                                <GrAttachment />
                                                                <input
                                                                    name="contractFile"
                                                                    type="file"
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="py-2 text-sm">
                                                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                        </p>
                                                        {data.contract_file && (
                                                            <div className="flex text-sm mt-1">
                                                                <GrAttachment />
                                                                <p className="mx-1">{data.contract_file}</p>
                                                            </div>
                                                        )}

                                                    </div>

                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.invoice}  <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="inputFile">
                                                            <label>
                                                                {translations?.knitterInterface?.ChooseFile}
                                                                <GrAttachment />
                                                                <input
                                                                    name="invoice_file"
                                                                    type="file"
                                                                    multiple
                                                                    accept=".pdf,.zip, image/jpg, image/jpeg"
                                                                    onChange={(e) => handleChange("invoice_file", e?.target?.files)}
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="py-2 text-sm">
                                                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                        </p>

                                                        {data.invoice_file &&
                                                            data.invoice_file.map((item: any, index: any) => (
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
                                                        {errors?.invoice_file !== "" && (
                                                            <div className="text-sm text-red-500">
                                                                {errors.invoice_file}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-12 col-sm-6 mt-4">
                                                        <label className="text-gray-500 text-[12px] font-medium">
                                                            {translations?.common?.DeliveryNotes}
                                                        </label>
                                                        <div className="inputFile">
                                                            <label>
                                                                {translations?.knitterInterface?.ChooseFile}{" "}
                                                                <GrAttachment />
                                                                <input
                                                                    name="deliveryNotes"
                                                                    type="file"
                                                                />
                                                            </label>
                                                        </div>
                                                        <p className="py-2 text-sm">
                                                            (Max: 5MB) (Format: jpg/jpeg/pdf/zip)
                                                        </p>
                                                        {data.delivery_notes && (
                                                            <div className="flex text-sm mt-1">
                                                                <GrAttachment />
                                                                <p className="mx-1">{data.delivery_notes}</p>
                                                            </div>
                                                        )}

                                                    </div>
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
