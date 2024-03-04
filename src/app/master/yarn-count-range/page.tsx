"use client"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Link from "next/link";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import CommonDataTable from '@components/core/Table';
import useTranslations from '@hooks/useTranslation';
import User from '@lib/User';
import DeleteConfirmation from '@components/core/DeleteConfirmation';
import { toasterError, toasterSuccess } from '@components/core/Toaster';
import API from '@lib/Api';
import useTitle from '@hooks/useTitle';
import { exportToExcel } from '@components/core/ExcelExporter';

interface TableData {
  id: number;
  yarnCount_name: string;
  yarnCount_status: boolean;
}
interface EditPopupProps {
  onClose: () => void;
  onSubmit: (formData?: any) => void;
  formData?: any;
  onFieldChange?: (name: string, value: string) => void;
}

export default function Page({ params }: { params: { slug: string } }) {
  useTitle("Yarn Count Range")

  const [isClient, setIsClient] = useState(false)
  const [data, setData] = useState<TableData[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [count, setCount] = useState<any>()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [editedFormData, setEditedFormData] = useState<any>({
    name: "",
  });
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const router = useRouter();


  useEffect(() => {
    fetchYarnCount();
    setIsClient(true)

  }, [searchQuery, page, limit])
  const fetchYarnCount = async () => {
    try {
      // const url = `farm/farm-item?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
      const res = await API.get(`yarncount?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`);

      if (res.success) {
        setData(res.data)
        setCount(res.count)

      }
    } catch (error) {
      console.log(error)
      setCount(0)
    }
  }

  const fetchUserData = async (page: number, rowsPerPage: number) => {
    //Add api here
    return { data: [], total: 5 }
  };

  useEffect(() => {
    User.role()
  }, [])
  const { translations, loading } = useTranslations();
  if (loading) {
    // You can render a loading spinner or any other loading indicator here
    return <div> Loading translations...</div>;
  }
  const changeStatus = async (row: any) => {
    const newStatus = !row.yarnCount_status;
    const url = "yarncount/status"
    try {
      const response = await API.put(url, {
        "id": row.id,
        "status": newStatus
      })
      if (response.success) {
        fetchYarnCount()
      }
    }
    catch (error) {
      console.log(error, "error")
    }
  }
  const handleEdit = (row: any) => {
    setShowEditPopup(true);
    setEditedFormData(row);
  }
  const handleSubmit = async (formData: { [yarnCountName: string]: string }) => {
    try {
      const res = await API.put("yarncount", {

        id: formData.id,
        yarnCountName: formData.yarnCount_name,
      });

      if (res.success) {
        if (res.data) {
          toasterSuccess('Record has been updated successfully');
          setShowEditPopup(false)
          fetchYarnCount();
        }
      }
      else {
        toasterError(res.error.code === 'ALREADY_EXITS' ? 'Yarn Count List already exist' : res.error.code);
        setShowEditPopup(false)
      }
    } catch (error) {
      console.log(error);
      toasterError('An error occurred');
    }

    setShowEditPopup(false);
  };

  const columns = [
    {
      name: translations.common.srNo,
      cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
      sortable: false,
    },
    {
      name: translations.YarnCountRange,
      selector: (row: TableData) => row.yarnCount_name,
      sortable: false,
    },
    {
      name: translations.common.status,
      cell: (row: any) => (
        <button onClick={() => changeStatus(row)} className={row.yarnCount_status ? "text-green-500" : "text-red-500"}>
          {row.yarnCount_status ? (
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
          <button className="bg-green-500 p-2 rounded " onClick={() => handleEdit(row)}>
            <LuEdit
              size={18}
              color="white"
            />
          </button>

          <button onClick={() => handleDelete(row.id)} className="bg-red-500 p-2 ml-3 rounded">
            <AiFillDelete size={18} color="white" />
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];
  const searchData = (e: any) => {
    setSearchQuery(e.target.value);
  }

  const handleExport = () => {
    if (data.length > 0) {
      const dataToExport = data.map((element: any, index: number) => {
        return {
          srNo: ((page - 1) * limit) + index + 1,
          YarnCountRange: element.yarnCount_name,
          yarnCount_status: element.yarnCount_status,
        }
      });
      exportToExcel(dataToExport, "Master-Yarn-Count-Range Data");
    } else {
      toasterError("Nothing to export!");
    }
  }

  const handleCancel = () => {
    // Close the delete confirmation popup and reset deleteItemId
    setShowDeleteConfirmation(false);
    setDeleteItemId(null);
  };
  const handleDelete = async (id: number) => {
    setShowDeleteConfirmation(true);
    setDeleteItemId(id);


  };
  const handleSearchSubmit = (event: any) => {
    event.preventDefault();
  };
  const updatePage = (page: number = 1, limitData: number = 10) => {
    setPage(page)
    setLimit(limitData)
  }
  return (
    <div >
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this?"
          onDelete={async () => {
            if (deleteItemId !== null) {
              const url = "yarncount"
              try {
                const response = await API.delete(url, {
                  id: deleteItemId
                })
                if (response.success) {
                  toasterSuccess('Record has been deleted successfully')
                  fetchYarnCount()
                } else {
                  toasterError('Failed to delete record');
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

      {showEditPopup && (
        <EditPopup
          onClose={() => setShowEditPopup(false)}
          onSubmit={handleSubmit}
          formData={editedFormData}
        />
      )}

      {isClient ?
        (
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
                        <li>Yarn Count Range</li>

                      </ul>
                    </div>
                  </div>
                </div>

                {/* farmgroup start */}
                <div className="farm-group-box">
                  <div className="farm-group-inner">
                    <div className="table-form lr-mCustomScrollbar">
                      <div className="table-minwidth min-w-[650px]">
                        {/* search */}
                        <div className="search-filter-row">
                          <div className="search-filter-left ">
                            <div className="search-bars">
                              <form className="form-group mb-0 search-bar-inner" onSubmit={handleSearchSubmit}>
                                <input
                                  type="text"
                                  className="form-control form-control-new jsSearchBar "
                                  placeholder="Search by Yarn Count Range"
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
                              onClick={() => router.push("/master/yarn-count-range/add-yarn-count")}
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

                        <table className="table custom-tables">
                          <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </>
        )
        : 'Loading...'}
    </div>
  );
}

const EditPopup: React.FC<EditPopupProps> = ({
  onClose,
  onSubmit,
  formData,
}) => {

  const [data, setData] = useState<any>({
    id: formData?.id || 0,
    yarnCount_name: formData?.yarnCount_name || "",
  })
  const [errors, setErrors] = useState({
    name: ''
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setData((prevData: any) => ({
      ...prevData,
      [name]: value
    }));
    setErrors({
      name: ''
    });
  };

  const handleSubmit = () => {
    const updatedFormData = {
      ...formData,
      yarnCount_name: data.yarnCount_name,
    };
    const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
    const valid = regex.test(updatedFormData.yarnCount_name);
    if (!updatedFormData.yarnCount_name || !valid) {
      setErrors((prevError) => ({
        ...prevError,
        name: !updatedFormData.yarnCount_name ? "Yarn Count is required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
      }));
    } else {
      onSubmit(updatedFormData)
    }
  };
  return (
    <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
      <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
        <div className="flex justify-between">
          <h3
          >Edit Yarn Count Range </h3>
          <span
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:text-black-500"
          >
            &times;
          </span>
        </div>
        <hr />
        <div className="mb-4 flex">
          <label className="block mb-1 font-medium text-sm">Yarn Count Range:</label>
          <div>
            <input
              type="text"
              name="yarnCount_name"
              onChange={handleChange}
              value={data.yarnCount_name}
              className="w-full p-1 border rounded-md text-sm ml-4"
            />
            {errors.name && <p className="text-red-500 ml-4 text-sm mt-1">{errors.name}</p>}
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
