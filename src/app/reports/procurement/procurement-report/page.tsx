"use client";

import React, { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import useRole from "@hooks/useRole";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import { handleDownload } from "@components/core/Download";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";
import moment from "moment";
import Multiselect from "multiselect-react-dropdown";
import User from "@lib/User";
import Loader from "@components/core/Loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ProcurementReport: any = () => {
  const [roleLoading, hasAccess] = useRole();
  const { translations, loading } = useTranslations();

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [program, setProgram] = useState<any>([])

  const [showExportMessage, setShowExportMessage] = useState(false);
  const [showFilterExport, setShowFilterExport] = useState(false);
  const [errorExport, setErrorExport] = useState(false);
  const [errorDateExport, setErrorDateExport] = useState(false);
  const [countryExport, setCountryExport] = useState([]);
  const [statesExport, setStatesExport] = useState([]);
  const [seasonExport, setSeasonExport] = useState([]);
  const [programExport, setProgramExport] = useState([]);
  const [ginnerExport, setGinnerExport] = useState([]);
  const [brandsExport, setBrandsExport] = useState([]);
  const [checkedExportCountries, setCheckedExportCountries] =
    React.useState<any>([]);

  const [checkedExportStates, setCheckedExportStates] = React.useState<any>([]);
  const [checkedExportPrograms, setCheckedExportPrograms] = React.useState<any>(
    []
  );
  const [checkedExportBrands, setCheckedExportBrands] = React.useState<any>([]);
  const [checkedExportFarmGroups, setCheckedExportFarmGroups] = useState<any>(
    []
  );
  const [isExportClear, setIsExportClear] = useState(false);

  const [checkedExportSeasons, setCheckedExportSeasons] = useState<any>([]);
  const [checkedExportGinners, setCheckedExportGinners] = useState<any>([]);
  const [startExportDates, setExportStartDates] = useState<any>("");
  const [endExportDates, setExportEndDates] = useState<any>("");

  const [country, setCountry] = useState([]);
  const [states, setStates] = useState([]);
  const [season, setSeason] = useState([]);
  const [ginner, setGinner] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);

  const [showTransactionPopUp, setShowTransactionPopUp] = useState(false);
  const [showFilter, setShowFilter] = useState(false);









  const [viewData, setViewData] = useState<any>({
    transactionId: null,
    farmerId: null,
    farmerName: null,
    farmerCode: null,
    season: null,
    estimatedCotton: null,
    qualityPurchased: null,
    availableCotton: null,
  });
  const [isClear, setIsClear] = useState(false);
  const code = encodeURIComponent(searchQuery);

  const brandId = User.brandId;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    getCountry();
    getSeason();
    getBrands();
    getProgram()
  }, [brandId, showFilterExport, checkedExportBrands]);

  useEffect(() => {
    if (checkedCountries.length !== 0 || (checkedExportCountries.length > 0 && showFilterExport)) {
      getStates();
    } else {
      setCheckedStates([]);
      setCheckedGinners([]);
      setStatesExport([]);
    }
  }, [checkedCountries, checkedExportCountries, showFilterExport]);


  useEffect(() => {
    if (showFilterExport && checkedExportStates.length > 0) {
      getGinner();
    } else {
      setGinnerExport([]);
    }
  }, [showFilterExport, checkedExportStates, checkedCountries]);

  useEffect(() => {
    getTransactions();
  }, [searchQuery, page, limit, isClear, brandId]);
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
  const getCountry = async () => {
    const url = "location/get-countries";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setCountryExport(res);
        } else {
          setCountry(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getStates = async () => {
    if (checkedCountries.length !== 0 || (checkedExportCountries.length > 0 && showFilterExport)) {
      const url = `location/get-states?countryId=${showFilterExport ? checkedExportCountries : checkedCountries}`;
      try {
        const response = await API.get(url);
        if (response.success) {
          const res = response.data;

          if (showFilterExport) {
            setStatesExport(res);
          } else {
            setStates(res);
          }
        }
      } catch (error) {
        console.log(error, "error");
      }
    }
  };
  const getSeason = async () => {
    const url = "season";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        if (showFilterExport === true) {
          setSeasonExport(res);
        } else {
          setSeason(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getProgram = async () => {
    try {
      if (showFilterExport === true && checkedExportBrands.length > 0) {
        const response = await API.get(
          `brand/program/get?brandId=${checkedExportBrands}`
        );
        if (response.success) {
          const res = response.data;
          setProgramExport(res);
        }
      } else {
        setProgramExport([]);
      }
      let url = brandId ? `brand/program/get?brandId=${brandId}` : "program";
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setProgram(res);
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
        if (showFilterExport) {
          setBrandsExport(res);
        } else {
          setBrands(res);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const getGinner = async () => {
    const url = `ginner?brandId=${brandId ? brandId : checkedBrands.join(",")}`;
    try {
      if (showFilterExport && checkedExportStates.length > 0) {
        const response = await API.get(`ginner?countryId=${showFilterExport ? checkedExportCountries : checkedCountries}`);
        if (response.success) {
          const res = response.data;
          setGinnerExport(res);
        }
      } else {
        setGinnerExport([]);
      }
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setGinner(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getTransactions = async () => {
    const url = `reports/get-transactions?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands
      }&seasonId=${checkedSeasons}&programId=${checkedPrograms}&stateId=${checkedStates}&ginnerId=${checkedGinners}&search=${code}&page=${page}&limit=${limit}&status=Sold&pagination=true`;
    try {
      const response = await API.get(url);
      setData(response.data);
      setCount(response.count);
    } catch (error) {
      setCount(0);
    }
  };
  const TransActionDetails = async (seasonId: any, farmerId: any) => {
    const url = `procurement/get-season-farmer-transactions?seasonId=${seasonId}&farmerId=${farmerId}`
    try {
      const response = await API.get(url)
      setViewData(response?.data)
    }
    catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  }
  const viewTransactionDetails = (seasonId: any, farmerId: any) => {
    setShowTransactionPopUp(true);
    TransActionDetails(seasonId, farmerId)
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const handleCancel = () => {
    setShowTransactionPopUp(false);
  };
  const handleExport = async () => {
    if (checkedExportSeasons.length === 0) {
      setErrorExport(true);
      return;
    }
    if (startExportDates !== "" && endExportDates === "") {
      setErrorDateExport(true);
      return;
    }
    const url = `reports/export-procurement-report?status=Sold&countryId=${checkedExportCountries}&stateId=${checkedExportStates}&brandId=${checkedExportBrands}&seasonId=${checkedExportSeasons}&programId=${checkedExportPrograms}&ginnerId=${checkedExportGinners}&search=${code}&page=${page}&limit=${limit}&pagination=true&startDate=${startExportDates}&endDate=${endExportDates}`;
    try {
      setShowExportMessage(true);
      setErrorExport(false);
      setErrorDateExport(false);

      setIsExportClear(true);
      const response = await API.get(url);
      if (response.success) {
        if (response.data) {
          handleDownload(response.data, "Cotton Connect - Procurement Report", ".xlsx");
          exportClear();
          setShowFilterExport(!showFilterExport);
          setIsExportClear(false);
          setShowExportMessage(false);
        } else {
          setIsExportClear(false);
          setShowExportMessage(false);
        }
      }
    } catch (error) {
      console.log(error, "error");
      setIsExportClear(false);
      setShowExportMessage(false);
    }
  };
  const handleFilterChange = (
    selectedList: any,
    selectedItem: any,
    name: string,
    remove: boolean = false
  ) => {
    let itemId = selectedItem?.id;
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    }
    else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(
          checkedStates.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    }

    else if (name === "brands") {
      if (checkedBrands.includes(itemId)) {
        setCheckedBrands(checkedBrands.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedGinners.includes(itemId)) {
        setCheckedGinners(
          checkedGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    }

  };
  const handleExportChange = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    let itemName = selectedItem?.name;

    if (name === "countries") {
      setCheckedExportStates([]);
      if (checkedExportCountries.includes(itemId)) {
        setCheckedExportCountries(
          checkedExportCountries.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportCountries([...checkedExportCountries, itemId]);
      }
    } else if (name === "states") {
      setCheckedExportGinners([]);
      if (checkedExportStates.includes(itemId)) {
        setCheckedExportStates(
          checkedExportStates.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportStates([...checkedExportStates, itemId]);
      }
    } else if (name === "programs") {
      setCheckedExportFarmGroups([]);
      setCheckedExportPrograms(selectedList.map((item: any) => item.id));
    } else if (name === "brands") {
      setCheckedExportPrograms([]);
      setCheckedExportFarmGroups([]);
      if (checkedExportBrands.includes(itemId)) {
        setCheckedExportBrands(
          checkedExportBrands.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportBrands([...checkedExportBrands, itemId]);
      }
    } else if (name === "farmGroups") {
      if (checkedExportFarmGroups.includes(itemId)) {
        setCheckedExportFarmGroups(
          checkedExportFarmGroups.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportFarmGroups([...checkedExportFarmGroups, itemId]);
      }
    } else if (name === "ginners") {
      if (checkedExportGinners.includes(itemId)) {
        setCheckedExportGinners(
          checkedExportGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportGinners([...checkedExportGinners, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedExportSeasons.includes(itemId)) {
        setCheckedExportSeasons(
          checkedExportSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedExportSeasons([...checkedExportSeasons, itemId]);
      }

    }
  };
  const handleFromExport = (date: any) => {
    if (date) {
      setExportStartDates(date);
    } else {
      setExportStartDates(null);
    }

  };
  const handleToExport = (date: any) => {
    if (date) {
      setExportEndDates(date);
    } else {
      setExportEndDates(null);
    }

  };

  const FilterExport = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div
              ref={popupRef}
              className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
            >
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md max-h-full overflow-auto">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button
                    className="text-[20px] w-auto"
                    style={
                      isExportClear
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer" }
                    }
                    disabled={isExportClear}
                    onClick={() => {
                      setErrorExport(false);
                      setErrorDateExport(false);
                      exportClear();
                      setShowFilterExport(!showFilterExport);
                    }}
                  >
                    &times;
                  </button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Seasons
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="name"
                            selectedValues={seasonExport?.filter((item: any) =>
                              checkedExportSeasons.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "seasons"
                              )
                            }
                            options={seasonExport}
                            showCheckbox
                          />
                          {errorExport && (
                            <p className="text-red-500  text-sm mt-1">
                              Season is Required
                            </p>
                          )}
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Brands
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="brand_name"
                            selectedValues={brandsExport?.filter((item: any) =>
                              checkedExportBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              )
                            }
                            options={brandsExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Programs
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="program_name"
                            selectedValues={programExport?.filter((item: any) =>
                              checkedExportPrograms.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "programs"
                              );
                            }}
                            options={programExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Countries
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countryExport?.filter((item: any) =>
                              checkedExportCountries.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "countries"
                              )
                            }
                            options={countryExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select States
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={statesExport?.filter((item: any) =>
                              checkedExportStates.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "states"
                              )
                            }
                            options={statesExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select Ginners
                          </label>
                          <Multiselect
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            // id="programs"
                            displayValue="name"
                            selectedValues={ginnerExport?.filter((item: any) =>
                              checkedExportGinners.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleExportChange(
                                selectedList,
                                selectedItem,
                                "ginners"
                              )
                            }
                            options={ginnerExport}
                            showCheckbox
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date From
                          </label>
                          <DatePicker
                            selected={startExportDates}
                            selectsStart
                            startDate={startExportDates}
                            endDate={endExportDates}
                            maxDate={endExportDates ? endExportDates : null}
                            onChange={handleFromExport}
                            dateFormat={"dd-MM-yyyy"}
                            showYearDropdown
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                        </div>

                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Date To
                          </label>
                          <DatePicker
                            selectsEnd
                            startDate={startExportDates}
                            endDate={endExportDates}
                            minDate={startExportDates}
                            onChange={handleToExport}
                            showYearDropdown
                            selected={endExportDates}
                            dateFormat={"dd-MM-yyyy"}
                            placeholderText="Select a date"
                            className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          />
                          {errorDateExport && (
                            <p className="text-red-500  text-sm mt-1">
                              To date is required
                            </p>
                          )}
                        </div>

                      </div>
                      {showExportMessage && (
                        <div className="flex justify-center mt-3 border-y">
                          <p className="text-center font-semibold text-md text-green-700 py-1">
                            Note: Export all records will take time based on the
                            speed of internet and total no of records
                          </p>{" "}
                        </div>
                      )}
                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : {
                                  cursor: "pointer",
                                  backgroundColor: "#D15E9C",
                                }
                            }
                            onClick={() => {
                              handleExport();
                              setShowFilter(false);
                            }}
                          >
                            Export
                          </button>
                          <button
                            className="btn-outline-purple"
                            disabled={isExportClear}
                            style={
                              isExportClear
                                ? { cursor: "not-allowed", opacity: 0.8 }
                                : { cursor: "pointer" }
                            }
                            onClick={() => {
                              exportClear();
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
          </>
        )}
      </div>
    );
  };
  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <div
            ref={popupRef}
            className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 "
          >
            <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
              <div className="flex justify-between align-items-center">
                <h3 className="text-lg pb-2">{translations.common.Filters}</h3>
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
                              checkedBrands.includes(item.id)
                            )}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(
                              selectedList: any,
                              selectedItem: any
                            ) => {
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brands",
                                true
                              );
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) =>
                              handleFilterChange(
                                selectedList,
                                selectedItem,
                                "brands"
                              )
                            }
                            options={brands}
                            showCheckbox
                          />
                        </div>
                      )}
                      {/* <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectProgram}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedPrograms.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "programs",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "programs"
                            );
                          }}
                          options={program}
                          showCheckbox
                        />
                      </div> */}
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectSeason}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={season?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "seasons"
                            )
                          }
                          options={season}
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
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "countries",
                              true
                            )
                          }
                          options={country}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectState}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="state_name"
                          selectedValues={states?.filter((item: any) =>
                            checkedStates.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "states",
                              true
                            )
                          }
                          options={states}
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
                          selectedValues={ginner?.filter((item: any) =>
                            checkedGinners.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginners",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "ginners"
                            )
                          }
                          options={ginner}
                          showCheckbox
                        />
                      </div>

                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getTransactions();
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
        )}
      </div>
    );
  };
  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedGinners([]);
    setCheckedBrands([]);
    setCheckedStates([])
    setCheckedSeasons([]);
    setIsClear(!isClear);
  };
  const exportClear = () => {
    setCheckedExportSeasons([]);
    setCheckedExportPrograms([]);
    setCheckedExportBrands([]);
    setCheckedExportCountries([]);
    setCheckedExportStates([]);
    setCheckedExportGinners([]);
    setExportStartDates("");
    setExportEndDates("");
  };

  if (loading) {
    return <div> <Loader /></div>;
  }

  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations.common.srNo}</p>),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      wrap: true,
      width: '70px'
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.date}</p>),
      width: '130px',
      selector: (row: any) => dateFormatter(row.date),
      wrap: true,

    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.farmerCode}</p>),
      wrap: true,
      selector: (row: any) => row.farmer?.code,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.farmerName}</p>),
      wrap: true,
      width: '160px',
      selector: (row: any) =>
        row.farmer?.firstName + " " + row.farmer?.lastName,
    },
    {
      name: <p className="text-[13px] font-medium"> {translations.transactions.season} </p>,
      width: "100px",
      wrap: true,
      cell: (row: any) => (
        <>
          {
            hasAccess?.role?.userCategory?.category_name === "Superadmin" ?
              <button
                onClick={() =>
                  viewTransactionDetails(row?.season_id, row?.farmer_id)
                }
                className="text-blue-500 hover:text-blue-300"
              >
                {" "}
                {row?.season?.name}{" "}
              </button> :
              <span>{row?.season?.name}</span>
          }
        </>
      ),
      sortable: false,
    },

    {
      name: (<p className="text-[13px] font-medium">{translations.location.countryName}</p>),
      wrap: true,
      cell: (row: any) => row?.country?.county_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.location.stateName}</p>),
      wrap: true,
      cell: (row: any) => row?.state?.state_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.location.districtName}</p>),
      wrap: true,
      cell: (row: any) => row?.district?.district_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.location.taluk}</p>),
      wrap: true,
      width: "120px",
      cell: (row: any) => row?.block?.block_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.location.village}</p>),
      wrap: true,
      cell: (row: any) => row?.village?.village_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.transactionId}</p>),
      wrap: true,
      width: "120px",
      selector: (row: any) => row.id,
    },
    // {
    //   name: (<p className="text-[13px] font-medium">{translations.transactions.totalEstimationProduction}</p>),
    //   wrap: true,
    //   width: "120px",
    //   selector: (row: any) => row.estimated_cotton,
    // },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.quantityPurchased}
        </p>
      ),
      wrap: true,
      selector: (row: any) => {
        const quantityPurchased: any = formatDecimal(row.qty_purchased);
        return Number(quantityPurchased) < 0 ? formatDecimal(0) : quantityPurchased;
      },
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.availableCotton}
        </p>
      ),
      wrap: true,
      selector: (row: any) => {
        const availableCotton: any = formatDecimal(Number(row.farm?.total_estimated_cotton) - Number(row?.farm?.cotton_transacted));
        return Number(availableCotton) < 0 ? 0 : availableCotton;
      },
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.price}</p>),
      wrap: true,
      selector: (row: any) => formatDecimal(row.rate),
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.program}</p>),
      wrap: true,
      cell: (row: any) => row?.program?.program_name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.vehicleNo}</p>),
      wrap: true,
      selector: (row: any) => row.vehicle,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qrProcurement.paymentMethod}</p>),
      wrap: true,
      cell: (row: any) => row?.payment_method,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.ginnerName}</p>),
      wrap: true,
      cell: (row: any) => row?.ginner?.name,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qrProcurement.agent}</p>),
      wrap: true,
      selector: (row: any) => row?.agent?.firstName,
    },
  ];

  if (!roleLoading) {
    return (
      <div>
        {isClient ? (
          <div>
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <p className="text-sm my-2">
                  <span className="font-bold">{translations.common.note}</span> {translations.common.transactionNote}
                </p>
                <div className="table-form ">
                  <div className="table-minwidth w-100">
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
                      {!brandId && (
                        <div className="flex">
                          <div className="search-filter-right">
                            <button
                              className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                              onClick={() => {
                                setShowFilterExport(!showFilterExport);
                              }}
                            >
                              {translations.common.export}
                            </button>
                            <div className="relative">
                              <FilterExport
                                openFilter={showFilterExport}
                                onClose={!showFilterExport}
                              />
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                    {showExportMessage && (
                      <div className="flex justify-end">
                        <p className="text-right text-sm">
                          Note: Export all records will take time based on the
                          speed of internet and total no of records
                        </p>{" "}
                      </div>
                    )}
                    <CommonDataTable
                      columns={columns}
                      count={count}
                      data={data}
                      updateData={updatePage}
                    />
                    <div>
                      <ViewDetailsPopUp
                        onCancel={handleCancel}
                        openPopup={showTransactionPopUp}
                        data={viewData}
                      />
                    </div>
                  </div>
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
}

const ViewDetailsPopUp = ({ openPopup, data, onCancel }: any) => {
  const formatDecimal = (value: string | number): string | number => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (Number.isFinite(numericValue)) {
      const formattedValue = numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2);
      return formattedValue.toString().replace(/\.00$/, '');
    }

    return numericValue;
  };
  const handleCancel = () => {
    onCancel();
  };

  const columns = [
    {
      name: <p className="text-[13px] font-medium">Transaction Id</p>,
      width: "130px",
      wrap: true,
      cell: (row: any) => row.id,
    },
    {
      name: <p className="text-[13px] font-medium">Estimated Cotton</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => row.total_estimated_cotton,
    },
    {
      name: <p className="text-[13px] font-medium">	Quality Purchased</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => formatDecimal(row.qty_purchased),
    },
    {
      name: <p className="text-[13px] font-medium">Available Cotton</p>,
      width: "150px",
      wrap: true,
      cell: (row: any) => formatDecimal(row?.available_cotton) ? formatDecimal(row?.available_cotton) : formatDecimal(0),

    },
  ];
  return (
    <div>
      {openPopup && (
        <div className="flex h-full w-auto z-10 fixed justify-center bg-black bg-opacity-70 top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border h-fit w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3>Transaction Detail</h3>
              <button onClick={handleCancel} className="text-xl">
                &times;
              </button>
            </div>
            <div className="py-2">
              <div className="flex py-2 justify-between border-y">
                <span className="text-sm w-40 mr-8">Farmer Code</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {data[0]?.farmer_code}
                </p>
              </div>

              <div className="flex py-2 justify-between">
                <span className="text-sm mr-8">Farmer Name</span>
                <p className="block w-60 py-1 px-3 text-sm  bg-white">
                  {data[0]?.firstName}
                </p>
              </div>

              <div className="flex py-2 justify-between border-y">
                <span className="text-sm mr-8">Season</span>
                <p className="block w-60 py-1 px-3 mb-3 text-sm  bg-white">
                  {data[0]?.season_name}
                </p>
              </div>

              <DataTable
                persistTableHead
                fixedHeader={true}
                noDataComponent={""}
                fixedHeaderScrollHeight={"500px"}
                columns={columns}
                data={data}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default ProcurementReport
