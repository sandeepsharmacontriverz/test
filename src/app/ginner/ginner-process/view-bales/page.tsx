"use client";
import { useRouter } from "@lib/router-events";
import { useState, useEffect } from "react";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "@components/core/nav-link";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import { useSearchParams } from "next/navigation";
import DataTable from "react-data-table-component";
import Loader from "@components/core/Loader";

export default function Page() {
  useTitle("View Bales");
  const [roleLoading, hasAccess] = useRole();
  const router = useRouter();
  const search = useSearchParams();
  const id = search.get("id");

  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState<any>([]);
  const { translations, loading } = useTranslations();
  
  useEffect(() => {
    fetchBaleProcesses();
    setIsClient(true);
  }, []);

  const fetchBaleProcesses = async () => {
    try {
      const res = await API.get(`ginner-process/fetch-bale?processId=${id}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };



  const columns = [
    {
      name: (<p className="text-[13px] font-medium">{translations?.common?.srNo}</p>),
      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium">{translations?.ginnerInterface?.baleNo}</p>),
      selector: (row: any) => row.bale_no,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations?.ginnerInterface?.weight}</p>),
      selector: (row: any) => row.weight,
      sortable: false,
    },
    {
      name: (<p className="text-[13px] font-medium"> {translations?.ginnerInterface?.qrCode} </p>),
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
                "qr",
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
  ];

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !hasAccess?.processor.includes("Ginner")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor.includes("Ginner")) {
    return (
      <div className="">
        {isClient ? (
          <div>
            {/* breadcrumb */}
            <div className="breadcrumb-box">
              <div className="breadcrumb-inner light-bg">
                <div className="breadcrumb-left">
                  <ul className="breadcrum-list-wrap">
                    <li>
                      <Link href="/ginner/dashboard" className="active">
                        <span className="icon-home"></span>
                      </Link>
                    </li>
                    <li><Link href="/ginner/ginner-process">Process</Link></li>
                    <li>View Bales</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* farmgroup start */}
            <div className="farm-group-box">
              <div className="farm-group-inner">
                <div className="table-form">
                  <div className="table-minwidth w-100">
                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="search-bars">
                          <label className="text-md font-bold">
                            {translations?.ginnerInterface?.baleLotNo}:
                          </label>{" "}
                          <span className="text-sm">
                            {data ? data[0]?.ginprocess?.lot_no : ""}
                          </span>
                        </div>
                      </div>
                      <div className="customButtonGroup">
                        <button
                          className="btn-outline-purple"
                          onClick={() => router.push("/ginner/ginner-process")}
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                    <div className="items-center rounded-lg overflow-hidden border border-grey-100">
                      <DataTable
                        persistTableHead
                        fixedHeader={true}
                        noDataComponent={
                          <p className="py-3 font-bold text-lg">
                            No data available in table
                          </p>
                        }
                        fixedHeaderScrollHeight="auto"
                        paginationServer
                        columns={columns}
                        data={data}
                        sortServer
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
