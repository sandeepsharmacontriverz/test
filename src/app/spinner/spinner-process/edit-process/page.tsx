"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import { useRouter } from "next/navigation";
import API from "@lib/Api";
import { useSearchParams } from "next/navigation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form } from "react-bootstrap";
import moment from "moment";

export default function page() {
  const [roleLoading] = useRole();
  useTitle("Edit Process");
  const searchParams = useSearchParams();
  const id: any = searchParams.get("id");
  const [data, setData] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    processComplete: "",
  });

  const [formData, setFormData] = useState<any>({
    id: id,
    processComplete: null,
  });

  const router = useRouter();

  useEffect(() => {
    getSpinnerProcess();
  }, []);

  const getSpinnerProcess = async () => {
    const url = `spinner-process/get-process?id=${id}`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setFormData((prevData: any) => ({
        ...prevData,
        id: response.data?.id,
      }));
    } catch (error) {
      console.log(error, "error");
    }
  };

  const onChange = async (e: any) => {
    const { name, value } = e.target;
    const res = value === "yes" ? true : false;
    setFormData((prevData: any) => ({
      ...prevData,
      processComplete: res,
    }));
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  const handleSubmit = async () => {
    if (!formData.processComplete) {
      setErrors((prevError) => ({
        ...prevError,
        processComplete: "Please select any one option",
      }));
    } else {
      const url = `spinner-process`;
      setIsSubmitting(true);
      try {
        const response = await API.put(url, formData);
        if (response.success) {
          toasterSuccess("Process Updated Successfully", 3000, formData.id);
          router.push(`/spinner/spinner-process`);
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.log(error, "error");
        toasterError("Failed to update process", 3000, formData.id);
        setIsSubmitting(false);
      }
    }
  };

  if (!roleLoading) {
    return (
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Edit Process</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md p-4">
          <div className="w-100 mt-4">
            <h2 className="text-xl font-semibold">EDIT PROCESS</h2>
            <div className="customFormSet">
              <div className="w-100">
                <div className="row">
                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={dateFormatter(data?.date) || ""}
                      type="text"
                      onChange={onChange}
                      disabled
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                    />
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Program <span className="text-red-500">*</span>
                    </label>
                    <Form.Select
                      aria-label="program"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      disabled
                      name="program"
                      value={data?.program?.program_name}
                    >
                      <option value="">{data?.program?.program_name}</option>
                    </Form.Select>
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Total Lint/Blend (Kgs)
                    </label>
                    <input
                      placeholder="Total Lint/Blend"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="total_qty"
                      value={data?.total_qty}
                    />
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Type of Yarn <span className="text-red-500">*</span>
                    </label>
                    <Form.Select
                      aria-label="uploadType"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      disabled
                      name="yarn_type"
                      value={data?.yarn_type}
                    >
                      <option value="">{data?.yarn_type}</option>
                    </Form.Select>
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Yarn Quantity Produced(Kgs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Yarn Quantity Produced"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="yarn_qty_produced"
                      value={data?.yarn_qty_produced}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Yarn Realisation (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Yarn Realisation"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="yarn_realisation"
                      value={data?.yarn_realisation}
                    />
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Net Yarn Quantity (Kgs)
                    </label>
                    <input
                      placeholder="Net Yarn Quantity"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="net_yarn_qty"
                      value={data?.net_yarn_qty}
                    />
                  </div>

                  <div className="col-12 col-sm-6 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Comber Noil (Kgs)
                    </label>
                    <input
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="comberNoil"
                      value={data?.comber_noil}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      No of Boxes/Pallete
                    </label>
                    <input
                      placeholder="No of Boxes"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="number"
                      disabled
                      name="no_of_boxes"
                      value={data?.no_of_boxes}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Batch/Lot No <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="Batch Lot No"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="batch_lot_no"
                      value={data?.batch_lot_no}
                    />
                  </div>

                  <div className="col-12 col-sm-6  mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Box ID
                    </label>
                    <input
                      placeholder="Box Id"
                      className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                      type="text"
                      disabled
                      name="box_id"
                      value={data?.box_id}
                    />
                  </div>

                  <div className="col-12 col-sm-6 col-md-4 mt-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      Do you want to Complete the Process <span className="text-red-500">*</span>
                    </label>
                    <div className="w-100 chooseOption d-flex flex-wrap mt-2">
                      <label className="mt-1 d-flex mr-4 align-items-center">
                        <section>
                          <input
                            type="radio"
                            name={`processComplete`}
                            value="yes"
                            checked={formData.processComplete === true}
                            onChange={(e) => onChange(e)}
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
                            onChange={(e) => onChange(e)}
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
                </div>
              </div>
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
                    PROCESS COMPLETE
                  </button>
                  <button
                    className="btn-outline-purple"
                    onClick={() => router.push(`/spinner/spinner-process`)}
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
