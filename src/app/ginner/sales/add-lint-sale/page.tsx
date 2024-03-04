"use client";
import React, { useState, useEffect } from "react";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@lib/Api";

import { toasterSuccess } from "@components/core/Toaster";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Select, { GroupBase } from "react-select";

interface FormData {
  ginnerId: any;
  seasonId: any;
  date: string;
  programId: string | number | null;
  chooseBale: string;
  noofBales: string;
  choosenBale: string;
  totalQuantity: string;
  lotNo: string;
  buyer: string;
  shippingAdress: string;
  transaction: boolean | null | string;
  candyRate: string;
  Rate: string;
  DispatchFrom: string;
  agentDetails: string;
  reel_lot_no: string;
  pressNo: string;
  bales: string;
  button: string;
}

export default function page() {
  useTitle(" Add Lint Sale");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [isSelected, setIsSelected] = useState<any>(true);
  const [startDates, setStartDates] = useState<any>(new Date());
  const [errors, setErrors] = useState<any>({});
  const [season, setSeason] = useState<any>([]);
  const [program, setProgram] = useState([]);
  const [spinners, setSpinners] = useState<any>([]);

  const ginnerId = User.ginnerId;

  const [formData, setFormData] = useState<FormData>({
    ginnerId: ginnerId,
    seasonId: null,
    date: new Date().toISOString().split("T")[0],
    programId: "",
    chooseBale: "",
    noofBales: "",
    choosenBale: "",
    totalQuantity: "",
    lotNo: "",
    buyer: "",
    shippingAdress: "",
    transaction: false,
    candyRate: "",
    Rate: "",
    DispatchFrom: "",
    agentDetails: "",
    reel_lot_no: "",
    pressNo: "",
    bales: "",
    button: "",
  });

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Ginner")) {
      const access = checkAccess("Ginner Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    if (ginnerId) {
      getSpinners();
      getProgram();
    }
  }, [ginnerId]);

  useEffect(() => {
    getSeason();
  }, []);

  useEffect(() => {
    if (formData.totalQuantity) {
      setIsSelected(false);
    }
  }, [formData.totalQuantity]);

  const getSpinners = async () => {
    try {
      const res = await API.get(
        `ginner-process/get-spinner?ginnerId=${ginnerId}`
      );
      if (res.success) {
        setSpinners(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const savedData: any = sessionStorage.getItem("ginnerSales");
    const processData = JSON.parse(savedData);
    if (processData) {
      setFormData(processData);
    }

    const selectedBales = sessionStorage.getItem("selectedBales");

    if (selectedBales) {
      const parsedData = JSON.parse(selectedBales);

      const balesData = parsedData.map((el: any) => el.bales).flat();

      const uniqueLotNos: any = {};
      const uniqueReelLotNos: any = {};
      const uniquePressNos: any = {};

      const filteredLotNos = balesData.reduce((result: any, bale: any) => {
        if (!uniqueLotNos[bale.process_id]) {
          uniqueLotNos[bale.process_id] = true;
          result.push(bale.lot_no);
        }
        return result;
      }, []);

      const filteredReelLotNos = balesData.reduce((result: any, bale: any) => {
        if (!uniqueReelLotNos[bale.process_id]) {
          uniqueReelLotNos[bale.process_id] = true;
          result.push(bale.reel_lot_no);
        }
        return result;
      }, []);

      const filteredPressNos = balesData.reduce((result: any, bale: any) => {
        if (!uniquePressNos[bale.process_id]) {
          let abc = balesData.filter(
            (obj: any) => obj.process_id == bale.process_id
          );
          let a = abc.reduce(
            (min: any, p: any) => (p.baleNo < min ? p.baleNo : min),
            abc[0].baleNo
          );
          let b = abc.reduce(
            (max: any, p: any) => (p.baleNo > max ? p.baleNo : max),
            abc[0].baleNo
          );

          uniquePressNos[bale.process_id] = true;
          if (a == b) {
            result.push(a);
          } else {
            result.push(`${a}-${b}`);
          }
        }
        return result;
      }, []);

      const lotNodata = filteredLotNos.join(", ");
      const reel_lot_no = filteredReelLotNos.join(", ");
      const pressNo = filteredPressNos.join(", ");
      const weights = balesData.map((bale: any) => Number(bale.weight))
      const baleID = balesData.map((bale: any) => Number(bale.baleId));
      const totalWeight = weights.reduce(
        (total: any, weight: any) => total + weight,
        0
      );

      const totalBaleLength = balesData.length;

      if (parsedData.length > 0) {
        setFormData((prevFormFields) => ({
          ...prevFormFields,
          lotNo: String(lotNodata),
          reel_lot_no: reel_lot_no,
          pressNo: pressNo,
          totalQuantity: totalWeight,
          choosenBale: totalWeight,
          noofBales: totalBaleLength,
          bales: baleID,
        }));
      }
    }
  }, []);

  const getSeason = async () => {
    try {
      const res = await API.get("season");
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

  const handleDate = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setFormData((prevFormFields: any) => ({
        ...prevFormFields,
        date: formattedDate,
      }));
      setStartDates(date);
    }
  };

  const validateForm = () => {
    const regexAlphaNumeric = /^[().,\-/_a-zA-Z0-9 ]*$/;
    const newErrors = {} as Partial<FormData>;
    if (!formData.seasonId || formData.seasonId === undefined) {
      newErrors.seasonId = "Season is Required";
    }
    if (!formData.programId) {
      newErrors.programId = "Select Program is Required";
    }
    if (!formData.date) {
      newErrors.date = "Date is Required";
    }
    if (!formData.buyer) {
      newErrors.buyer = "Buyer is Required";
    }
    if (!formData.shippingAdress) {
      newErrors.shippingAdress = "Shipping Address is Required";
    }
    if (!formData.DispatchFrom) {
      newErrors.DispatchFrom = "Dispatch From is Required";
    }
    if (!formData.Rate) {
      newErrors.Rate = "Rate/KG is Required";
    }
    if (!formData.candyRate) {
      newErrors.candyRate = "Candy Rate is Required";
    }
    else if (formData.candyRate && formData.candyRate.length > 13) {
      newErrors.candyRate = "Candy Rate Should not Exceed 10 Digits"
    }
    if (formData.transaction === true && !formData.agentDetails) {
      newErrors.agentDetails = "Agent Details is Required";
    }

    if (formData.DispatchFrom) {
      const valid = regexAlphaNumeric.test(formData.DispatchFrom);
      if (!valid) {
        newErrors.DispatchFrom =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
    }
    if (formData.shippingAdress) {
      const valid = regexAlphaNumeric.test(formData.shippingAdress);
      if (!valid) {
        newErrors.shippingAdress =
          "Accepts only AlphaNumeric values and special characters like _,-,()";
      }
    }

    if (formData.Rate) {
      if (Number(formData.Rate) <= 0) {
        newErrors.Rate = "Value Should be more than 0";
      }
    }
    if (formData.candyRate) {
      if (Number(formData.candyRate) <= 0) {
        newErrors.candyRate = "Value Should be more than 0";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const mainFormData = {
      ginnerId: ginnerId,
      programId: Number(formData.programId),
      seasonId: Number(formData.seasonId),
      date: formData.date,
      totalQty: Number(formData.totalQuantity),
      noOfBales: Number(formData.noofBales),
      choosenBale: Number(formData.choosenBale),
      lotNo: formData.lotNo,
      buyer: Number(formData.buyer),
      shippingAddress: formData.shippingAdress,
      transactionViaTrader: formData.transaction,
      candyRate: Number(formData.candyRate),
      rate: Number(formData.Rate),
      reelLotNno: formData.reel_lot_no,
      despatchFrom: formData.DispatchFrom,
      bales: formData.bales,
      pressNo: formData.pressNo,
      transactionAgent: formData.agentDetails,
    };

    if (validateForm()) {
      setIsSelected(true);
      const url = "ginner-process/sales";
      const mainResponse = await API.post(url, mainFormData);

      if (mainResponse.success) {
        toasterSuccess("Record added successfully", 3000, ginnerId);
        router.push("/ginner/sales");
        sessionStorage.removeItem("ginnerSales");
        sessionStorage.removeItem("selectedBales");
      }
    } else {
      setIsSelected(false);
    }
  };
  const handleChange = (name?: any, value?: any, event?: any) => {
    if (name === "programId" || name === "seasonId") {
      setFormData((prevData: any) => ({
        ...prevData,
        [name]: Number(value),
      }));
    }
    else if (name === "transaction") {
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        [name]: value === "Yes" ? true : false,
        agentDetails: value === "No" ? "" : prevFormData.agentDetails,

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
  const handleChooseBaleClick = () => {
    if (!formData.programId) {
      setErrors((prev: any) => ({
        ...prev,
        programId: "Select a program to choose bale",
      }));
    } else {
      sessionStorage.setItem("ginnerSales", JSON.stringify(formData));
      router.push(`/ginner/sales/choose-bale?id=${formData.programId}`);
    }
  };

  const onCancel = () => {
    router.push("/ginner/sales");
    sessionStorage.removeItem("ginnerSales");
    sessionStorage.removeItem("selectedBales");
  };

  const onBlur = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexAlphaNumeric = /^[().,\-/_a-zA-Z0-9 ]*$/;

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
    }

    if (value != "" && type == "alphaNumeric") {
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
  };

  if (loading || roleLoading) {
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
                <li className="active">
                  <Link href="/ginner/dashboard">
                    <span className="icon-home"></span>{" "}
                  </Link>
                </li>
                <Link href="/ginner/dashboard"></Link>
                <li>
                  <Link href="/ginner/sales">Sale</Link>
                </li>
                <li>New Sale</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100 ">
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6">
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

                  <div className="col-12 col-sm-6 ">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={startDates}
                      dateFormat={"dd-MM-yyyy"}
                      onChange={handleDate}
                      showYearDropdown
                      maxDate={new Date()}
                      placeholderText={translations?.common?.from + "*"}
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                    {errors.date && (
                      <p className="text-red-500  text-sm mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>
                  {Number(formData?.noofBales) <= 0 && (
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
                      Choose Bale <span className="text-red-500">*</span>
                    </label>
                    <button
                      name="chooseBale"
                      type="button"
                      onClick={handleChooseBaleClick}
                      className="bg-orange-400 flex text-sm rounded text-white px-3 py-1.5"
                    >
                      Choose Bale
                    </button>
                  </div>

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      No of Bales
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="noofBales"
                      value={formData.noofBales || 0}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Chosen Bale <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="choosenBale"
                      value={formData.choosenBale || 0}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Quantity(Kg/MT){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity || 0}
                      disabled
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Lot No <span className="text-red-500">*</span>
                    </label>

                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="lotNo"
                      value={formData.lotNo || ""}
                      disabled
                      onChange={handleChange}
                    />

                    {errors?.lotNo !== "" && (
                      <div className="text-sm text-red-500">{errors.lotNo}</div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Choose Buyer <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="buyer"
                      menuShouldScrollIntoView={false}
                      isClearable
                      placeholder="Select"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                      options={
                        (spinners || []).map(({ id, name }: any) => ({
                          label: name,
                          value: id,
                        })) as unknown as readonly (
                          | string
                          | GroupBase<string>
                        )[]
                      }
                      onChange={(item: any) =>
                        handleChange("buyer", item?.value)
                      }
                    />
                    {errors?.buyer !== "" && (
                      <div className="text-sm text-red-500">{errors.buyer}</div>
                    )}
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Shipping Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-100 shadow-none rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      name="shippingAdress"
                      value={formData.shippingAdress}
                      onChange={(e) => handleChange("shippingAdress", e.target.value)}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      placeholder="Shipping Address"
                    />
                    {errors?.shippingAdress !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.shippingAdress}
                      </div>
                    )}
                  </div>

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
                            name="transaction"
                            value="Yes"
                            checked={formData.transaction === true}
                            onChange={(e) => handleChange("transaction", e.target.value)}
                          />
                          <span></span>
                        </section>{" "}
                        Yes
                      </label>
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name="transaction"
                            value="No"
                            checked={formData.transaction === false}
                            onChange={(e) => handleChange("transaction", e.target.value)}
                          />
                          <span></span>
                        </section>{" "}
                        No
                      </label>
                      {errors?.transaction !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.transaction}
                        </div>
                      )}
                    </div>
                  </div>
                  {formData.transaction === true && (
                    <div className="col-sm-6  mt-4">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Agent Details <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                        name="agentDetails"
                        value={formData.agentDetails}
                        onBlur={(e) => onBlur(e, "alphaNumeric")}
                        onChange={(e) => handleChange("agentDetails", e.target.value)}
                        placeholder="Agent Details"
                      />
                      {errors?.agentDetails !== "" && (
                        <div className="text-sm text-red-500">
                          {errors.agentDetails}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Candy Rate (local currency) <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="candyRate"
                      value={formData.candyRate}
                      onBlur={(e) => onBlur(e, "numeric")}
                      onChange={(e) => handleChange("candyRate", e.target.value)}
                      placeholder="Candy Rate"
                    />
                    {errors?.candyRate !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.candyRate}
                      </div>
                    )}
                  </div>

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Rate  (local currency) <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      name="Rate"
                      value={formData.Rate}
                      onBlur={(e) => onBlur(e, "numeric")}
                      onChange={(e) => handleChange("Rate", e.target.value)}
                      placeholder="Rate"
                    />
                    {errors?.Rate !== "" && (
                      <div className="text-sm text-red-500">{errors.Rate}</div>
                    )}
                  </div>

                  <div className="col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Dispatch from <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      name="DispatchFrom"
                      value={formData.DispatchFrom}
                      onBlur={(e) => onBlur(e, "alphaNumeric")}
                      onChange={(e) => handleChange("DispatchFrom", e.target.value)}
                      placeholder=" Dispatch From"
                    />
                    {errors?.DispatchFrom !== "" && (
                      <div className="text-sm text-red-500">
                        {errors.DispatchFrom}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                <section>
                  <button
                    className="btn-purple  mr-2"
                    disabled={isSelected}
                    style={
                      isSelected
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSave}
                  >
                    SAVE
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
    );
  }
}
