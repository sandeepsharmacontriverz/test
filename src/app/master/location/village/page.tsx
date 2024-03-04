"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import React from "react";

import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { BiFilterAlt } from "react-icons/bi";
import { useRouter } from "next/navigation";

import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterSuccess, toasterError } from "@components/core/Toaster";
import DeleteConfirmation from "@components/core/DeleteConfirmation";

import useTitle from "@hooks/useTitle";

import API from "@lib/Api";
import useRole from "@hooks/useRole";
import Multiselect from "multiselect-react-dropdown";
import { exportToExcel } from "@components/core/ExcelExporter";

interface TableData {
  id: number;
  block: {
    id: number;
    block_name: string;
    district: {
      id: number;
      district_name: string;
      state: {
        id: number;
        state_name: string;
        country: {
          id: number;
          county_name: string;
        };
      };
    };
  };
  village: string;
  village_name: string;
  village_status: boolean;
  village_id: string;
  village_latitude: string;
  village_longitude: string;
}

interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

const Village: React.FC = () => {
  useTitle("Village");
  const [roleLoading] = useRole();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([]);
  const { translations, loading } = useTranslations();
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editVillage, setEditVillages] = useState<TableData | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [checkedCountries, setCheckedCountries] = React.useState<any>([]);
  const [checkedStates, setCheckedStates] = React.useState<any>([]);
  const [checkedDistricts, setCheckedDistricts] = React.useState<any>([]);
  const [checkedBlocks, setCheckedBlocks] = React.useState<any>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [district, setDistricts] = useState<any>();
  const [block, setBlocks] = useState<any>();

  const [isActive, setIsActive] = useState<any>({
    country: false,
    state: false,
    district: false,
    block: false,
  });

  const [showFilter, setShowFilter] = useState(false);

  const search = searchFilter;
  const [editedFormData, setEditedFormData] = useState<any>({
    selectedCountry: "",
    selectedState: "",
    selectedDistrict: "",
    selectedBlock: "",
    block_status: false,
    village_name: "",
    village_status: "",
    village_longitude: "",
    village_latitude: "",
  });
  const fetchVillages = async () => {
    try {
      const res = await API.get(
        `location/get-villages?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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

  const changeStatus = async (row: any) => {
    const newStatus = !row.village_status;
    const url = "location/update-village-status";
    try {
      const response = await API.put(url, {
        id: row.id,
        status: newStatus,
      });

      if (response.success) {
        fetchVillages();
      }
    } catch (error) {
      console.log(error, "error");
    }
  };


  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      if (checkedCountries.length !== 0) {
        const res = await API.get(
          `location/get-states?countryId=${checkedCountries}`
        );
        if (res.success) {
          setStates(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      if (checkedStates.length !== 0) {
        const res = await API.get(
          `location/get-districts?stateId=${checkedStates}`
        );
        if (res.success) {
          setDistricts(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      if (checkedDistricts.length !== 0) {
        const res = await API.get(
          `location/get-blocks?districtId=${checkedDistricts}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (checkedCountries) {
      getStates();
    }
  }, [checkedCountries]);

  useEffect(() => {
    if (checkedStates) {
      getDistricts();
    }
  }, [checkedStates]);

  useEffect(() => {
    if (checkedDistricts) {
      getBlocks();
    }
  }, [checkedDistricts]);

  useEffect(() => {
    setIsClient(true);
    fetchVillages();
  }, [searchQuery, page, limit]);

  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);
  };

  if (loading) {
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
      sortable: false,
    },
    {
      name: translations.location.countryName,
      selector: (row: TableData) =>
        row.block.district.state.country?.county_name,
      sortable: false,
    },
    {
      name: translations.location.stateName,
      selector: (row: TableData) => row.block.district.state.state_name,
      sortable: false,
    },
    {
      name: translations.location.districtName,
      selector: (row: TableData) => row.block.district.district_name,
      sortable: false,
    },
    {
      name: translations.location.taluk,
      selector: (row: TableData) => row.block.block_name,
      sortable: false,
    },
    {
      name: translations.location.village,
      selector: (row: TableData) => row.village_name,
      sortable: false,
    },
    {
      name: translations.common?.status,
      cell: (row: any) => (
        <button
          onClick={() => changeStatus(row)}
          className={row.village_status ? "text-green-500" : "text-red-500"}
        >
          {row.village_status ? (
            <BsCheckLg size={20} className="mr-4" />
          ) : (
            <RxCross1 size={20} className="mr-4" />
          )}
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
    {
      name: translations.common.action,
      cell: (row: TableData) => (
        <>
          <button
            onClick={() => handleEdit(row)}
            className="bg-green-500 p-2 rounded "
          >
            <LuEdit size={18} color="white" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 p-2 ml-3 rounded"
          >
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const handleEdit = (row: TableData) => {
    setEditVillages(row);

    const {
      block,
      village_name,
      village_status,
      village_latitude,
      village_longitude,
    } = row;

    setEditedFormData({
      id: row.id,
      country: block.district.state.country.id,
      state: block.district.state.id,
      district: block.district.id,
      block_name: block.id,
      village_status: village_status,
      village_name: village_name,
      village_latitude: village_latitude,
      village_longitude: village_longitude,
    });
    setShowEditPopup(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const res = await API.post("location/update-village", {
        id: formData.id,
        blockId: formData.block,
        villageName: formData.village,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess("Record has been updated successfully");
          setShowEditPopup(false);
          fetchVillages();
        }
      }
      else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Village Name already exists' : res.error.code);
        setShowEditPopup(false)
      }
    } catch (error) {
      console.log(error);
      toasterError("An error occurred");
    }

    setShowEditPopup(false);
  };

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };
  const handleCancel = () => {
    // Close the delete confirmation popup and reset deleteItemId
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          country_name: element.block?.district?.state?.country?.county_name,
          state_name: element.block?.district?.state?.state_name,
          district_name: element.block?.district?.district_name,
          block_name: element.block?.block_name,
          village_name: element.village_name,
          village_status: element.village_status
        }
      });
      exportToExcel(dataToExport, "Master-Location-Village Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleChange = (itemId: any, name: string) => {
    if (name === "countries") {
      if (checkedCountries.includes(itemId)) {
        setCheckedCountries(
          checkedCountries.filter((item: any) => item !== itemId)
        );

        // Clear districts for the unselected country
        const stateToClear = states?.filter((dist: any) => {
          return dist?.country_id === itemId;
        });

        setCheckedStates(
          checkedStates.filter((item: any) => {
            const dist = stateToClear.find((dist: any) => dist.id === item);
            return !dist;
          })
        );

        setCheckedDistricts(
          checkedDistricts.filter((item: any) => {
            const list = district.find((obj: any) => obj.id === item);
            const dist = stateToClear.find(
              (dist: any) => dist.id === list?.state_id
            );
            return !dist;
          })
        );

        setCheckedBlocks(
          checkedBlocks.filter((item: any) => {
            const list = block.find((obj: any) => obj.id === item);
            const dist = stateToClear.find(
              (dist: any) => dist.id === list?.district?.state_id
            );
            return !dist;
          })
        );

      } else {
        setCheckedCountries([...checkedCountries, itemId]);
      }
    } else if (name === "states") {
      if (checkedStates.includes(itemId)) {
        setCheckedStates(checkedStates.filter((item: any) => item !== itemId));

        // Clear district for the unselected state
        const districtToClear = district?.filter((dist: any) => {
          return dist?.state_id === itemId;
        });

        setCheckedDistricts(
          checkedDistricts.filter((item: any) => {
            const dist = districtToClear.find((dist: any) => dist.id === item);
            return !dist;
          })
        );

        setCheckedBlocks(
          checkedBlocks.filter((item: any) => {
            const list = block.find((obj: any) => obj.id === item);
            const dist = districtToClear.find(
              (dist: any) => dist.id === list?.district_id
            );
            return !dist;
          })
        );

      } else {
        setCheckedStates([...checkedStates, itemId]);
      }
    } else if (name === "districts") {
      if (checkedDistricts.includes(itemId)) {
        setCheckedDistricts(
          checkedDistricts.filter((item: any) => item !== itemId)
        );

        // Clear block for the unselected district
        const blockToClear = block?.filter((dist: any) => {
          return dist?.district_id === itemId;
        });

        setCheckedBlocks(
          checkedBlocks.filter((item: any) => {
            const dist = blockToClear.find((dist: any) => dist.id === item);
            return !dist;
          })
        );
      } else {
        setCheckedDistricts([...checkedDistricts, itemId]);
      }
    } else if (name === "blocks") {
      if (checkedBlocks.includes(itemId)) {
        setCheckedBlocks(checkedBlocks.filter((item: any) => item !== itemId));
      } else {
        setCheckedBlocks([...checkedBlocks, itemId]);
      }
    }
  };

  const filterData = async () => {
    try {
      const res = await API.get(
        `location/get-villages?search=${searchFilter}&countryId=${checkedCountries}&stateId=${checkedStates}&districtId=${checkedDistricts}&blockId=${checkedBlocks}&limit=${limit}&page=${page}&pagination=true`
      );
      if (res.success) {
        setData(res.data);
        setCount(res.count);
        setShowFilter(false);
      }
    } catch (error) {
      console.log(error);
      setCount(0);
    }
  };

  const clearFilter = () => {
    setCheckedCountries([]);
    setCheckedBlocks([]);
    setCheckedDistricts([]);
    setCheckedStates([]);
    setIsActive({
      country: false,
      state: false,
      district: false,
      block: false,
    });
    setSearchFilter("");
  };

  const FilterPopup = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    return (
      <div>
        {openFilter && (
          <>
            <div ref={popupRef} className="fixPopupFilters flex h-full align-items-center w-auto z-10 fixed justify-center top-3 left-0 right-0 bottom-0 p-3 ">
              <div className="bg-white border w-auto p-4 border-gray-300 shadow-md rounded-md">
                <div className="flex justify-between align-items-center">
                  <h3 className="text-lg pb-2">Filters</h3>
                  <button className="text-[20px]" onClick={() => {
                    setShowFilter(!showFilter)
                  }
                  }>&times;</button>
                </div>
                <div className="w-100 mt-0">
                  <div className="customFormSet">
                    <div className="w-100">
                      <div className="row">
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Country
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="county_name"
                            selectedValues={countries?.filter((item: any) => checkedCountries.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "countries");
                            }}
                            options={countries}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a State
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="state_name"
                            selectedValues={states?.filter((item: any) => checkedStates.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, 'states');
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, 'states');
                            }}
                            options={states}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a District
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="district_name"
                            selectedValues={district?.filter((item: any) => checkedDistricts.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "districts");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "districts");
                            }}
                            options={district}
                            showCheckbox
                          />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3 mt-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Select a Block
                          </label>
                          <Multiselect className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                            displayValue="block_name"
                            selectedValues={block?.filter((item: any) => checkedBlocks.includes(item.id))}
                            onKeyPressFn={function noRefCheck() { }}
                            onRemove={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "blocks");
                            }}
                            onSearch={function noRefCheck() { }}
                            onSelect={(selectedList: any, selectedItem: any) => {
                              handleChange(selectedItem.id, "blocks");
                            }}
                            options={block}
                            showCheckbox
                          />
                        </div>
                      </div>

                      <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                        <section>
                          <button
                            className="btn-purple mr-2"
                            onClick={() => {
                              filterData();
                              setShowFilter(false);
                            }}
                          >
                            APPLY ALL FILTERS
                          </button>
                          <button className="btn-outline-purple" onClick={clearFilter}>CLEAR ALL FILTERS</button>
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

  if (!roleLoading) {
    return (
      <div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            message="Are you sure you want to delete this?"
            onDelete={async () => {
              if (deleteItemId !== null) {
                const url = "location/delete-village";
                try {
                  const response = await API.post(url, {
                    id: deleteItemId,
                  });
                  if (response.success) {
                    toasterSuccess("Record has been deleted successfully");
                    fetchVillages();
                  } else {
                    toasterError(response.error.code, 5000, deleteItemId);
                  }
                } catch (error) {
                  console.log(error, "error");
                  toasterError("An error occurred");
                }
                setShowDeleteConfirmation(false);
                setDeleteItemId(null);
              }
            }}
            onCancel={handleCancel}
          />
        )}
        {showEditPopup && (
          <EditPopup
            onClose={() => setShowEditPopup(false)}
            onSubmit={(formData) => {
              handleSubmit(formData);
            }}
            formData={editedFormData}
          />
        )}
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li>Master</li>
                    <li>Location</li>
                    <li>Village</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form lr-mCustomScrollbar">
                  <div className="table-minwidth ">
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

                        <div className="mt-2">
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
                      <div className="search-filter-right">
                        <button
                          className="btn btn-all btn-purple"
                          onClick={() =>
                            router.push("/master/location/village/add-village")
                          }
                        >
                          {translations.common.add}
                        </button>
                      </div>
                    </div>

                    <div className="flex mt-2 justify-end borderFix pt-2 pb-2">
                      <div className="search-filter-right">
                        <button
                          onClick={handleExport}
                          className="h-100 py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        >
                          {translations.common.export}
                        </button>
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
};

export default Village;

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
  onFieldChange,
}) => {
  const [countries, setCountries] = useState<any>();
  const [states, setStates] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [error, setError] = useState<any>({});

  const [data, setData] = useState<any>({
    id: formData.id,
    country: formData.country,
    state: formData.state,
    district: formData.district,
    block: formData.block_name,
    village: formData.village_name,
    longitude: formData.village_longitude,
    latitude: formData.village_latitude,
  });

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (data.country !== "") {
      getStates();
    }
  }, [data.country]);

  useEffect(() => {
    if (data.state !== "") {
      getDistricts();
    }
  }, [data.state]);

  useEffect(() => {
    if (data.district !== '') {
      getBlocks();
    }
  }, [data.district]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStates = async () => {
    try {
      const res = await API.get(
        `location/get-states?countryId=${data.country}`
      );
      if (res.success) {
        if (data.country !== formData.country) {
          setData((prevData: any) => ({
            ...prevData,
            state: "",
            district: "",
            block: "",
          }));
        }
        setStates(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistricts = async () => {
    try {
      const res = await API.get(`location/get-districts?stateId=${data.state}`);
      if (res.success) {
        // setDistricts(res.data)
        if (data.state !== formData.state) {
          setData((prevData: any) => ({
            ...prevData,
            district: "",
            block: "",
          }));
        }
        setDistricts(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBlocks = async () => {
    try {
      const res = await API.get(
        `location/get-blocks?districtId=${data.district}`
      );
      if (res.success) {
        if (data.district !== formData.district) {
          setData((prevData: any) => ({
            ...prevData,
            block: "",
          }));
        }
        setBlocks(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name == 'country') {
      setStates([]);
      setDistricts([]);
      setBlocks([]);
    } else if (name == 'state') {
      setDistricts([]);
      setBlocks([]);
    } else if (name === 'district') {
      setBlocks([]);
    }

    setData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));

    setError((prevData: any) => ({
      ...prevData,
      [name]: "",
    }));
  };

  const handleErrors = () => {
    let isError = false;

    if (!data.country || data.country === "") {
      setError((prevError: any) => ({
        ...prevError,
        country: "Country is required",
      }));
      isError = true;
    }

    if (!data.state) {
      setError((prevError: any) => ({
        ...prevError,
        state: "State Name is required",
      }));
      isError = true;
    }

    if (!data.district) {
      setError((prevError: any) => ({
        ...prevError,
        district: "District Name is required",
      }));
      isError = true;
    }

    if (!data.block) {
      setError((prevError: any) => ({
        ...prevError,
        block: "Block Name is required",
      }));
      isError = true;
    }

    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(data.village)
    if (!valid || !data.village) {
      if (!data.village) {
        setError((prevError: any) => ({
          ...prevError,
          village: "Village Name is required",
        }))
        isError = true;
      }
      else {
        setError((prevError: any) => ({
          ...prevError,
          village: 'Enter Only Alphabets, Digits, Space, (, ), - and _'
        }));
        isError = true;
      }
    }

    return isError;
  };

  const submit = () => {
    if (handleErrors()) {
      return
    }
    onSubmit(data);
  };

  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-md rounded-md">
        <div className="flex justify-between">
          <h3>Edit Village</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <hr />
        <div className="py-2">
          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Country Name*</span>
            <div>
              <select
                name="country"
                value={data.country}
                onChange={handleChange}
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a country</option>
                {countries?.map((country: any) => (
                  <option key={country.id} value={country.id}>
                    {country.county_name}
                  </option>
                ))}
              </select>
              {error?.country && (
                <div className="text-red-500 text-sm mt-1">{error.country}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">State Name *</span>
            </div>
            <div className="flex-col">
              <select
                name="state"
                value={data.state}
                onChange={handleChange}
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a State</option>
                {states?.map((state: any) => (
                  <option key={state.id} value={state.id}>
                    {state.state_name}
                  </option>
                ))}
              </select>
              {error?.state && (
                <div className="text-red-500 text-sm mt-1">{error.state}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">District Name*</span>
            </div>
            <div className="flex-col">
              <select
                value={data.district}
                onChange={handleChange}
                name="district"
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a District</option>
                {districts?.map((district: any) => (
                  <option key={district.id} value={district.id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
              {error?.district && (
                <div className="text-red-500 text-sm mt-1">
                  {error.district}
                </div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <div>
              <span className="text-sm mr-8">Taluk/Block Name *</span>
            </div>
            <div className="flex-col">
              <select
                value={data.block}
                onChange={handleChange}
                name="block"
                className="w-80 border rounded px-2 py-1 text-sm"
              >
                <option value="">Select a Block Name</option>

                {blocks?.map((block: any) => (
                  <option key={block.id} value={block.id}>{block.block_name}</option>
                ))}
              </select>
              {error?.block && (
                <div className="text-red-500 text-sm mt-1">{error.block}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Village Name*</span>
            <div>
              <input
                type="text"
                name="village"
                onChange={handleChange}
                value={data.village}
                className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
              />
              {error?.village && (
                <div className="text-red-500 text-sm mt-1">{error.village}</div>
              )}
            </div>
          </div>

          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Latitude</span>
            <input
              type="number"
              name="latitude"
              onChange={handleChange}
              value={data.latitude}
              className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
            />
          </div>

          <div className="flex pt-3 justify-between">
            <span className="text-sm mr-8">Longitude</span>
            <input
              type="number"
              name="longitude"
              onChange={handleChange}
              value={data.longitude}
              className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
            />
          </div>
        </div>

        <div className="pt-3 mt-5 flex justify-end border-t">
          <button
            onClick={submit}
            className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
