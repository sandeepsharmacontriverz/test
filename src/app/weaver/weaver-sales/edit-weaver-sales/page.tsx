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
import { GrAttachment } from "react-icons/gr";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";
import useTranslations from "@hooks/useTranslation";

export default function page() {
    const { translations, loading } = useTranslations();

    useTitle("Edit Sales");
    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});

    const [chooseFabric, setChooseFabric] = useState<any>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<any>([])

    const [formData, setFormData] = useState<any>({
        date: new Date(),
        programId: null,
        seasonId: null,
        garmentOrderRef: "",
        brandOrderRef: "",
        buyerType: "",
        buyerId: null,
        fabricId: null,
        processorName: "",
        processorAddress: "",
        totalYarnQty: 0,
        transactionViaTrader: null,
        transactionAgent: "",
        batchLotNo: "",
        invoiceNo: "",
        billOfLadding: "",
        transporterName: "",
        vehicleNo: "",
        tcFiles: null,
        contractFile: null,
        invoiceFile: [],
        deliveryNotes: null,
        noOfRolls: null,
        fabricType: [],
        totalFabricLength: 0
    });

    const [errors, setErrors] = useState<any>({});

    const weaverId = User.weaverId;


    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Weaver")) {
            const access = checkAccess("Weaver Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);


    useEffect(() => {
        if (weaverId) {
            fetchProcess()
        }
    }, [weaverId])

    const fetchProcess = async () => {
        try {
            const response = await API.get(
                `weaver-process?weaverId=${weaverId}`
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


    const handleChange = (name?: any, value?: any, event?: any) => {

        setFormData((prevData: any) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prev: any) => ({
            ...prev,
            [name]: "",
        }));
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
    };

    const requiredWeaverFields = [
        "seasonId",
        "date",
        "programId",
        "buyerType",
        "buyerId",
        "fabricId",
        "transactionAgent",
        "processorAddress",
        "processorName",
        "transactionViaTrader",
        "batchLotNo",
        "invoiceNo",
        "billOfLadding",
        "transporterName",
        "vehicleNo",
        "invoiceFile"
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

        if (requiredWeaverFields.includes(name)) {
            switch (name) {

                case "batchLotNo":
                    return value.trim() === ""
                        ? "Batch/Lot No is required"
                        : value.length > 20
                            ? "Value should not exceed 20 characters"
                            : "";

                case "invoiceNo":
                    return value.trim() === ""
                        ? "Invoice No is required"
                        : regexBillNumbers.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,.,,/,_-,()"
                            : "";

                case "vehicleNo":
                    return value.trim() === ""
                        ? "Vehicle No is required"
                        : regexAlphaNumeric.test(value) === false
                            ? "Accepts only AlphaNumeric values and special characters like _,-,()"
                            : "";


                default:
                    return "";
            }
        }
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        const newWeaverErrors: any = {};

        Object.keys(formData).forEach((fieldName: string) => {
            newWeaverErrors[fieldName] = validateField(
                fieldName,
                formData[fieldName as keyof any],
                "weaver"
            );
        });

        const hasWeaversErrors = Object.values(newWeaverErrors).some(
            (error) => !!error
        );

        if (hasWeaversErrors) {
            setErrors(newWeaverErrors);
        }
        if (!chooseFabric) {
            setErrors((prev: any) => ({
                ...prev,
                totalYarnQty: "Choose Fabric is Required",
            }));
            return;
        }

        if (!hasWeaversErrors) {
            try {
                setIsSubmitting(true);
                const response = await API.post("weaver-process", {
                    ...formData,
                    weaverId: weaverId,
                    chooseFabric: chooseFabric,
                });
                if (response.success) {
                    toasterSuccess("Sales created successfully");
                    sessionStorage.removeItem("salesData");
                    sessionStorage.removeItem("chooseFabric");
                    router.push(
                        `/weaver/weaver-sales/transaction-summary?id=${response.data.weaverSales.id}`
                    );
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
                                    <Link href="/weaver/weaver-sales" className="active">
                                        Sale
                                    </Link>
                                </li>
                                <li>Edit Sale</li>
                            </ul>
                        </div>
                    </div>
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
                                    <div className=" col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Date
                                        </label>
                                        <DatePicker
                                            selected={data?.date && new Date(data?.date?.substring(0, 10))}
                                            dateFormat="dd-MM-yyyy"
                                            disabled
                                            onChange={() => { }}
                                            showYearDropdown
                                            className="datePickerBreak w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
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
                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Quantity in Mts
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            name="totalYarnQty"
                                            value={`${formData.totalFabricLength} Mts` || `0 Mts`}
                                            onChange={(event) => handleChange(event)}
                                            type="text"
                                            disabled
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

                                    <div className="col-12 col-sm-6  mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            Fabric Type Name
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            disabled
                                            placeholder="Fabric Type Name"
                                            name="fabricTypeName"
                                            // value={fabricTypeName}
                                            onChange={(event) => handleChange(event)}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-6 mt-4">
                                        <label className="text-gray-500 text-[12px] font-medium">
                                            {translations?.knitterInterface?.ChooseBuyer}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        name="buyerType"
                                                        readOnly
                                                        value="Garment"
                                                        checked={data.buyer_type === "Garment"}
                                                    />
                                                    <span></span>
                                                </section>
                                                {translations?.knitterInterface?.Garment}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        name="buyerType"
                                                        readOnly
                                                        checked={data.buyer_type === "Dyeing"}
                                                        value="Dyeing"
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                {translations?.knitterInterface?.Dying}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        name="buyerType"
                                                        checked={data.buyer_type === "Washing"}
                                                        value="Washing"
                                                        readOnly
                                                    />
                                                    <span></span>
                                                </section>{" "}
                                                {translations?.knitterInterface?.Washing}
                                            </label>
                                            <label className="mt-1 d-flex mr-4 align-items-center">
                                                <section>
                                                    <input
                                                        type="radio"
                                                        name="buyerType"
                                                        value="New Buyer"
                                                        checked={data.buyer_type === "New Buyer"}
                                                        readOnly
                                                    />
                                                    <span></span>
                                                </section>
                                                {translations?.knitterInterface?.newbuyer}
                                            </label>
                                        </div>

                                    </div>
                                    {data.buyer_type === "Garment" ? (
                                        <>
                                            <div className=" col-12 col-sm-6 mt-4 ">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.SelectGarment}{" "}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={{ label: data.buyer?.name, value: data.buyer?.name }}
                                                    name="buyerId"
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectGarment}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "New Buyer" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.ProcessorName}
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={data.processor_name || ""}
                                                    placeholder={translations?.common?.ProcessorName}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.common?.address}{" "}
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    value={data.processor_address}
                                                    placeholder={translations?.common?.address}
                                                    className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "Dyeing" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.Dying}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={{ label: data.dyingwashing?.name, value: data.dyingwashing?.name }}
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectDying}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                                                />
                                            </div>
                                        </>
                                    ) : data.buyer_type === "Washing" ? (
                                        <>
                                            <div className="col-12 col-sm-6 mt-4">
                                                <label className="text-gray-500 text-[12px] font-medium">
                                                    {translations?.knitterInterface?.Washing}
                                                </label>
                                                <Select
                                                    isDisabled
                                                    value={{ label: data.dyingwashing?.name, value: data.dyingwashing?.name }}
                                                    menuShouldScrollIntoView={false}
                                                    isClearable
                                                    placeholder={translations?.common?.SelectWashing}
                                                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
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
                                            Finished Batch/Lot No
                                        </label>
                                        <input
                                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            type="text"
                                            placeholder="Batch/Lot No"
                                            name="batchLotNo"
                                            value={formData.batchLotNo || ""}
                                            onChange={(event) => handleChange("batchLotNo", event.target.value)}
                                        />
                                        {errors.batchLotNo && (
                                            <p className="text-red-500  text-sm mt-1">
                                                {errors.batchLotNo}
                                            </p>
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
                                                onChange={(event) => handleChange("invoiceNo", event.target.value)}
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
                                                LR/BL No
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="billOfLadding"
                                                value={formData.billOfLadding || ""}
                                                disabled
                                                onChange={(event) => handleChange(event)}
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
                                                Transporter Name
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                name="transporterName"
                                                value={formData.transporterName || ""}
                                                onChange={(event) => handleChange(event)}
                                                onBlur={(e) => onBlur(e, "alphabets")}
                                                type="text"
                                                disabled
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
                                                onChange={(event) => handleChange("vehicleNo", event.target.value)}
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
                                                {translations?.common?.invoice}
                                            </label>
                                            <div className="inputFile">
                                                <label>
                                                    {translations?.knitterInterface?.ChooseFile}
                                                    <GrAttachment />
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

                                            {data.invoice_file &&
                                                data.invoice_file.map((item: any, index: any) => (
                                                    <div className="flex text-sm mt-1" key={index}>
                                                        <GrAttachment />
                                                        <p className="mx-1">{item}</p>

                                                    </div>
                                                ))}
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
                                                router.push("/weaver/weaver-sales");
                                                sessionStorage.removeItem("salesData");
                                                sessionStorage.removeItem("chooseFabric");
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
            </div>
        );
    }
}
