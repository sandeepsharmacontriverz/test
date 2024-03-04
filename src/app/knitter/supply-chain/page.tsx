
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rating } from 'react-simple-star-rating'
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "@components/core/nav-link";
import API from "@lib/Api";
import { AiFillMinusCircle } from "react-icons/ai";
import DataTable from "react-data-table-component";
import { Form } from "react-bootstrap";
import { MdOutlineCheckCircleOutline } from "react-icons/md";
import useTranslations from "@hooks/useTranslation";
import User from "@lib/User";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";

export default function page() {
  const [roleLoading,hasAccess] = useRole();
  const { translations,loading } = useTranslations();
  useTitle(translations?.supplyChain?.supplychain);
  const [Access, setAccess] = useState<any>({});

  const [spinnerData, setSpinnerData] = useState<any>([]);
  const [transactions, setTransactions] = useState<any>([]);
  const [selectedData, setSelectedData] = useState<any>(spinnerData);
  const [showSubmitPopup, setShowSubmitPopup] = useState<any>(false)
  const [errors, setErrors] = useState<any>({
    rating: '',
    reason: ''
  })
  const knitterId = User.knitterId;

  const [formData, setFormData] = useState({
    id: undefined,
    userId: null,
    userType: 'Spinner',
    description: '',
    ratedByType: 'Knitter',
    processOrSales: 'process',
    rating: 0,
  })


  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Knitter")) {
      const access = checkAccess("Knitter Supply Chain");
      if (access) setAccess(access);
    }
  }, [roleLoading,hasAccess]);

  useEffect(() => {
    if (knitterId) {
      getKnitterData()
    }
  }, [knitterId]);

  useEffect(() => {
    if (knitterId) {
      if (spinnerData.length > 0) {
        setSelectedData(spinnerData[0]);
        if (spinnerData[0]) {
          fetchTransactions(spinnerData[0].id)
        }
      }
    }
  }, [spinnerData, knitterId]);

  const getKnitterData = async () => {
    const url = `knitter/get-knitter?id=${knitterId}`;
    try {
      const response = await API.get(url);
      if(response?.data?.brand?.length > 0){
        fetchSpinner(response?.data?.brand);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const fetchSpinner = async (id:any) => {
    try {
      const response = await API.get(`spinner?brandId=${id}`);
      if (response.success) {
        setSpinnerData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getRating = async (id: number) => {
    try {
      const response = await API.post(`supply-chain/get-rating`, {
        ratedBy: knitterId,
        ratedByType: 'Knitter',
        userId: id,
        userType: 'Spinner'
      });
      if (response.success) {
        if (response.data) {
          setFormData((prev: any) => ({
            ...prev,
            userId: response.data.user_id,
            description: response.data.description,
            userType: 'Spinner',
            rating: response.data.rating,
            "id": response.data.id,
          }))
        }
        else {
          setFormData((prev: any) => ({
            ...prev,
            id: undefined,
            userId: null,
            userType: 'Spinner',
            description: '',
            ratedByType: 'Knitter',
            processOrSales: 'process',
            rating: 0,
          }))
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  const fetchTransactions = async (id: number) => {
    try {
      const response = await API.get(`knitter-process/transaction?knitterId=${knitterId}&status=Sold&spinnerId=${id}`);
      if (response.success) {
        setTransactions(response.data);
        if (response.data.length) {
          getRating(id)
        }
        else {
          setFormData((prev: any) => ({
            ...prev,
            rating: null,
            description: ''
          }))
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRating = (rate: number) => {
    setErrors((prev: any) => ({
      ...prev,
      rating: '',
    })
    )
    if (formData.rating === 0 || rate > 2) {
      setFormData((prev: any) => ({
        ...prev,
        description: '',
      }))
    }
    setFormData((prev: any) => ({
      ...prev,
      rating: rate,
    })
    )
  }

  const handleSubmitRating = async () => {
    if (formData.rating === 0) {
      setErrors((prev: any) => ({
        ...prev,
        rating: 'Select rating',
      })
      )
      return;
    }

    if (formData.rating > 0 && formData.rating <= 2 && formData.description === "") {
      setErrors((prev: any) => ({
        ...prev,
        reason: 'Enter the reason',
      })
      )
      return;
    }
    const createRating = {
      ...formData,
      ratedBy: knitterId,
      userId: selectedData.id
    }
    if (formData.id) {
      try {
        const response = await API.put(`supply-chain/rating`,
          createRating
        );

        if (response.success) {
          getRating(selectedData.id)
          setShowSubmitPopup(true)
        }
      } catch (error) {
        console.error(error);
      }
    }
    else {
      try {
        const response = await API.post(`supply-chain/rating`,
          createRating
        );

        if (response.success) {
          getRating(response.data.user_id)
          setShowSubmitPopup(true)
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleReset = () => {
    setFormData((prev: any) => ({
      ...prev,
      rating: 0
    })
    )
  }

  const handleCompanyClick = (id: any) => {
    const selectedCompany = spinnerData.find((data: any) => data.id === id);
    if (selectedCompany) {
      setSelectedData(selectedCompany);
      fetchTransactions(id)
    }

  };

  const PopupSubmit = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <p className="d-flex justify-content-center">

                  <MdOutlineCheckCircleOutline color="green" size={40} className="flex justify-self-center" />
                </p>
                <div className="pt-6 w-auto text-center">
                  <p className="text-lg font-medium">{translations?.supplyChain?.RatingSub}</p>
                </div>


                <div className="pt-6 w-100 d-flex justify-content-center customButtonGroup buttotn560Fix">
                  <section>
                    <button
                      className="btn-purple mr-2"
                      onClick={() => {
                        setShowSubmitPopup(false);
                      }}
                    >
                      {translations?.supplyChain?.ok}                    </button>
                  </section>
                </div>
              </div>
            </div>
          </>
        )}
      </div >
    );
  };


  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.supplyChain?.compname}</p>),
      selector: (row: any) => row.name,
      wrap: true,
      cell: (row: any, id: any) => (
        <a
          className="cursor-pointer hover:text-blue-500"
          rel="noopener noreferrer"
          onClick={() => handleCompanyClick(row.id)}
        >
          {row.name}
        </a>
      ),
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.address}</p>),
      wrap: true,
      selector: (row: any) => row.address,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.supplyChain?.personName}</p>),
      wrap: true,
      selector: (row: any) => row.contact_person,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.supplyChain?.mailId}</p>),
      selector: (row: any) => row.email,
      wrap: true,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.supplyChain?.number} </p>),
      selector: (row: any) => row.mobile,
    },
  ];

  const handleChange = (event: any) => {
    const { value, name } = event.target;
    if (name == "description") {
      setErrors((prev: any) => ({
        ...prev,
        description: '',
      })
      )
      setFormData((prev: any) => ({
        ...prev,
        description: value
      }))
    }
  };

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access?.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }
  
  if (!roleLoading && Access?.view) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/knitter/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>{translations?.supplyChain?.supplychain}</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="farm-details">
              <div className="farm-detail-left">
                <div className="panel-gray h-100">

                  <p className="heading16 font-medium">{translations?.supplyChain?.details}</p>
                  <div className="user-profile mg-t-44">
                    <div className="details-list-group mg-t-44">
                      <ul className="detail-list">
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.compname}:</span>
                          <span className="val">
                            {selectedData?.name}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.category}:</span>
                          <span className="val">
                            Spinner
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.common?.address}:</span>
                          <span className="val break-words">
                            {selectedData?.address}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.personName}:</span>
                          <span className="val break-words">
                            {selectedData?.contact_person}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">
                            {translations?.supplyChain?.mailId}:
                          </span>
                          <span className="val break-words">
                            {selectedData?.email}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.number}:</span>
                          <span className="val break-words">
                            {selectedData?.mobile}
                          </span>
                        </li>
                        <li className="item">
                          <span className="label">{translations?.supplyChain?.profileAbout}:</span>
                          <span className="val">
                            {selectedData?.company_info}
                          </span>
                        </li>

                        {Access?.edit && transactions.length > 0 &&
                          <>
                            <li className="item">
                              <span className="label">{translations?.supplyChain?.Ranking}:</span>
                              <div>
                                <span className="flex">
                                  <button onClick={handleReset}><AiFillMinusCircle color="gray" size={14} /></button>
                                  <Rating onClick={handleRating} SVGstyle={{ display: 'inline' }} initialValue={formData.rating} allowFraction={true} size={24} />
                                </span>
                                {errors?.rating !== "" && (
                                  <p className="text-sm text-red-500">
                                    {errors.rating}
                                  </p>
                                )}
                              </div>
                            </li>

                            {(formData.rating > 0 && formData.rating <= 2) &&
                              <>
                                <li className="item">
                                  <span className="label">{translations?.supplyChain?.poorRating}:</span>
                                </li>
                                <li className="item">
                                  <div className="w-full">
                                    <textarea className="text-sm w-full border p-1 rounded" rows={2} name="description" value={formData.description} onChange={handleChange} />
                                    {errors?.reason !== "" && (
                                      <p className="text-sm text-red-500">
                                        {errors.reason}
                                      </p>
                                    )}
                                  </div>
                                </li>

                              </>
                            }
                            <div className="w-full customButtonGroup text-center">
                              <button
                                className="btn-purple mr-2"
                                onClick={handleSubmitRating}
                              >
                                {translations?.common?.submit}
                              </button>

                            </div>
                          </>
                        }
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              <div className="farm-detail-right">

                <div className="panel-gray">
                  <div className="col-12 col-md-6 col-lg-4 my-4">
                    <label className="text-gray-500 text-[12px] font-medium">
                      {translations?.supplyChain?.SelectCat}
                    </label>
                    <Form.Select
                      aria-label="Default select example"
                      className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                      name="processorType"
                      value={'Spinner'}
                      onChange={handleChange}
                    >
                      <option value="Spinner">Spinner</option>
                    </Form.Select>

                  </div>
                  <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                    <DataTable
                      persistTableHead
                      fixedHeader={true}
                      noDataComponent={<p className="py-3 font-bold text-lg">{translations?.common?.Nodata}</p>}
                      fixedHeaderScrollHeight='auto'
                      columns={columns}
                      data={spinnerData}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 relative">
          <div className="filterGroupFix">
            <PopupSubmit
              openFilter={showSubmitPopup}
              onClose={!showSubmitPopup}
            />
          </div>
        </div>
      </>
    );
  }

}