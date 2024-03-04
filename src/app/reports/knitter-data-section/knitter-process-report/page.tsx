"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { handleDownload } from "@components/core/Download";
import { FaDownload, FaEye } from "react-icons/fa";
import User from "@lib/User";
import API from "@lib/Api";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";
import Multiselect from "multiselect-react-dropdown";
import Loader from "@components/core/Loader";

const KnitterProcessReport: any = () => {
  useTitle("Knitter Process Report");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [dataArray, setDataArray] = useState<Array<string>>([]);

  const [country, setCountry] = useState([]);
  const [season, setSeason] = useState([]);
  const [program, setProgram] = useState([]);
  const [knitter, setKnitter] = useState([]);
  const [fabric, setFabric] = useState([]);
  const [brands, setBrands] = useState([]);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedBrands, setCheckedBrands] = React.useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = React.useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = React.useState<any>([]);
  const [checkedFabric, setCheckedFabric] = React.useState<any>([]);
  const [checkedKnitters, setCheckedKnitters] = React.useState<any>([]);
  const [isClear, setIsClear] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [defaultSeason, setDefaultSeason] = useState<any>(null);

  const brandId = User.brandId;

  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (defaultSeason) {
      fetchSales();
    }
  }, [searchQuery, brandId, isClear, page, limit, defaultSeason]);

  useEffect(() => {
    getCountry();
    getSeason();
    getProgram();
    getBrands();
    getKnitFabric();
  }, [brandId]);

  useEffect(() => {
    getKnitter();
  }, [checkedCountries]);

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataArray(rowData);
    setShowPopup(!showPopup);
  };
  const fetchSales = async () => {
    try {
      const response = await API.get(
        `reports/get-knitter-yarn-process-report?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${checkedKnitters}&fabricType=${checkedFabric}&search=${code}&page=${page}&limit=${limit}&pagination=true`
      );
      if (response.success) {
        const newData = response?.data?.map((item: any, index: number) => ({
          ...item,
          id: index,
          processId: item.id,
        }));
        setData(newData);
        setCount(response.count);
      }
    } catch (error) {
      console.error(error);
      setCount(0)
    }
  };
  const fetchExport = async () => {
    try {
      const res = await API.get(`reports/export-knitter-yarn-process-report?countryId=${checkedCountries}&brandId=${brandId ? brandId : checkedBrands}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&knitterId=${checkedKnitters}&fabricType=${checkedFabric}&search=${code}&page=${page}&limit=${limit}&pagination=true`);
      if (res.success) {
        handleDownload(res.data, "Cotton Connect -Knitter Process Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const getCountry = async () => {
    const url = "location/get-countries";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCountry(res);
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
        setSeason(res)

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
        setBrands(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getKnitter = async () => {
    const url = `knitter?countryId=${checkedCountries?.join(",")}`;
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setKnitter(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getKnitFabric = async () => {
    try {
      const res = await API.get("fabric-type");
      if (res.success) {
        setFabric(res.data);
      }
    } catch (error) {
      console.log(error);
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
      setKnitter([])
      setCheckedKnitters([])
      if (checkedCountries?.includes(itemId)) {
        setCheckedCountries(
          checkedCountries?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "brands") {
      if (checkedBrands?.includes(itemId)) {
        setCheckedBrands(checkedBrands?.filter((item: any) => item !== itemId));
      } else {
        setCheckedBrands([...checkedBrands, itemId]);
      }
    } else if (name === "programs") {
      if (checkedPrograms?.includes(itemId)) {
        setCheckedPrograms(
          checkedPrograms?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedPrograms([...checkedPrograms, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons?.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "knitters") {
      if (checkedKnitters?.includes(itemId)) {
        setCheckedKnitters(
          checkedKnitters?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedKnitters([...checkedKnitters, itemId]);
      }
    }
    else if (name === "fabrics") {
      if (checkedFabric?.includes(itemId)) {
        setCheckedFabric(
          checkedFabric?.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedFabric([...checkedFabric, itemId]);
      }
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedKnitters([]);
    setCheckedPrograms([]);
    setCheckedBrands([]);
    setCheckedSeasons([]);
    setCheckedFabric([]);
    setIsClear(!isClear);
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
                            // id="programs"
                            displayValue="brand_name"
                            selectedValues={brands?.filter((item: any) =>
                              checkedBrands?.includes(item.id)
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
                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectProgram}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedPrograms?.includes(item.id)
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
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectCountry}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="county_name"
                          selectedValues={country?.filter((item: any) =>
                            checkedCountries?.includes(item.id)
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
                          Select a Knitter
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={knitter?.filter((item: any) =>
                            checkedKnitters?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "knitters",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "knitters"
                            )
                          }
                          options={knitter}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-3 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          {translations.common.SelectSeason}
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="name"
                          selectedValues={season?.filter((item: any) =>
                            checkedSeasons?.includes(item.id)
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
                          Select Fabric
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="fabricType_name"
                          selectedValues={fabric?.filter((item: any) =>
                            checkedFabric?.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabrics",
                              true
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleFilterChange(
                              selectedList,
                              selectedItem,
                              "fabrics"
                            )
                          }
                          options={fabric}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchSales();
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


  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /> </div>;
  }

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

  const DocumentPopup = ({ openFilter, dataArray, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const fileName = (item: any) => {
      let file = item.split("file/")
      return file ? file[1] : ""
    }
    const columnsArr: any = [
      {
        name: (<p className="text-[13px] font-medium">S. No</p>),
        width: "70px",
        cell: (row: any, index: any) => index + 1,
      },
      {
        name: (<p className="text-[13px] font-medium">File</p>),
        cell: (row: any, index: any) => fileName(row),
      },
      {
        name: (<p className="text-[13px] font-medium">Action</p>),
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
                onClick={() => handleDownloadData(row, "Blend Document")}
              />
            </div>

          </>
        ),
        center: true,
        wrap: true
      }
    ]

    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters fixWidth flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Blending Material Other Documents</h3>
                  <button
                    className="text-[20px]"
                    onClick={() => setShowPopup(!showPopup)}
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
                          noDataComponent={<p className="py-3 font-bold text-lg">No data available in table</p>}
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
    )
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
      name: (<p className="text-[13px] font-medium">{translations.common.srNo} </p>),
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.qualityParameter.dateProcess}</p>),
      selector: (row: any) => row?.createdAt?.substring(0, 10),
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.transactions.date}</p>),
      selector: (row: any) => row?.date?.substring(0, 10),
      wrap: true
    },
    {
      name: (<p className="text-[13px] font-medium">{translations.knitterInterface.knitname}</p>),
      selector: (row: any) => row?.knitter?.name,
    },
    // {
    //   name: (<p className="text-[13px] font-medium">{translations.transactions.season} </p>),
    //   selector: (row: any) => row?.season?.name,
    // },
    {
      name: (<p className="text-[13px] font-medium"> {translations.knitterInterface.GarmentOrderReference} </p>),
      selector: (row: any) => row?.garment_order_ref,
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium">{translations.knitterInterface.BrandOrderReference} </p>),
      selector: (row: any) => row?.brand_order_ref,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium"> {translations.knitterInterface.rolls} </p>,
      selector: (row: any) => row?.no_of_rolls,
      wrap: true,
    },
    // {
    //   name: <p className="text-[13px] font-medium"> Fabric Lot No </p>,
    //   selector: (row: any) => row?.fabric_lot_no,
    //   wrap: true,
    // },
    {
      name: (<p className="text-[13px] font-medium">{translations.knitterInterface.FinishedBatch} </p>),
      selector: (row: any) => row?.batch_lot_no,
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.fabricType} </p>),
      selector: (row: any) => row?.fabricType,
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium"> {translations.knitterInterface.FinishedFabricNetWeight} </p>),
      selector: (row: any) => formatDecimal(row?.fabricWeight),
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium">{translations.knitterInterface.FinishedFabricGSM} </p>),
      selector: (row: any) => row?.fabricGsm,
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium">{translations.knitterInterface.JobDetailsfromgarments} </p>),
      selector: (row: any) => row?.job_details_garment,
      wrap: true

    },
    {
      name: <p className="text-[13px] font-medium">Total Yarn Utilized</p>,
      cell: (row: any) => formatDecimal(row?.total_yarn_qty),
    },
    {
      name: (<p className="text-[13px] font-medium">Total fabric net Weight</p>),
      selector: (row: any) => formatDecimal(row?.total_fabric_weight),
      wrap: true

    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.knitterInterface?.Blendingmaterial}</p>),
      cell: (row: any) =>
        row?.blend_document && row?.blend_document.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleFilter(row?.blend_document)}
              title="Click to View All Files"
            />
          </>
        )
    },
    {
      name: translations?.ginnerInterface?.qrCode,
      center: true,
      cell: (row: any) => row?.qr && (
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
      <>
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
                    <div className="flex">
                      <div className="search-filter-right">
                        <button
                          className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                          onClick={() => {
                            fetchExport();
                          }}
                        >
                          {translations.common.export}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <DocumentPopup openFilter={showPopup} dataArray={dataArray} onClose={() => setShowPopup(false)} />

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
      </>
    );
  }
}

export default KnitterProcessReport;

