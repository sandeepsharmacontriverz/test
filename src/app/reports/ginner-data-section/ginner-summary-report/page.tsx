"use client";
import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import Link from "next/link";
import { BiFilterAlt } from "react-icons/bi";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import BarChart from "@components/charts/BarChart";
import Multiselect from "multiselect-react-dropdown";
import Accordian from "@components/core/Accordian";
import User from "@lib/User";
import Loader from "@components/core/Loader";

const Ginner: any = () => {
  const [roleLoading] = useRole();
  useTitle("Ginner Summary Report");

  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [countries, setCountries] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [ginners, setGinners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);

  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  console.log(checkedSeasons, "checkedSeasons");
  const [showFilter, setShowFilter] = useState(false);
  const brandId = User.brandId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getCountry();
    getProgram();
    getBrands();
    getSeasons();
  }, [brandId]);

  useEffect(() => {
    if (defaultSeason) {
      getReports();
    }
  }, [brandId, searchQuery, page, limit, isClear, defaultSeason]);



  useEffect(() => {
    getGinners();
  }, [checkedCountries])

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleExport = async () => {
    const url = `reports/export-ginner-summary-report?search=${searchQuery}&countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&ginnerId=${checkedGinners}&page=${page}&limit=${limit}&pagination=true`;
    try {
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Cotton Connect - Ginner Summary Report", ".xlsx");
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getReports = async () => {
    const url = `reports/get-ginner-summary-report?search=${searchQuery}&countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&programId=${checkedPrograms}&seasonId=${checkedSeasons}&ginnerId=${checkedGinners}&page=${page}&limit=${limit}&pagination=true`;
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

  const getSeasons = async () => {
    const currentDate = new Date();
    const url = `season`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data
        setSeasons(res)

        const currentSeason = response.data.find((season: any) => {
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
    } catch (error) {
      console.log(error, "error");
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

  const getGinners = async () => {
    const url = `ginner?countryId=${checkedCountries.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinners(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
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
      setGinners([]);
      setCheckedGinners([]);
      if (checkedCountries?.includes(itemId)) {
        setCheckedCountries(
          checkedCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedGinners?.includes(itemId)) {
        setCheckedGinners(
          checkedGinners?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    } else if (name === "season") {
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
    setCheckedGinners([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setIsClear(!isClear)
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
                  <h3 className="text-lg pb-2">{translations.common.Filters} </h3>
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
                              handleChange(selectedList, selectedItem, "season");
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
                            {translations.common.SelectGinner}
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={ginners?.filter((item: any) =>
                              checkedGinners?.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedList, selectedItem, "ginner");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleChange(selectedList, selectedItem, "ginner")
                            }
                            options={ginners}
                            showCheckbox
                          />
                        </div>
                      </div>
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              getReports()
                              setShowFilter(false);
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

  if (loading) {
    return <div> <Loader /></div>;
  }

  const formatDecimal = (value: string | number): string | number => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isFinite(numericValue)) {
      const formattedValue = numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2);
      return formattedValue.toString().replace(/\.00$/, '');
    }

    return numericValue;
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">{translations.common.srNo} </p>,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      width: '70px'
    },
    {
      name: <p className="text-[13px] font-medium">{translations.transactions.ginnerName}</p>,
      wrap: true,
      cell: (row: any) => row?.ginner.name,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total seed cotton procured (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.cottonProcuredMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total seed cotton processed (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.cottonProcessedeMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total seed cotton in stock (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.cottonStockMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint produce (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.lintProcuredMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint sold (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.lintSoldMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total lint in stock (MT)
        </p>
      ),
      wrap: true,
      cell: (row: any) => formatDecimal(row?.lintStockMt),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total bales produce
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.balesProduced,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total bales sold
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.balesSold,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          Total bales in stock
        </p>
      ),
      wrap: true,
      cell: (row: any) => row?.balesStock,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        width: "190px",
      },
    },
  };

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form ">
                  <div className="table-minwidth w-100">
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilter(!showFilter)}
                          >
                            {translations.common.Filters} <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showFilter}
                              onClose={!showFilter}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* search */}
                    <div className="search-filter-row gap-2">
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
                      </div>
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

                  <CommonDataTable
                    columns={columns}
                    customStyles={customStyles}
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

export default Ginner;
