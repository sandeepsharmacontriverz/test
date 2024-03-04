"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect, useRef } from "react";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import NavLink from "@components/core/nav-link";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import moment from "moment";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import { BiFilterAlt } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import checkAccess from "@lib/CheckAccess";
import Loader from "@components/core/Loader";
import { LuEdit } from "react-icons/lu";

export default function Page() {
  useTitle("Process");
  const [roleLoading, hasAccesss] = useRole();
  const router = useRouter();
  const [Access, setAccess] = useState<any>({});

  const spinnerId = User.spinnerId;

  const [isClient, setIsClient] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [data, setData] = useState<any>([]);
  const [cottonMix, setCottonMix] = useState<any>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedPrograms, setCheckedPrograms] = useState<any>([]);
  const [seasons, setSeasons] = useState<any>();
  const [programs, setProgram] = useState<any>();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

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
      const access = checkAccess("Spinner Process");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccesss]);

  useEffect(() => {
    getCottonMix();
    setIsClient(true);
    getSeasons();
  }, []);

  useEffect(() => {
    if (spinnerId) {
      fetchProcesses();
      getPrograms();
    }
  }, [searchQuery, page, limit, isClear, spinnerId]);

  const fetchProcesses = async () => {
    try {
      const res = await API.get(
        `spinner-process?spinnerId=${spinnerId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const fetchExport = async () => {
    try {
      const res = await API.get(
        `spinner-process/export?spinnerId=${spinnerId}&seasonId=${checkedSeasons}&programId=${checkedPrograms}&limit=${limit}&page=${page}&search=${searchQuery}`
      );
      if (res.success) {
        handleDownload(res.data, "Process Report", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dateFormatter = (date: any) => {
    const formatted = moment(date).format("DD-MM-YYYY");
    return formatted;
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

  const getCottonMix = async () => {
    const url = "cottonmix";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        setCottonMix(res);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleCancel = () => {
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const getBlendNames = (ids: any) => {
    const matchId = cottonMix
      ?.filter((cottonMix: any) => ids?.includes(cottonMix.id))
      .map((item: any) => item.cottonMix_name);
    const getId = matchId.map((cottonMix: any) => cottonMix);
    return getId?.join(", ");
  };

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div>  <Loader /></div>;
  }
  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.date}
        </p>
      ),
      cell: (row: any) => dateFormatter(row.date),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.season}
        </p>
      ),
      selector: (row: any) => row.season.name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.spinlotNo}
        </p>
      ),
      selector: (row: any) => row.batch_lot_no,
      wrap: true,
      cell: (row: any) => (
        hasAccesss?.view ? (
          <NavLink
            href={`/spinner/spinner-process/edit-process?id=${row.id}`}
            className="text-blue-500"
          >
            {row?.batch_lot_no}
          </NavLink>
        ) : (
          <span className="text-black-500">
            {row?.batch_lot_no}
          </span>
        )
      ),
    },

    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnType}
        </p>
      ),
      selector: (row: any) => row.yarn_type,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnCount}
        </p>
      ),
      selector: (row: any) => row.yarncount?.map((item: any) => item.yarnCount_name)?.join(', '),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnRealistation}
        </p>
      ),
      selector: (row: any) => row.yarn_realisation,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.blend}
        </p>
      ),
      selector: (row: any) => getBlendNames(row.cottonmix_type),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.blendQuantity}
        </p>
      ),
      selector: (row: any) => row.cottonmix_qty?.join(", "),
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.yarnWeight}
        </p>
      ),
      selector: (row: any) => row.net_yarn_qty,
      wrap: true,
      width: "120px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.transactions.program}
        </p>
      ),
      selector: (row: any) => row.program.program_name,
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.spinnerInterface.totalLintCottonConsumed}
        </p>
      ),
      selector: (row: any) => row.total_qty,
      wrap: true,
      width: "130px",
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.ginnerInterface.qrCode}
        </p>
      ),
      cell: (row: any) => (
        <>
          <img
            className=" w-20 h-16"
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
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.common.action}
        </p>
      ),
      cell: (row: any) => (
        <>
          {/* <button
            className="bg-green-500 p-2 rounded "
            onClick={() => router.push(`/spinner/spinner-process/edit-spinner-process?id=${row.id}`)}
          >
            <LuEdit size={18} color="white" />
          </button> */}

          {isAdmin && (
            <button
              onClick={() => handleDelete(row.id)}
              className="bg-red-500 p-2 ml-3 rounded"
            >
              <AiFillDelete size={18} color="white" />
            </button>
          )}
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    }

  ].filter(Boolean);
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const clearFilter = () => {
    setCheckedPrograms([]);
    setCheckedSeasons([]);
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
    }
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
                  onClick={() => setShowFilter(!showFilter)}
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
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchProcesses();
                            setShowFilter(false);
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
      <div className="">
        {isClient ? (
          <div>
            {showDeleteConfirmation && (
              <DeleteConfirmation
                message="Are you sure you want to delete this?"
                onDelete={async () => {
                  if (deleteItemId !== null) {
                    const url = "spinner-process";
                    try {
                      const response = await API.delete(url, {
                        id: deleteItemId,
                      });
                      if (response.success) {
                        toasterSuccess("Record has been deleted successfully");
                        fetchProcesses();
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
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <NavLink href="/spinner/dashboard" className="active">
                        <span className="icon-home"></span>
                      </NavLink>
                    </li>
                    <li>Process</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
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
                            FILTERS <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopup
                              openFilter={showFilter}
                              onClose={!showFilter}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="search-filter-right">
                          <button
                            className="py-[7px] px-4 rounded-[8px] bg-yellow-500 text-white font-bold text-sm"
                            onClick={fetchExport}
                          >
                            {translations.spinnerInterface.processReport}
                          </button>
                        </div>
                        {Access.create &&
                          <div className="search-filter-right">
                            <button
                              className="btn btn-all btn-purple"
                              onClick={() =>
                                router.push(
                                  "/spinner/spinner-process/add-spinner-process"
                                )
                              }
                            >
                              {translations.spinnerInterface.newProcess}
                            </button>
                          </div>
                        }
                      </div>
                    </div>

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
        ) : (
          "Loading..."
        )}
      </div>
    );
  }
}
