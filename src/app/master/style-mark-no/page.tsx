"use client";
import { useState, useEffect } from "react";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { LuEdit } from "react-icons/lu";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";
import CommonDataTable from "@components/core/Table";
import { toasterSuccess, toasterError } from '@components/core/Toaster'
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import Link from "next/link";
import DeleteConfirmation from "@components/core/DeleteConfirmation";

const StyleMarkNo: any = () => {
    useTitle("Style Mark No");
    const [roleLoading] = useRole();
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [data, setData] = useState([])
    const [count, setCount] = useState<any>()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [searchQuery, setSearchQuery] = useState('')
    const [editVisible, setEditVisible] = useState(false);
    const [editId, setEditId] = useState<any>(null);
    const [editStyleMarkNo, seteditStyleMarkNo] = useState<string>('')
    const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        getStyleMArk()
    }, [searchQuery, page, limit]);


    const getStyleMArk = async () => {
        const url = `style-mark?limit=${limit}&page=${page}&search=${searchQuery}&pagination=true`
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
        seteditStyleMarkNo(row.style_mark_no)
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

    const updatePage = (page: number = 1, limitData: number = 10) => {
        setPage(page)
        setLimit(limitData)
    }

    const changeStatus = async (row: any) => {
        const newStatus = !row.status;
        const url = "style-mark/status"
        try {
            const response = await API.put(url, {
                "id": row.id,
                "status": newStatus
            })
            if (response.success) {
                getStyleMArk()
            }
        }
        catch (error) {
            console.log(error, "error")
        }
    }



    const { translations, loading } = useTranslations();
    if (loading) {
        return <div> Loading translations...</div>;
    }

    const columns = [
        {
            name: (<p className="text-[13px] font-medium">{translations.common.srNo}</p>),
            cell: (row: any, index: any) => ((page - 1) * limit) + index + 1,
        },
        {
            name: (<p className="text-[13px] font-medium">Style Mark No</p>),
            cell: (row: any) => row.style_mark_no,
        },

        {
            name: (<p className="text-[13px] font-medium">{translations.common.status}</p>),
            cell: (row: any) => (
                <button onClick={() => changeStatus(row)}
                    className={row.status ? "text-green-500" : "text-red-500"}>
                    {row.status ? (
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
            name: (<p className="text-[13px] font-medium">{translations.common.action}</p>),
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
            <div >
                {isClient ? (
                    <>
                        <section className="right-content">
                            <div className="right-content-inner">
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
                                                <li>Style Mark No</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="farm-group-box">
                                    <div className="farm-group-inner">
                                        <div>
                                            <div className="table-minwidth min-w-[650px]">
                                                <div className="search-filter-row">
                                                    <div className="search-filter-left ">
                                                        <div className="search-bars">
                                                            <form className="form-group mb-0 search-bar-inner">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-new jsSearchBar "
                                                                    placeholder="Search by Style Mark No"
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
                                                            onClick={() => router.push("/master/style-mark-no/add-style-mark")}
                                                        >
                                                            {translations.common.add}
                                                        </button>
                                                    </div>
                                                </div>

                                                <CommonDataTable columns={columns} count={count} data={data} updateData={updatePage} />
                                                <div>
                                                    <Edit openPopup={editVisible} onCancel={handleCancel} editId={editId} defaultStyleMark={editStyleMarkNo} getItems={getStyleMArk} />
                                                </div>

                                                {showDeleteConfirmation && (
                                                    <DeleteConfirmation
                                                        message="Are you sure you want to delete this?"
                                                        onDelete={async () => {
                                                            if (deleteItemId !== null) {
                                                                const url = "style-mark"
                                                                try {
                                                                    const response = await API.delete(url, {
                                                                        id: deleteItemId
                                                                    })
                                                                    if (response.success) {
                                                                        toasterSuccess('Record has been Deleted Successfully')
                                                                        getStyleMArk()
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="w-full min-h-screen flex justify-center items-center">
                        <span>Processing...</span>
                    </div>
                )}
            </div>
        )
    }
};

export default StyleMarkNo;

const Edit = ({ openPopup, onCancel, editId, defaultStyleMark, getItems }: any) => {
    const [styleMarkNo, setStyleMarkNo] = useState<any>('');
    const [errors, setErrors] = useState({
        name: ''
    })
    useEffect(() => {
        setStyleMarkNo(defaultStyleMark)
    }, [defaultStyleMark])

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setStyleMarkNo(value)
        setErrors({
            name: ''
        });
    };

    const handleCancel = () => {
        onCancel()
        setErrors({
            name: ''
        });
        setStyleMarkNo(defaultStyleMark)
    };


    const handleSubmit = async () => {
        const regex: any = /^[\(\)_\-a-zA-Z0-9\s]+$/;
        const valid = regex.test(styleMarkNo);
        if (!styleMarkNo || !valid) {
            setErrors((prevError) => ({
                ...prevError,
                name: !styleMarkNo ? "Style Mark No is Required" : "Enter Only Alphabets, Digits, Space, (, ), - and _",
            }));
        } else {
            const url = "style-mark"
            try {
                const response = await API.put(url, {
                    "id": editId,
                    "name": styleMarkNo
                })
                if (response.success) {
                    getItems()
                    onCancel()
                    toasterSuccess('Record has been updated successfully')

                }
                else {
                    toasterError(response.error.code === 'ALREADY_EXITS' ? 'Style Mark No already exist' : response.error.code);
                    onCancel()
                }
            }
            catch (error) {
                console.log(error, "error")
            }
        }
    };

    return (
        <div>
            {openPopup && (
                <div className=" flex h-fit w-auto z-10 fixed justify-center bg-transparent top-3 left-0 right-0 bottom-0 p-3 ">
                    <div className="bg-white border w-auto py-3 px-5 border-gray-300 shadow-lg rounded-md">
                        <div className="flex justify-between">
                            <h3
                            >Edit Style Mark No </h3>
                            <button
                                onClick={handleCancel}
                            >
                                &times;
                            </button>
                        </div>
                        <hr />
                        <div className="py-2">

                            <div className="flex py-3 justify-between">
                                <span className="text-sm mr-8">Style Mark No * </span>
                                <div>
                                    <input
                                        type="text"
                                        id="styleMarkNo"
                                        name="styleMarkNo"
                                        value={styleMarkNo}
                                        onChange={handleInputChange}
                                        className="block w-80 py-1 px-3 text-sm border border-gray-300 bg-white rounded-md"
                                        placeholder='Style Mark No'
                                    />
                                    {errors.name && <p className="text-red-500  text-sm mt-1">{errors.name} </p>}
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