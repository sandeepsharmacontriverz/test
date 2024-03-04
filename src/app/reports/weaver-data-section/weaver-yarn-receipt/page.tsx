"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import moment from "moment";
import { useRouter } from "next/navigation";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";

const WeaverYarnReciept: any = () => {
  const [isClient, setIsClient] = useState(false);
  useTitle("Weaver Yarn Receipt Report");
  const [roleLoading] = useRole();

  const { translations, loading } = useTranslations();

  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [countries, setCountries] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [weavers, setWeavers] = useState([]);
  const [spinner, setSpinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedWeavers, setCheckedWeavers] = React.useState<any>([]);
  const [checkedSpinners, setCheckedSpinners] = React.useState<any>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);
  const [showMainFilters, setShowMainFilters] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const router = useRouter();

  const brandId = User.brandId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [searchQuery, brandId, isClear, page, limit, defaultSeason]);

  useEffect(() => {
    getCountry();
    getSeason();
    getProgram();
    getBrands();
  }, [brandId]);

  useEffect(() => {
    getWeavers();
    getSpinner();
  }, [checkedCountries])

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = `reports/export-weaver-yarn-report?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&weaverId=${checkedWeavers}&spinnerId=${checkedSpinners}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Cotton Connect - Weaver Yarn Reciept Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getReports = async () => {
    const url = `reports/get-weaver-yarn-report?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&weaverId=${checkedWeavers}&spinnerId=${checkedSpinners}&search=${searchQuery}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };

  const getCountry = async () => {
    const url = "location/get-countries";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountries(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  const getSeason = async () => {
    const currentDate = new Date();
    const url = "season"
    try {
      const response = await API.get(url)
      if (response.success) {
        const res = response.data
        setSeasons(res)

        const currentSeason = response?.data?.find((season: any) => {
          const fromDate = new Date(season.from);
          const toDate = new Date(season.to);
          return currentDate >= fromDate && currentDate <= toDate;
        });
        if (currentSeason) {
          setCheckedSeasons([currentSeason.id]);
          setDefaultSeason(currentSeason);
        }
        else {
          setCheckedSeasons([res[0].id])
          setDefaultSeason(res[0])
        }
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  };


  const getProgram = async () => {
    const url = brandId
      ? `brand-interface/get-program?brandId=${brandId}`
      : "program";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setPrograms(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getBrands = async () => {
    const url = "brand";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getWeavers = async () => {
    const url = `weaver?countryId=${checkedCountries?.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setWeavers(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getSpinner = async () => {
    const url = `spinner?countryId=${checkedCountries?.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setSpinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const handleView = (url: string) => {
    window.open(url, "_blank");
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

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "brand") {
      if (checkedBrands?.includes(itemId)) {
        setCheckedBrands(checkedBrands?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "program") {
      if (checkedPrograms?.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "country") {
      setWeavers([])
      setSpinner([])
      setCheckedWeavers([])
      setCheckedSpinners([])
      if (checkedCountries?.includes(itemId)) {
        setCheckedCountries(
          checkedCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "weaver") {
      let itemName = selectedItem?.name;

      if (checkedWeavers?.includes(itemId)) {
        setCheckedWeavers(
          checkedWeavers?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedWeavers([...checkedWeavers, itemId]);
      }
    }
    else if (name === "spinners") {
      if (checkedSpinners?.includes(itemId)) {
        setCheckedSpinners(
          checkedSpinners?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSpinners([...checkedSpinners, itemId]);
      }
    }
    else if (name === "season") {
      if (checkedSeasons?.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedWeavers([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setIsClear(!isClear);
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full top-0 align-items-center w-auto z-10 fixed justify-center left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowMainFilters(!showMainFilters)}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">

                        {!brandId && (
                          <div className="col-12 col-md-6 col-lg-3 mt-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              {translations.common.Selectbrand}
                            </label>
                            <Multiselect
                              className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                              displayValue="brand_name"
                              selectedValues={brands?.filter((item: any) =>
                                checkedBrands?.includes(item.id)
                              )}
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(
                                selectedList: any,
                                selectedItem: any
                              ) => {
                                handleChange(selectedList, selectedItem, "brand");
                              }}
                              onSearch={function noRefCheck() { }}
                              onSelect={(selectedList: any, selectedItem: any) =>
                                handleChange(selectedList, selectedItem, "brand")
                              }
                              options={brands}
                              showCheckbox
                            />
                          </div>
                        )}

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectProgram}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programs?.filter((item: any) =>
                              checkedPrograms?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "program"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "program"
                              )
                            }
                            options={programs}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectCountry}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) =>
                              checkedCountries?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "country"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "country"
                              )
                            }
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            {translations.common.SelectSeason}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasons?.filter((item: any) =>
                              checkedSeasons?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "season"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "season")
                            }
                            options={seasons}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Spinner
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={spinner?.filter((item: any) =>
                              checkedSpinners?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(
                                selectedList,
                                selectedItem,
                                "spinners"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(
                                selectedList,
                                selectedItem,
                                "spinners"
                              )
                            }
                            options={spinner}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Weaver
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={weavers?.filter((item: any) =>
                              checkedWeavers?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedList, selectedItem, "weaver");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "weaver")
                            }
                            options={weavers}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getReports();
                              setShowMainFilters(false);
                            }}
                          >
                            {translations.common.ApplyAllFilters}
                          </button>
                          <button
                            className="btn-outline-purple"
                            onClick={clearFilter}
                          >
                            {translations.common.ClearAllFilters}
                          </button>
                        </section>
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


  const handleSingleDownload = async (id: number) => {
    try {
      const res = await API.get(`quality-parameter/export-single?qualityId=${id}`);
      if (res.success) {
        handleDownload(res.data, "Lot Test Quality report", ".xlsx");
      }
    } catch (error) {
      console.log(error)
    }
  }
  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
  };

  const formatDecimal = (value: string | number): string | number => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isFinite(numericValue)) {
      const formattedValue = numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2);
      return formattedValue.toString().replace(/\.00$/, '');
    }

    return numericValue;
  };


  if (loading) {
    return <div>  <Loader /></div>;
  }
  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations.common.srNo} </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: "70px",
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Date of Transaction Receipt </p>,
      width: "130px",
      wrap: true,
      selector: (row: any) => row?.accept_date ? dateFormatter(row?.accept_date) : '',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.date} </p>,
      cell: (row: any) => row?.date ? dateFormatter(row?.date) : ''
    },
    {
      name: <p className="text-[13px] font-medium">{translations.spinnerInterface.spinnerName}</p>,
      selector: (row: any) => row?.spinner,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Weaving Unit Name </p>,
      selector: (row: any) => row?.weaver,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">{translations.common.invoiceNumber}</p>,
      selector: (row: any) => row?.invoice_no,
      wrap: true,
    }, {
      name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
      center: true,
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
      name: <p className="text-[13px] font-medium"> Lot Test Quality report </p>,
      wrap: true,
      center: true,
      width: "200px",
      cell: (row: any) => (
        <>
          {row?.quality_report && (
            <>
              <FaEye
                size={18}
                className="text-black ml-3 hover:text-blue-600 cursor-pointer"
                onClick={() => router.push(`/reports/weaver-data-section/weaver-yarn-receipt/lot-test-quality?id=${row?.quality_report?.id}`)}
              />
              <FaDownload
                size={18}
                className="text-black ml-3 hover:text-blue-600 cursor-pointer"
                onClick={() => handleSingleDownload(row?.quality_report?.id)}
              />
            </>
          )}
        </>
      )
    },
    {
      name: <p className="text-[13px] font-medium"> Yarn REEL No </p>,
      selector: (row: any) => row?.reel_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Lot/ Batch No </p>,
      selector: (row: any) => row?.batch_lot_no,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.spinnerInterface.yarnCount} </p>,
      selector: (row: any) => row?.yarn_count,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.spinnerInterface.noOfBoxes} </p>,
      selector: (row: any) => row?.no_of_boxes,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.spinnerInterface.boxId} </p>,
      selector: (row: any) => row?.box_ids,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Net Weight (Kgs) </p>,
      selector: (row: any) => formatDecimal(row?.yarn_weight),
      wrap: true,
    },
    {
      name: translations?.ginnerInterface?.qrCode,
      center: true,
      cell: (row: any) => (
        <div className="h-16 flex">
          <img
            className=""
            src={process.env.NEXT_PUBLIC_API_URL + "file/" + row?.qr}
          />

          <button
            className=""
            onClick={() =>
              handleDownload(
                process.env.NEXT_PUBLIC_API_URL + "file/" + row.qr,
                "qr",
                ".png"
              )
            }
          >
            <FaDownload size={18} color="black" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>

            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
                  <div className="table-minwidth w-100">
                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="search-bars">
                          <form className="form-group mb-0 search-bar-inner">
                            <input
                              type="text"
                              className="form-control form-control-new jsSearchBar "
                              placeholder={translations.common.search}
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
                            onClick={() => setShowMainFilters(!showMainFilters)}
                          >
                            {translations.common.Filters} <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showMainFilters}
                              onClose={!showMainFilters}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="search-filter-right">
                          <button
                            className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                            onClick={() => {
                              handleExport();
                            }}
                          >
                            {translations.common.export}
                          </button>
                        </div>
                      </div>
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
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
};

export default WeaverYarnReciept;
