"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import CommonDataTable from "@components/core/Table";
import useTranslations from "@hooks/useTranslation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import DeleteConfirmation from "@components/core/DeleteConfirmation";
import { exportToExcel } from "@components/core/ExcelExporter";


const Edit = ({ openPopup, onCancel, editId, defaultValue, getItems }: any) => {
  const [unitType, setUnitType] = useState<any>('');
  const [errors, setErrors] = useState({
    name: ''
  })
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUnitType(value)
    setErrors({
      name: ''
    });
  };

  const handleCancel = () => {
    onCancel()
    setErrors({
      name: ''
    });
    setUnitType(defaultValue)
  };

  const handleSubmit = async () => {
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(unitType);
    if (!unitType || !valid) {
      if (!unitType) {
        setErrors((prevError) => ({
          ...prevError,
          name: "Unit Type is required",
        }));
      } else {
        setErrors((prevError) => ({
          ...prevError,
          name: "Enter Only Alphabets, Digits, Space, (, ), - and _",
        }));
      }
    } else {
      const url = "unit/unit-type"
      try {
        const response = await API.put(url, {
          "id": editId,
          "unitType": unitType
        })
        if (response.success) {
          toasterSuccess('Record has been updated successfully')
          setUnitType('')
          getItems()
          onCancel()
        }
        else {
          toasterError(response.error.code === 'ALREADY_EXITS' ? 'Unit Type already exist' : response.error.code);
          onCancel()
        }
      }
      catch (error) {
        console.log(error, "error")
      }
    }
  };

  useEffect(() => {
    setUnitType(defaultValue)
  }, [defaultValue])

  return (
    <div>
      {openPopup && (
        <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
          <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
            <div className="flex justify-between">
              <h3
              >Edit Unit Type </h3>
              <button
                onClick={handleCancel}
              >
                &times;
              </button>
            </div>
            <hr />
            <div className="py-2">

              <div className="flex py-3 justify-between">
                <span className="text-sm mr-8">Unit Type Name * </span>
                <div>
                  <input
                    type="text"
                    id="unitType"
                    name="unitType"
                    value={unitType}
                    onChange={handleInputChange}
                    className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                    placeholder='Unit Type Name'
                  />
                  {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-5 flex justify-end border-t">
              <button
                onClick={handleSubmit}
                className="bg-green-500 mr-2 text-sm text-white font-bold py-2 px-4 rounded border"
              >
                Submit
              </button>
              <button
                onClick={handleCancel}
                className="mr-2 bg-gray-200 text-sm font-bold py-2 px-4 rounded border"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const unittype: React.FC = () => {
  useTitle("Unit Type");
  const [roleLoading] = useRole();
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const [data, setData] = useState([])
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [editVisible, setEditVisible] = useState(false);
  const [editId, setEditId] = useState<any>(null);
  const [editDefault, setEditDefault] = useState<string>('')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);



  useEffect(() => {
    setIsClient(true);
  }, []);


  const getUnitTypes = async () => {
    const url = `unit/unit-type?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
    try {
      const response = await API.get(url)
      setData(response.data)
      setCount(response.count)
    }
    catch (error) {
      console.log(error, "error")
      setCount(0)
    }
  };


  const editHandle = (row: any) => {
    setEditId(row.id)
    setEditDefault(row.unitType)
    setEditVisible(true)

  }
  const handleCancel = () => {
    setEditVisible(false)
    setShowDeleteConfirmation(false)
  }

  const handleDelete = async (id: number) => {
    setDeleteItemId(id);
    setShowDeleteConfirmation(true)
  };

  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          unitType: element.unitType,
          unitType_status: element.unitType_status
        }
      });
      exportToExcel(dataToExport, "Master-Unit-Type Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }

  const changeStatus = async (row: any) => {
    const newStatus = !row.unitType_status;
    const url = "unit/unit-type-status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        getUnitTypes()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }

  useEffect(() => {
    getUnitTypes()
  }, [searchQuery, page, limit]);

  const { translations, loading } = useTranslations();
  if (loading) {
    return <div> Loading translations...</div>;
  }

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
    },
    {
      name: translations.unit.unitTypeName,
      cell: (row: any) => row.unitType,
      sortable: false,
    },
    {
      name: translations.common.status,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.unitType_status ? "text-green-500" : "text-red-500"}>
          {row.unitType_status ? (
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
      cell: (row: any) => (
        <>
          <button className="bg-green-500 p-2 rounded" onClick={() => editHandle(row)}>
            <LuEdit size={18} color="white" />
          </button>
          <button className="bg-red-500 p-2 ml-3 rounded" onClick={() => handleDelete(row.id)}>
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading) {
    return (
      <div>

        {isClient ? (
          <>
            <section className="right-content">
              <div className="right-content-inner">
                {/* breadcrumb */}
                <div className="breadcrumb-box">
                  <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                      <ul className="breadcrum-list-wrap">
                        <li className="active">
                          <Link href="/dashboard">
                            <span className="icon-home"></span>
                          </Link>
                        </li>
                        <li>Master</li>
                        <li>Unit</li>
                        <li>Unit Type</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* farmgroup start */}
                <div className="farm-group-box">
                  <div className="farm-group-inner">
                    <div className="table-form ">
                      <div className="table-minwidth min-w-[650px]">
                        {/* search */}
                        <div className="search-filter-row">
                          <div className="search-filter-left ">
                            <div className="search-bars">
                              <form className="form-group mb-0 search-bar-inner">
                                <input
                                  type="text"
                                  className="form-control form-control-new jsSearchBar "
                                  placeholder="Search by Unit Type"
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
                              className="btn btn-all btn-purple"
                              onClick={() => router.push("/master/unit/unit-type/add-unit-type")}
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

                        <CommonDataTable columns={columns} data={data} count={count} updateData={updatePage} />

                        <div>
                          <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultValue={editDefault} getItems={getUnitTypes} />
                        </div>
                        {showDeleteConfirmation && (
                          <DeleteConfirmation
                            message="Are you sure you want to delete this?"
                            onDelete={async () => {
                              if (deleteItemId !== null) {
                                const url = "unit/unit-type"
                                try {
                                  const response = await API.delete(url, {
                                    id: deleteItemId
                                  })
                                  if (response.success) {
                                    toasterSuccess('Record has been deleted successfully')
                                    getUnitTypes()
                                  } else {
                                    toasterError(response.error.code, 5000, deleteItemId);
                                  }
                                }
                                catch (error) {
                                  console.log(error, "error")
                                  toasterError('An error occurred');
                                }
                                setShowDeleteConfirmation(false);
                                setDeleteItemId(null);
                              }
                            }}
                            onCancel={handleCancel}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          'Loading...'
        )}
      </div>
    )
  }
};

export default unittype;
