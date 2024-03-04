"use client";
import React, { useState, useEffect } from "react";
import Link from "@components/core/nav-link";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "@lib/router-events";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toasterSuccess } from "@components/core/Toaster";
import User from "@lib/User";
import { GrAttachment } from "react-icons/gr";
import useTranslations from "@hooks/useTranslation";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";


export default function page() {
    const { translations, loading } = useTranslations();
    useTitle("Edit Sale");

    const [roleLoading, hasAccess] = useRole();
    const router = useRouter();
    const [Access, setAccess] = useState<any>({});
    const [data, setData] = useState<any>([])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const knitterId = User.knitterId;

    const [formData, setFormData] = useState<any>({
        knitterId: "",
        seasonId: null,
        date: new Date().toISOString(),
        programId: null,
        fabricId: "",
        traderId: null,
        buyerType: "",
        transactionViaTrader: false,
        tcFiles: null,
        contractFile: null,
        invoiceFile: [],
        deliveryNotes: null,
        quantChooseYarn: "",
        processorName: "",
        processName: "",
        processorNameBuyer: "",
        addressNewBuyer: "",
        buyerId: null,
        transporterName: "",
        billOfLadding: "",
        vehicleNo: "",
        agentDetails: "",
        batchLotNo: "",
        invoiceNo: "",
        brandorderRef: "",
        garmentOrder: "",
        noOfRolls: null,
        totalYarnQty: "",
        totalFabricWeight: "",
        fabricType: [],
    });

    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
            const access = checkAccess("Knitter Sale");
            if (access) setAccess(access);
        }
    }, [roleLoading, hasAccess]);

    useEffect(() => {
        if (knitterId) {
            fetchSales()
        }
    }, [knitterId])

    const fetchSales = async () => {
        try {
            const response = await API.get(
                `knitter-process?knitterId=${knitterId}`
            );
            if (response.success) {
                const { invoice_file, contract_file, delivery_notes, tc_file, ...restData } = response.data[9];
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
        const newErrors = {} as Partial<any>;
        const regexAlphaNumeric = /^[()\-_a-zA-Z0-9 ]*$/;

        if (!formData.invoiceNo) {
            newErrors.invoiceNo = "Invoice Number is Required";
        }
        if (formData.invoiceNo) {
            if (regexAlphaNumeric.test(formData.invoiceNo) === false) {
                newErrors.invoiceNo =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.invoiceNo && errors.invoiceNo) {
                newErrors.invoiceNo = errors.invoiceNo;
            }
        }

        if (!formData.vehicleNo) {
            newErrors.vehicleNo = "Vehicle Number is Required";
        }
        if (formData.vehicleNo) {
            if (regexAlphaNumeric.test(formData.vehicleNo) === false) {
                newErrors.vehicleNo =
                    "Accepts only AlphaNumeric values and special characters like _,-,()";
            }
            if (formData.vehicleNo && errors.vehicleNo) {
                newErrors.vehicleNo = errors.vehicleNo;
            }
        }

        if (!formData.batchLotNo) {
            newErrors.batchLotNo = "Batch/Lot No is Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);

            const url = "knitter-process";
            const mainFormData = {
                knitterId: knitterId,
                date: formData.date,
                programId: Number(formData.programId),
                seasonId: Number(formData.seasonId),
                garmentOrderRef: formData.garmentOrder,
                brandOrderRef: formData.brandorderRef,
                buyerType: formData.buyerType,
                buyerId:
                    formData.buyerType === "Garment" ? Number(formData?.buyerId?.value) : null,
                fabricId: Number(formData?.fabricId?.value),
                processorName: formData.processorNameBuyer,
                processorAddress: formData.addressNewBuyer,
                totalYarnQty: formData.totalYarnQty,
                transactionViaTrader: formData.transactionViaTrader,
                transactionAgent: formData.agentDetails,
                batchLotNo: formData.batchLotNo,
                invoiceNo: formData.invoiceNo,
                billOfLadding: formData.billOfLadding,
                transporterName: formData.transporterName,
                vehicleNo: formData.vehicleNo,
                tcFiles: formData.tcFiles,
                contractFile: formData.contractFile,
                invoiceFile: formData.invoiceFile,
                deliveryNotes: formData.deliveryNotes,
                // chooseFabric: chooseyarnData,
                noOfRolls: formData.noOfRolls,
                fabricType: formData.fabricType,

            };
            const mainResponse = await API.post(url, mainFormData);
            if (mainResponse.success) {
                toasterSuccess(
                    "Sales Edited Successfully",
                    3000,
                    mainFormData.knitterId
                );
                router.push("/knitter/sale");
                sessionStorage.removeItem("knitterSales");
                sessionStorage.removeItem("selectedSales");
                sessionStorage.removeItem("fileName");

            }
        } else {
            setIsSubmitting(false);
        }
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
                                        <Link href="/knitter/sale">
                                            {translations?.knitterInterface?.sale}
                                        </Link>
                                    </li>
                                    <li>Edit Sale</li>
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
                                                {translations?.transactions?.date}{" "}
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
                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.Quantity}
                                            </label>
                                            <input
                                                name="quantChooseYarn"
                                                value={data?.qty_stock + " Kgs"}
                                                type="text"
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                readOnly
                                            />
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
                                                Fabric Type Name
                                            </label>
                                            <input
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                type="text"
                                                disabled
                                                placeholder="Fabric Type Name"
                                            // value={fabricTypeName}
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

                                        <div className="col-12 col-sm-6 mt-4">
                                            <label className="text-gray-500 text-[12px] font-medium">
                                                {translations?.knitterInterface?.FinishedBatch}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                disabled
                                                value={data.batch_lot_no || ""}
                                                type="text"
                                                placeholder={
                                                    translations?.knitterInterface?.FinishedBatch
                                                }
                                                readOnly
                                                className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                            />
                                        </div>

                                        <hr className="mt-4" />
                                        <div className="mt-4">
                                            <h4 className="text-md font-semibold">
                                                OTHER INFORMATION:
                                            </h4>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.invoiceNumber}{" "}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="invoiceNo"
                                                        value={formData.invoiceNo}
                                                        onChange={(e) => handleChange("invoiceNo", e.target.value)}
                                                        onBlur={(e) => onBlur(e, "bill")}
                                                        type="text"
                                                        placeholder={translations?.common?.invoiceNumber}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />
                                                    {errors.invoiceNo && (
                                                        <p className="text-red-500  text-sm mt-1">
                                                            {errors.invoiceNo}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="col-12 col-sm-6  mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.billofladding}{" "}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        value={data.bill_of_ladding || ""}
                                                        type="text"
                                                        disabled
                                                        placeholder={translations?.common?.billofladding}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />

                                                </div>

                                                <div className="col-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.common?.TransportName}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        value={data.transporter_name || ""}
                                                        disabled
                                                        placeholder={translations?.common?.TransportName}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                                                    />

                                                </div>
                                                <div className="col-6 mt-4">
                                                    <label className="text-gray-500 text-[12px] font-medium">
                                                        {translations?.transactions?.vehicleNo}{" "}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="vehicleNo"
                                                        value={formData.vehicleNo}
                                                        onChange={(e) => handleChange("vehicleNo", e.target.value)}
                                                        type="text"
                                                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                                                        placeholder={translations?.transactions?.vehicleNo}
                                                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
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
                                    </div>
                                </div>

                                <div>
                                    <hr className="mt-4 mb-5" />
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
                                                router.push("/knitter/sale");
                                                sessionStorage.removeItem("knitterSales");
                                                sessionStorage.removeItem("selectedSales");
                                                sessionStorage.removeItem("fileName");
                                            }}
                                        >
                                            {translations?.common?.cancel}
                                        </button>
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
