"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import CommonDataTable from "@components/core/Table";
import { BiFilterAlt } from "react-icons/bi";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import BarChart from "@components/charts/BarChart";
import Accordian from "@components/core/Accordian";
import { FaDownload, FaEye } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import Multiselect from "multiselect-react-dropdown";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import ConfirmPopup from "@components/core/ConfirmPopup";

interface TransItem {
  totalBales: string;
  totalQuantity: any;
  program: {
    id: number;
    program_name: string;
    program_status: boolean;
  };
}
export default function page() {
  useTitle("Dashboard");
  const spinnerId = User.spinnerId;
  const [roleLoading, hasAccess] = useRole();
  const { translations } = useTranslations();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dataList, setDataList] = useState<any>([]);
  const [dataAlert, setDataAlert] = useState<any>([]);
  const [chartDataSeed, setChartDataSeed] = useState([]);
  const [chartDataLint, setChartDataLint] = useState([]);

  const [count, setCount] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showFilterList, setShowFilterList] = useState(false);
  const [showFilterAlert, setShowFilterAlert] = useState(false);
  const [searchFilterList, setSearchFilterList] = useState("");
  const [searchFilterAlert, setSearchFilterAlert] = useState("");
  const [program, setProgram] = useState<any>([]);
  const [ginner, setGinner] = useState<any>([]);

  const [checkedProgramAlert, setCheckedProgramAlert] = useState<any>([]);
  const [checkedProgramList, setCheckedProgramList] = useState<any>([]);
  const [checkedGinnerAlert, setCheckedGinnerAlert] = useState<any>([]);
  const [checkedGinnerList, setCheckedGinnerList] = useState<any>([]);

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>({});

  const [isClear, setIsClear] = useState(false);
  const [isAlertClear, setIsAlertClear] = useState(false);
  const [errors, setErrors] = useState<any>([]);
  const [isConfirm, setIsConfirm] = useState<any>(true);
  const [showFilter, setShowFilter] = useState(false);

  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [dataInvoiceList, setDataInvoiceList] = useState<Array<string>>([]);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [dataInvoiceAlert, setDataInvoiceAlert] = useState<Array<string>>([]);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const code = encodeURIComponent(searchQuery);

  useEffect(() => {
    if (spinnerId) {
      fetchAlertData();
      fetchTransActionList();
      fetchChartDataLint();
      fetchchartDataSeed();
    }
  }, [spinnerId, isClear, isAlertClear]);

  useEffect(() => {
    if (spinnerId) {
      getSpinnerData()
      getProgram();
    }
  }, [spinnerId]);

  useEffect(() => {
    if (spinnerId) {
      fetchTransActionList();
    }
  }, [searchQuery, page, limit]);

  useEffect(() => {
    const updatedRowErrors: any = [];
    dataAlert.forEach((row: any, index: any) => {
      if (row.qtyStock > row.total_qty) {
        updatedRowErrors[index] = "Actual Quantity should not be more than Quantity(kgs)";
        return
      }
      else if (row.qtyStock <= row.total_qty * 0.9) {
        updatedRowErrors[index] = "Actual Quantity should not be <= 90%";
        return
      }
      else {
        updatedRowErrors[index] = "";
      }
    });
    setErrors(updatedRowErrors);

    const getIds = Object.keys(selectedRows).map(
      (rowId) =>
        selectedRows[rowId] === "accept" || selectedRows[rowId] === "reject"
    );
    const hasNonEmptyValues = updatedRowErrors.some(
      (value: any) => value !== ""
    );
    if (getIds.length > 0 && hasNonEmptyValues === false) {
      setIsConfirm(false);
    } else {
      setIsConfirm(true);
    }
  }, [dataAlert, selectedRows]);

  const getSpinnerData = async () => {
    const url = `spinner/get-spinner?id=${spinnerId}`;
    try {
      const response = await API.get(url);
      if (response?.data?.brand?.length > 0) {
        getGinner(response?.data?.brand);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getProgram = async () => {
    const url = `spinner-process/get-program?spinnerId=${spinnerId}`;
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

  const getGinner = async (id: any) => {
    try {
      const res = await API.get(`ginner?brandId=${id}`);
      if (res.success) {
        setGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAlertData = async () => {
    const url = `spinner-process/transaction?spinnerId=${spinnerId}&status=Pending&programId=${checkedProgramAlert}&ginnerId=${checkedGinnerAlert}`;
    try {
      const response = await API.get(url);
      let data = response.data.map((obj: any) => {
        return { ...obj, qtyStock: obj.total_qty };
      });
      setDataAlert(data);
      setCount(response.count);
      const quantity = response?.data?.map((qty: any) => {
        return Number(qty.total_qty);
      });
      const sum = quantity?.reduce(
        (accumulator: any, currentValue: any) => accumulator + currentValue,
        0
      );
      setTotalQuantity(sum)
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };
  const fetchTransActionList = async () => {
    const url = `spinner-process/transaction?spinnerId=${spinnerId}&status=Sold&search=${code}&programId=${checkedProgramList}&ginnerId=${checkedGinnerList}&limit=${limit}&page=${page}&pagination=true`;
    try {
      const response = await API.get(url);
      setDataList(response.data);
      setCount(response.count);
    } catch (error) {
      console.log(error, "error");
      setCount(0);
    }
  };
  const fetchchartDataSeed = async () => {
    try {
      const response = await API.get(
        `spinner-process/transaction/count?spinnerId=${spinnerId}`
      );
      if (response.success) {
        const seedData = response.data.gin.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.totalBales),
        }));
        setChartDataSeed(seedData);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchChartDataLint = async () => {
    try {
      const response = await API.get(
        `spinner-process/transaction/count?spinnerId=${spinnerId}`
      );
      if (response.success) {
        const seedData = response.data.spinSale.map((item: TransItem) => ({
          name: item.program.program_name,
          y: parseFloat(item.totalQuantity),
        }));
        setChartDataLint(seedData);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleSelectAllChange = () => {
    setSelectAllChecked(!selectAllChecked);
    const updatedSelectedRows: any = {};

    if (!selectAllChecked) {
      dataAlert.forEach((dataAlert: any) => {
        updatedSelectedRows[dataAlert.id] = "accept";
      });
    }
    setSelectedRows(updatedSelectedRows);
  };

  const handleAcceptRejectChange = (rowId: any, value: any) => {
    const updatedSelectedRows = { ...selectedRows, [rowId]: value };
    setSelectedRows(updatedSelectedRows);
    setSelectAllChecked(false);
  };

  const handleExport = async () => {
    try {
      const res = await API.get(
        `spinner-process/transaction/export?spinnerId=${spinnerId}&pagination=true`
      );
      if (res.success) {
        handleDownload(res.data, "Spinner Transaction List", ".xlsx");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (id: number, fieldName: string, fieldValue: any) => {
    const updatedData = dataAlert.map((item: any, index: any) => {
      if (index === id) {
        const updatedItem = { ...item, [fieldName]: fieldValue };
        return updatedItem;
      } else {
        return item;
      }
    });
    setDataAlert(updatedData);
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

  const generateInvoice = async (salesId: number, action: string) => {
    if (salesId) {
      try {
        const res = await API.get(
          `spinner-process/sales-invoice?salesId=${salesId}`
        );
        if (res.success) {
          // handleDownload(res.data, "Spinner Transaction List", ".xlsx");
          if (action === "view") {
            handleView(res.data.file);
          } else if (action === "download") {
            handleDownloadData(res.data.file, `invoice-${salesId}`);
          }
        }
      } catch (error) { }
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleToggleFilter = (rowData: Array<string>) => {
    setDataInvoiceList(rowData);
    setShowInvoiceList(!showInvoiceList);
  };

  const handleToggleAlertFilter = (rowData: Array<string>) => {
    setDataInvoiceAlert(rowData);
    setShowInvoiceAlert(!showInvoiceAlert);
  };

  const DocumentPopup = ({ openFilter, dataInvoice, dataInvList, onClose, type }: any) => {
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
                onClick={() => handleDownloadData(row, "Cotton-connect|Invoice File")}
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
                    onClick={() => type === "List" ? setShowInvoiceList(!showInvoiceList) : setShowInvoiceAlert(!showInvoiceAlert)}
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
                          data={type === "List" ? dataInvList : dataInvoice}
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

  const columnList = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      width: "70px",
      cell: (row: any, index: any) => (page - 1) * limit + index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      wrap: true,
      selector: (row: any) => row.date.substring(0, 10),
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Ginner Name</p>,
      wrap: true,
      selector: (row: any) => row.ginner?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      wrap: true,
      selector: (row: any) => row.invoice_no,
    },
    {
      name: <p className="text-[13px] font-medium">Bale Lot No</p>,
      wrap: true,
      selector: (row: any) => row.lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">No of Bales</p>,
      wrap: true,
      selector: (row: any) => row.no_of_bales,
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      wrap: true,
      selector: (row: any) => row.reel_lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity (Kgs)</p>,
      wrap: true,
      selector: (row: any) => row.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      center: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      center: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via trader</p>,
      wrap: true,
      selector: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      wrap: true,
      center: true,
      selector: (row: any) =>
        row.transaction_agent ? row.transaction_agent : "NA",
    },
    {
      name: <p className="text-[13px] font-medium">Invoice</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          <span>{row.invoice_no}</span>
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Action</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          <FaEye
            size={18}
            className="text-black hover:text-blue-600 cursor-pointer"
            onClick={() => generateInvoice(row.id, "view")}
          />
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Tc File</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.tc_file && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.tc_file)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row.tc_file, "Tc File")}
              />
            </>
          )}
        </>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Contract Files</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.contract_file && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.contract_file)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row.contract_file, "Contract Files")}
              />
            </>
          )}
        </>
      ),
    },
    {
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
      name: <p className="text-[13px] font-medium">Delivery Notes</p>,
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          {row.delivery_notes && (
            <>
              <FaEye
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleView(row.delivery_notes)}
              />
              <FaDownload
                size={18}
                className="text-black hover:text-blue-600 cursor-pointer"
                onClick={() => handleDownloadData(row.delivery_notes, "Delivery Notes")}
              />
            </>
          )}
        </>
      ),
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.ginnerInterface?.qrCode}
        </p>
      ),
      wrap: true,
      center: true,
      cell: (row: any) => (
        <>
          <img
            className=""
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
  ];
  const coulumnsAlert = [
    {
      name: <p className="text-[13px] font-medium">S. No</p>,
      width: "70px",
      cell: (row: any, index: any) => index + 1,
    },
    {
      name: <p className="text-[13px] font-medium">Date</p>,
      selector: (row: any) => row.date.substring(0, 10),
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Season</p>,
      wrap: true,
      selector: (row: any) => row.season?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Ginner Name</p>,
      wrap: true,
      selector: (row: any) => row.ginner?.name,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      wrap: true,
      selector: (row: any) => (
        <span
          className="text-black hover:text-blue-600 cursor-pointer mr-2"
          onClick={() => handleToggleAlertFilter(row?.invoice_file)}> {row.invoice_no}
        </span>
      )
    },
    {
      name: <p className="text-[13px] font-medium">No of Bales</p>,
      selector: (row: any) => row.no_of_bales,
    },
    {
      name: <p className="text-[13px] font-medium">Bale Lot No</p>,
      wrap: true,
      selector: (row: any) => row.lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      wrap: true,
      selector: (row: any) => row.reel_lot_no,
    },
    {
      name: <p className="text-[13px] font-medium">Quantity (Kgs) </p>,
      wrap: true,
      selector: (row: any) => row.total_qty,
    },
    {
      name: <p className="text-[13px] font-medium">ActualQty (Kgs)</p>,
      wrap: true,
      width: '120px',
      cell: (row: any, index: any) => (
        <div>
          <input
            type="number"
            className="border h-5 w-full"
            value={row.qtyStock || ""}
            onChange={(e) => handleChange(index, "qtyStock", e.target.value)}
          />
          {errors[index] && (
            <div className="text-sm text-red-500">{errors[index]}</div>
          )}
        </div>
      ),
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      wrap: true,
      selector: (row: any) => row.program?.program_name,
    },
    {
      name: <p className="text-[13px] font-medium">Vehicle No</p>,
      wrap: true,
      selector: (row: any) => row.vehicle_no,
    },
    {
      name: <p className="text-[13px] font-medium">Transaction via trader</p>,
      wrap: true,
      cell: (row: any) => (row.transaction_via_trader ? "Yes" : "No"),
      width: "120px",
    },
    {
      name: <p className="text-[13px] font-medium">Agent Details</p>,
      selector: (row: any) => row.transaction_agent || "NA",
      wrap: true,
    },
    {
      name: (
        <p className="text-[13px] font-medium">
          {translations.ginnerInterface?.qrCode}
        </p>
      ),
      center: true,
      cell: (row: any) => (
        <>
          <img
            className=""
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
      name: <p className="text-[13px] font-medium">{translations?.common?.InVoiceFiles}</p>,
      center: true,
      cell: (row: any) =>
        row?.invoice_file &&
        row?.invoice_file.length > 0 && (
          <>
            <FaEye
              size={18}
              className="text-black hover:text-blue-600 cursor-pointer mr-2"
              onClick={() => handleToggleAlertFilter(row?.invoice_file)}
              title="Click to View All Files"
            />
          </>
        ),
    },
    {
      name: (
        <div className="flex justify-between ">
          {" "}
          <input
            name="view"
            type="checkbox"
            className="mr-2"
            onChange={handleSelectAllChange}
            checked={selectAllChecked}
          />
          <p className="text-[13px] font-medium">Accept All</p>
        </div>
      ),

      cell: (row: any) => (
        <div className="flex justify-between flex-wrap gap-2">
          <label>
            <input
              type="radio"
              name={`acceptReject_${row.id}`}
              value="accept"
              checked={selectedRows[row.id] === "accept"}
              onChange={() => handleAcceptRejectChange(row.id, "accept")}
              className="mr-2"
            />
            Accept
          </label>
          <label>
            <input
              type="radio"
              name={`acceptReject_${row.id}`}
              value="reject"
              checked={selectedRows[row.id] === "reject"}
              onChange={() => handleAcceptRejectChange(row.id, "reject")}
              className="mr-2"
            />
            Reject
          </label>
        </div>
      ),
      sortable: false,
      width: "180px"
    },
  ];

  const searchDataList = (e: any) => {
    setSearchQuery(e.target.value);
  };

  const updatePageList = (page: number = 1, limitData: number = 10) => {
    setPage(page);
    setLimit(limitData);
  };

  const handleChangeList = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "program") {
      if (checkedProgramList.includes(itemId)) {
        setCheckedProgramList(
          checkedProgramList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramList([...checkedProgramList, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedGinnerList.includes(itemId)) {
        setCheckedGinnerList(
          checkedGinnerList.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinnerList([...checkedGinnerList, itemId]);
      }
    }
  };
  const handleChangeAlert = (
    selectedList: any,
    selectedItem: any,
    name: string
  ) => {
    let itemId = selectedItem?.id;
    if (name === "program") {
      if (checkedProgramAlert.includes(itemId)) {
        setCheckedProgramAlert(
          checkedProgramAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedProgramAlert([...checkedProgramAlert, itemId]);
      }
    } else if (name === "ginner") {
      if (checkedGinnerAlert.includes(itemId)) {
        setCheckedGinnerAlert(
          checkedGinnerAlert.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinnerAlert([...checkedGinnerAlert, itemId]);
      }
    }
  };
  const clearFilterList = () => {
    setCheckedProgramList([]);
    setCheckedGinnerList([]);
    setSearchQuery("");
    setIsClear(!isClear);
  };
  const clearFilterAlert = () => {
    setCheckedProgramAlert([]);
    setCheckedGinnerAlert([]);
    setIsAlertClear(!isAlertClear);
  };

  const FilterPopupList = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilterList(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

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
                  onClick={() => setShowFilterList(!showFilterList)}
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
                          Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ginner?.filter((item: any) =>
                            checkedGinnerList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "ginner"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "ginner"
                            )
                          }
                          options={ginner}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedProgramList.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeList(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          options={program}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchTransActionList();
                            setShowFilterList(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilterList();
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

  const FilterPopupAlert = ({ openFilter, onClose }: any) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (
          popupRef.current &&
          !(popupRef.current as any).contains(event.target)
        ) {
          setShowFilterAlert(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [popupRef, onClose]);

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
                  onClick={() => setShowFilterAlert(!showFilterAlert)}
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
                          Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ginner?.filter((item: any) =>
                            checkedGinnerAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "ginner"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "ginner"
                            )
                          }
                          options={ginner}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Program
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="program_name"
                          selectedValues={program?.filter((item: any) =>
                            checkedProgramAlert.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
                          onSelect={(selectedList: any, selectedItem: any) => {
                            handleChangeAlert(
                              selectedList,
                              selectedItem,
                              "program"
                            );
                          }}
                          options={program}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            fetchAlertData();
                            setShowFilterAlert(false);
                          }}
                        >
                          APPLY ALL FILTERS
                        </button>
                        <button
                          className="btn-outline-purple"
                          onClick={() => {
                            clearFilterAlert();
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

  const handleConfirmActions = async () => {
    try {
      const acceptedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "accept"
      );
      const rejectedRowIds = Object.keys(selectedRows).filter(
        (rowId) => selectedRows[rowId] === "reject"
      );

      const acceptedUpdateRequests = acceptedRowIds
        .map((rowId) => {
          const matchingItem = dataAlert.find((item: any) => item.id == rowId);
          if (matchingItem) {
            return {
              id: Number(rowId),
              status: "Sold",
              qtyStock: matchingItem.qtyStock,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      const rejectedUpdateRequests = rejectedRowIds
        .map((rowId) => {
          const matchingItem = dataAlert.find((item: any) => item.id == rowId);
          if (matchingItem) {
            return {
              id: Number(rowId),
              status: "Rejected",
              qtyStock: matchingItem.qtyStock,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      const updateRequests = [
        ...acceptedUpdateRequests,
        ...rejectedUpdateRequests,
      ];

      const url = "spinner-process/transaction";
      const dataToSend = {
        items: updateRequests,
      };

      const response = await API.put(url, dataToSend);

      if (response.success) {
        const updatedDataAlert = dataAlert.filter(
          (row: any) =>
            !acceptedRowIds.includes(row.id) && !rejectedRowIds.includes(row.id)
        );
        setDataAlert(updatedDataAlert);
        setShowConfirmPopup(!showConfirmPopup)
        setSelectedRows({});
        setSelectAllChecked(false);

        const acceptedRows = dataAlert.filter((row: any) =>
          acceptedRowIds.includes(row.id)
        );
        const rejectedRows = dataAlert.filter((row: any) =>
          rejectedRowIds.includes(row.id)
        );
        const updatedDataList = [...dataList, ...acceptedRows, ...rejectedRows];
        setDataList(updatedDataList);

        fetchAlertData();
        fetchTransActionList();
      } else {
        console.error("Failed to update statuses");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!roleLoading && !hasAccess?.processor?.includes("Spinner")) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && hasAccess?.processor?.includes("Spinner")) {
    return (
      <>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li className="active">
                  <Link href="/spinner/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6" />
        {/* <div className="w-100">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-6 mt-4">
              <Accordian
                title={"Cotton Bales"}
                content={
                  <BarChart
                    title="Cotton Bales"
                    data={chartDataSeed}
                    type={"column"}
                  />
                }
              />
            </div>
            <div className="col-12 col-sm-12 col-md-6 mt-4">
              <Accordian
                title={"Yarn Inventory"}
                content={
                  <BarChart
                    title="Yarn Inventory"
                    data={chartDataLint}
                    type={"bar"}
                  />
                }
              />
            </div>
          </div>
        </div>

        <hr className="my-6" /> */}

        <div>
          <div className="farm-group-box">
            <div className="farm-group-inner">
              <div className="table-form">
                <div className="table-minwidth w-100">
                  <div className="pt-6">
                    <div className="py-6">
                      <h4 className="text-xl font-semibold">
                        TRANSACTION ALERT
                      </h4>
                    </div>

                    {/* search */}
                    <div className="search-filter-row">
                      <div className="search-filter-left ">
                        <div className="fliterBtn">
                          <button
                            className="flex"
                            type="button"
                            onClick={() => setShowFilterAlert(!showFilterAlert)}
                          >
                            FILTERS <BiFilterAlt className="m-1" />
                          </button>

                          <div className="relative">
                            <FilterPopupAlert
                              openFilter={showFilterAlert}
                              onClose={!showFilterAlert}
                            />
                          </div>
                        </div>

                      </div>
                      <label className="flex items-center mr-5 text-[14px] font-medium">
                        Total Quantity: {totalQuantity}
                      </label>
                    </div>
                    <DocumentPopup
                      openFilter={showInvoiceAlert}
                      dataInvoice={dataInvoiceAlert}
                      type='Alert'
                      onClose={() => setShowInvoiceAlert(false)}
                    />
                    <DataTable
                      columns={coulumnsAlert}
                      data={dataAlert}
                      persistTableHead
                      fixedHeader={true}
                      noDataComponent={
                        <p className="py-3 font-bold text-lg">
                          No data available in table
                        </p>
                      }
                      fixedHeaderScrollHeight="auto"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        className="btn-purple"
                        disabled={isConfirm}
                        style={
                          isConfirm
                            ? { cursor: "not-allowed", opacity: 0.8 }
                            : { cursor: "pointer", backgroundColor: "#D15E9C" }
                        }
                        onClick={handleConfirmActions}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <hr className="my-6" />

                  <div className="py-6">
                    <h4 className="text-xl font-semibold">TRANSACTION LIST</h4>
                  </div>
                  {/* search */}
                  <div className="search-filter-row">
                    <div className="search-filter-left ">
                      <div className="search-bars">
                        <form className="form-group mb-0 search-bar-inner">
                          <input
                            type="text"
                            className="form-control form-control-new jsSearchBar "
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={searchDataList}
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
                          onClick={() => setShowFilterList(!showFilterList)}
                        >
                          FILTERS <BiFilterAlt className="m-1" />
                        </button>

                        <div className="relative">
                          <FilterPopupList
                            openFilter={showFilterList}
                            onClose={!showFilterList}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="search-filter-right">
                      <button
                        className="py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
                        onClick={handleExport}
                      >
                        Export All
                      </button>
                    </div>
                  </div>
                  <DocumentPopup
                    openFilter={showInvoiceList}
                    dataInvList={dataInvoiceList}
                    type='List'
                    onClose={() => setShowInvoiceList(false)}
                  />

                  <ConfirmPopup showModal={showConfirmPopup} setShowModal={setShowConfirmPopup} />

                  <CommonDataTable
                    columns={columnList}
                    count={count}
                    data={dataList}
                    updateData={updatePageList}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
