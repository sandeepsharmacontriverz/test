"use client";
import React, { useState, useEffect, useRef } from "react";
import NavLink from "@components/core/nav-link";
import { FaDownload, FaEye } from "react-icons/fa";
import { useRouter } from "@lib/router-events";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";

import API from "@lib/Api";
import User from "@lib/User";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { AiFillDelete } from "react-icons/ai";
import DataTable from "react-data-table-component";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import { LuEdit } from "react-icons/lu";

const yarntype = [
  {
    id: 1,
    name: "Carded",
  },
  {
    id: 2,
    name: "Combed",
  },
  {
    id: 3,
    name: "Semi Combed",
  },
];

export default function page() {
  useTitle("Lint Sale");
  const [roleLoading, hasAccesss] = useRole();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [Access, setAccess] = useState<any>({});

  const spinnerId = User.spinnerId;

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [isClear, setIsClear] = useState(false);
  const [showMainFilter, setShowMainFilter] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = useState<any>([]);
  const [checkedBuyerOptions, setCheckedBuyerOptions] = useState<any>([]);
  const [checkedYarnType, setCheckedYarnType] = useState<any>([]);
  const [checkedWeaverId, setCheckedWeaverId] = useState<any>([]);
  const [checkedKnitterId, setCheckedKnitterId] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>();
  const [programs, setProgram] = useState<any>();
  const [yarnType, setYarnType] = useState<any>();
  const [buyerOptions, setBuyerOptions] = useState<any>();
  const [knitters, setKnitters] = useState<any>();
  const [weavers, setWeavers] = useState<any>();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);

  const code = encodeURIComponent(searchQuery);

  const [isAdmin, setIsAdmin] = useState<any>(false);
  useEffect(() => {
    const isAdminData: any = sessionStorage.getItem("User") && localStorage.getItem("orgToken");
    if (isAdminData?.length > 0) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Spinner")) {
      const access = checkAccess("Spinner Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    getSeasons();
    setYarnType(yarntype);
  }, []);

  useEffect(() => {
    if (spinnerId) {
      getPrograms();
      getBuyerOptions();
      fetchSales();
    }
  }, [spinnerId, searchQuery, page, limit, isClear]);

  const fetchSales = async () => {
    try {
      const response = await API.get(
        `spinner-process/sales?spinnerId=${spinnerId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${selectedOption === "knitter" ? checkedKnitterId : ""
        }&weaverId=${selectedOption === "weaver" ? checkedWeaverId : ""
        }&type=${selectedOption}&yarnType=${checkedYarnType}&limit=${limit}&page=${page}&search=${code}&pagination=true`
      );
      if (response.success) {
        setData(response.data);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0);
    }
  };

  const getSeasons = async () => {
    try {
      const res = await API.get("season");
      if (res.success) {
        setSeasons(res.data);
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
        let knitter = res.data.filter((item: any) => item.type === "kniter");
        setKnitters(knitter);
        let weaver = res.data.filter((item: any) => item.type === "weaver");
        setWeavers(weaver);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleDownloadData = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const fetchExport = async () => {
    try {
      if (spinnerId !== undefined || !spinnerId) {
        const res = await API.get(
          `spinner-process/sales/export??spinnerId=${spinnerId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${selectedOption === "knitter" ? checkedKnitterId : ""
          }&weaverId=${selectedOption === "weaver" ? checkedWeaverId : ""
          }&type=${selectedOption}&yarnType=${checkedYarnType}&limit=${limit}&page=${page}&search=${code}`
        );
        if (res.success) {
          handleDownload(res.data, "Sales Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowFilter(!showFilter);
  };

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/");
      return file ? file[1] : "";
    };
    const columnsArr: any = [
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.srNo}</p>,
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.knitterInterface?.File}</p>,
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: <p className="text-[13px] font-medium">{translations?.common?.Action}</p>,
        selector: (row: any) => (
          <>
            <div className="flex items-center">
              <FaEye
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer mr-2"
                onClick={() => handleView(row)}
              />
              <FaDownload
                size={18}
                className="text-black  hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row, "Invoice File")}
              />
            </div>
          </>
        ),
        center: true,
        wrap: true,
      },
    ];

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations?.common?.InVoiceFiles}</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <DataTable
                          columns={columnsArr}
                          data={dataArray}
                          persistTableHead
                          fixedHeader={true}
                          noDataComponent={"No data available in table"}
                          fixedHeaderScrollHeight="600px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /></div>;
  }

  const columns = [
    {
      name: (
        <p className="text-[13px] font-medium">{translations.common.srNo}</p>
      ),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "90px",
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      width: "120px",
      selector: (row: any) => row.date?.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      width: "100px",
      selector: (row: any) => row.season?.name,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.spinlotNo}
        </p>
      ),
      selector: (row: any) => row.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.qualityParameter.reelLotNumber}
        </p>
      ),
      width: "150px",
      selector: (row: any) => row.reel_lot_no,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnType}
        </p>
      ),
      selector: (row: any) => row?.yarn_type,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnCount}
        </p>
      ),
      selector: (row: any) => row?.yarncount?.yarnCount_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.noOfBoxes}
        </p>
      ),
      selector: (row: any) => row.no_of_boxes,
    },
    {
      name: <p className="text-[13px] font-medium">Buyer Name</p>,
      width: "180px",
      selector: (row: any) =>
        row.weaver ? row.weaver?.name : row.knitter?.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.boxId}
        </p>
      ),
      selector: (row: any) => row.box_ids,
    },
    {
      name: <p className="text-[13px] font-medium">Total Weight(Kgs)</p>,
      wrap: true,
      selector: (row: any) => row.total_qty,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.program}
        </p>
      ),
      selector: (row: any) => row.program?.program_name,
    },
    , {
      name: <p className="text-[13px] font-medium"> Price / kg </p>,
      cell: (row: any) => row.price
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via Trader</p>,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      wrap: true,
      selector: (row: any) => row.transaction_agent,
    },
    {
      name: <p className="text-[13px] font-medium">Quality Document</p>,
      cell: (row: any) =>
        row.quality_doc && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.quality_doc)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.quality_doc, "Quality Document")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">TC File</p>,
      center: true,
      cell: (row: any) =>
        row.tc_files && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.tc_files)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleDownloadData(row.tc_files, "Tc File")}
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      center: true,
      cell: (row: any) =>
        row.contract_file && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.contract_file)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.contract_file, "Contract File")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    },

    {
      name: <p className="text-[13px] font-medium">Delivery Notes</p>,
      center: true,
      cell: (row: any) =>
        row.delivery_notes && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer"
              onClick={() => handleView(row.delivery_notes)}
            />
            <FaDownload
              size={18}
              className="ml-3 text-black hover:text-blue-600 cursor-pointer"
              onClick={() =>
                handleDownloadData(row.delivery_notes, "Delivery Notes")
              }
            />
          </>
        ),
    },
    {
      name: <p className="text-[13px] font-medium">Status</p>,
      cell: (row: any) => <p>{row.status}</p>,
    },
    {
      name: translations.ginnerInterface.qrCode,
      cell: (row: any) =>
        row?.qr && (
          <>
            <img
              className=""
              src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
            />

            <button
              className=""
              onClick={() =>
                handleDownload(
                  process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                  "QR",
                  ".png"
                )
              }
            >
              <FaDownload size={18} color="black" />
            </button>
          </>

        ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    //   isAdmin && {
    //     name: (
    //       <p className="text-[13px] font-medium">
    //         {translations.common.action}
    //       </p>
    //     ),
    //     cell: (row: any) =>
    //       row.status === "Sold" ? (
    //         ""
    //       ) : (
    //         <>
    //           <button
    //             onClick={() => handleDelete(row.id)}
    //             className="bg-red-500 p-2 ml-3 rounded"
    //           >
    //             <AiFillDelete size={18} color="white" />
    //           </button>
    //         </>
    //       ),
    //     ignoreRowClick: true,
    //     allowOverflow: true,
    //   },
    // ].filter(Boolean);
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.action}
        </p>
      ),
      cell: (row: any) => (
        <>
          <button
            className="bg-green-500 p-2 rounded"
            onClick={() => router.push(`/spinner/sales/edit-spinner-sale?id=${row.id}`)}
          >
            <LuEdit size={18} color="white" />
          </button>
          {isAdmin && (
            <>
              {row.status !== "Sold" && (
                <button
                  onClick={() => handleDelete(row.id)}
                  className="bg-red-500 p-2 ml-3 rounded"
                >
                  <AiFillDelete size={18} color="white" />
                </button>
              )}
            </>
          )
          }

        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },].filter(Boolean)


  const clearFilter = () => {
    setCheckedPrograms([]);
    setCheckedSeasons([]);
    setCheckedKnitterId([]);
    setCheckedWeaverId([]);
    setCheckedYarnType([]);
    setCheckedBuyerOptions([]);
    setSelectedOption("");
    setIsClear(!isClear);
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "programs") {
      if (checkedPrograms.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "yarnType") {
      if (checkedYarnType.includes(selectedItem?.name)) {
        setCheckedYarnType(
          checkedYarnType.filter((item: any) => item !== selectedItem?.name)
        );
      } else {
        setCheckedYarnType([...checkedYarnType, selectedItem?.name]);
      }
    } else if (name === "knitter") {
      if (checkedKnitterId.includes(itemId)) {
        setCheckedKnitterId(
          checkedKnitterId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedKnitterId([...checkedKnitterId, itemId]);
      }
    } else if (name === "weaver") {
      if (checkedWeaverId.includes(itemId)) {
        setCheckedWeaverId(
          checkedWeaverId.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedWeaverId([...checkedWeaverId, itemId]);
      }
    }
    // else if (name === "buyerName") {
    //   if (checkedBuyerOptions.includes(selectedItem?.displayName)) {
    //     let newVal = selectedItem?.displayName.split("-");
    //     if (newVal.length > 1) {
    //       if(newVal[1] === "weaver"){
    //         setCheckedWeaverId(checkedWeaverId.filter((item: any) => item !== itemId))
    //       }else if(newVal[1] === "kniter"){
    //         setCheckedKnitterId(checkedKnitterId.filter((item: any) => item !== itemId))
    //       }
    //     }
    //     setCheckedBuyerOptions(
    //       checkedBuyerOptions.filter((item: any) => item !== selectedItem?.displayName)
    //     );
    //   } else {
    //     let newVal = selectedItem?.displayName.split("-");
    //     if (newVal.length > 1) {
    //       if(newVal[1] === "weaver"){
    //         setCheckedWeaverId([...checkedWeaverId, itemId])
    //       }else if(newVal[1] === "kniter"){
    //         setCheckedKnitterId([...checkedKnitterId, itemId])
    //       }
    //     }
    //     setCheckedBuyerOptions([...checkedBuyerOptions, selectedItem?.displayName]);
    //   }
    // }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;
    setSelectedOption(value);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3  "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">Filters</h3>
                <button
                  className="text-[20px]"
                  onClick={() => setShowMainFilter(!showMainFilter)}
                >
                  &times;
                </button>
              </div>
              <div className="w-100 mt-0">
                <div className="customFormSet">
                  <div className="w-100">
                    <div className="row">
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Season
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "seasons");
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "seasons")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={programs?.filter((item: any) =>
                            checkedPrograms.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "programs"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "programs"
                            );
                          }}
                          options={programs}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Yarn Type
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={yarnType?.filter((item: any) =>
                            checkedYarnType.includes(item.name)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "yarnType"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "yarnType")
                          }
                          options={yarnType}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Buyer:
                        </label>
                        <div className="w-100 d-flex flex-wrap mt-2">
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                id="1"
                                type="radio"
                                name="filterby"
                                value="knitter"
                                checked={selectedOption === "knitter"}
                                onChange={handleRadioChange}
                                className="mr-1"
                              />
                              <span></span>
                            </section>{" "}
                            Knitter
                          </label>
                          <label className="mt-1 d-flex mr-4 align-items-center">
                            <section>
                              <input
                                id="2"
                                type="radio"
                                name="filterby"
                                value="weaver"
                                checked={selectedOption === "weaver"}
                                onChange={handleRadioChange}
                                className="mr-1"
                              />
                              <span></span>
                            </section>{" "}
                            Weaver
                          </label>
                        </div>
                      </div>

                      {selectedOption === "knitter" && (
                        <div className="col-12 col-md-6 col-lg-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Buyer Name
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={knitters?.filter((item: any) =>
                              checkedKnitterId.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "knitter"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "knitter"
                              )
                            }
                            options={knitters}
                            showCheckbox
                          />
                        </div>
                      )}

                      {selectedOption === "weaver" && (
                        <div className="col-12 col-md-6 col-lg-6 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Buyer Name
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={weavers?.filter((item: any) =>
                              checkedWeaverId.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "weaver"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "weaver")
                            }
                            options={weavers}
                            showCheckbox
                          />
                        </div>
                      )}

                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchSales();
                            setShowMainFilter(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilter();
                          }}
                        >
                          CLEAR ALL FILTERS
                        </button>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!roleLoading && !Access.view) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access.view) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "spinner-process/sales";
                try {
                  const response = await API.delete(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    fetchSales();
                  } else {
                    toasterError(response.error.code, 5000, deleteItemId);
                  }
                } catch (error) {
                  toasterError("An error occurred");
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <NavLink href="/spinner/dashboard">
                    <span className="icon-home"></span>
                  </NavLink>
                </li>
                <li>Sale</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="farm-group-box">
          <div className="farm-group-inner">
            <div className="table-form">
              <div className="table-minwidth w-100">
                {/* search */}
                <div className="search-filter-row">
                  <div className="search-filter-left ">
                    <div className="search-bars">
                      <form className="form-group mb-0 search-bar-inner">
                        <input
                          type="text"
                          className="form-control form-control-new jsSearchBar "
                          placeholder="Search "
                          value={searchQuery}
                          onChange={searchData}
                        />
                        <button type="submit" className="search-btn">
                          <span className="icon-search"></span>
                        </button>
                      </form>
                    </div>

                    <div className="fliterBtn">
                      <button
                        className="flex"
                        type="button"
                        onClick={() => setShowMainFilter(!showMainFilter)}
                      >
                        FILTERS <BiFilterAlt className="m-1" />
                      </button>

                      <div className="relative">
                        <FilterPopup
                          openFilter={showMainFilter}
                          onClose={!showMainFilter}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-x-4">
                    <button
                      className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                      onClick={fetchExport}
                    >
                      Sales Report
                    </button>
                    {Access.create &&
                      <button
                        className="btn btn-all btn-purple"
                        onClick={() =>
                          router.push("/spinner/sales/add-spinner-sale")
                        }
                      >
                        New Sale
                      </button>
                    }
                  </div>
                </div>

                <DocumentPopup
                  openFilter={showFilter}
                  dataArray={dataArray}
                  onClose={() => setShowFilter(false)}
                />

                <CommonDataTable
                  columns={columns}
                  count={count}
                  data={data}
                  updateData={updatePage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
