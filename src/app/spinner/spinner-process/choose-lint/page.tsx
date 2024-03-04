"use client";

import { DecimalFormat } from "@components/core/DecimalFormat";
import Loader from "@components/core/Loader";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import useTranslations from "@hooks/useTranslation";
import API from "@lib/Api";
import checkAccess from "@lib/CheckAccess";
import User from "@lib/User";
import Multiselect from "multiselect-react-dropdown";
import NavLink from "@components/core/nav-link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@lib/router-events";
import React, { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
import { BiFilterAlt } from "react-icons/bi";

export default function page() {
  useTitle("Choose Lint");
  const [roleLoading,hasAccesss] = useRole();
  const router = useRouter();
  const spinnerId = User.spinnerId;
  const search = useSearchParams();
  const programId = search.get("id");

  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const [data, setData] = useState<any>([]);
  const [isDisable, setIsDisable] = useState<any>(true);
  const [checkedGinners, setCheckedGinners] = React.useState<any>([]);
  const [ginner, setGinner] = useState<any>();
  const [error, setError] = useState<any>([]);
  const [isClear, setIsClear] = useState<any>(false);
  const [showFilter, setShowFilter] = useState(false);
  const [seasons, setSeasons] = useState<any>();
  const [invoiceNos, setInvoiceNos] = useState<any>();
  const [reelLotNos, setReelLotNos] = useState<any>();

  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [checkedInvoiceNos, setCheckedInvoiceNos] = useState<any>([]);
  const [checkedReelLotNos, setCheckedReelLotNos] = useState<any>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<any>([]);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [totalQtyLint, setTotalQtyLint] = useState<any>(0);


  useEffect(() => {
    if (!roleLoading && hasAccesss?.processor?.includes("Spinner")) {
      const access = checkAccess("Spinner Process");
      if (access) setAccess(access);
    }
  }, [roleLoading,hasAccesss]);

  useEffect(() => {
    getSeasons();
  }, []);

  useEffect(() => {
    if (spinnerId) {
      getGinners();
      getInvoiceNos();
      getLint();
    }
  }, [spinnerId, isClear]);

  useEffect(() => {
    updateSelectedRows();
    calculateTotalQuantityUsed();
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRowIds]);

  const updateSelectedRows = () => {
    const selectedData = data?.map((item:any)=> item?.data?.filter((item: any) => {
      return item.selected;
    }));
    setSelectedRowIds(selectedData);
  };

  useEffect(() => {
    if (
      Number(totalQuantityUsed) === 0
    ) {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [totalQuantityUsed, selectedRowIds]);

  // useEffect(() => {
  //  if(data.length<=0){ const isAllChecked =
  //     data && data.every((item: any) => item.data.every((item: any) => item.selected === true));
  //     setSelectedTables(isAllChecked?[...selectedTables, data[0]?.season.id]:selectedTables?.filter((id:any) => id !== data[0]?.season.id));}
  // }, [data]); // working with it

  useEffect(() => {
    const updatedRowErrors:any = {};
  
    data.forEach((item:any) =>
      item.data.forEach((row:any) => {
        if (row.qtyUsed < 0) {
          updatedRowErrors[row.id] = `Quantity Used cannot be less than zero`;
        } else if (Number(row.qtyUsed) > Number(row.total_qty)) {
          updatedRowErrors[row.id] = `Value should be less than or equal to ${row.total_qty}`;
        }
      })
    );
  
    setError(updatedRowErrors);
    calculateTotalQuantityUsed();
  }, [selectedRowIds, data]);


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

  const getInvoiceNos = async () => {
    try {
      const res = await API.get(
        `spinner-process/lint-invoice?spinnerId=${spinnerId}&programId=${programId}`
      );
      if (res.success) {
        setInvoiceNos(res.data?.invoice);
        setReelLotNos(res.data?.reelLot);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getGinners = async () => {
    try {
      const res = await API.get(
        `spinner-process/get-filter-ginner?spinnerId=${spinnerId}`
      );
      if (res.success) {
        setGinner(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLint = async () => {
    try {
      const res = await API.get(
        `spinner-process/choose-lint?spinnerId=${spinnerId}&programId=${programId}&ginnerId=${checkedGinners}&invoiceNo=${checkedInvoiceNos}&seasonId=${checkedSeasons}&reelLotNo=${checkedReelLotNos}`
      );
      if (res.success) {
        let total: number = 0;
        let resData = res.data;
        const spinnerChooseLint = JSON.parse(sessionStorage.getItem("spinnerChooseLint") || '{}');

        if(spinnerChooseLint && spinnerChooseLint.chooseLint){
          resData = resData.map((item: any) => {
            const nData = item.data?.map((dataItem: any) => {
                total += dataItem.qty_stock;
                const selectedData = spinnerChooseLint.chooseLint.find((obj: any) => obj.id === dataItem.id);
                return {
                    ...dataItem,
                    qtyUsed: DecimalFormat(Number(selectedData?.qtyUsed) || dataItem.qty_stock),
                    selected: !!selectedData,
                };
            });
            
            return { ...item, data: nData || [] };
        })} else {
          resData = resData.map((item: any) => {
            const nData = item.data?.map((dataItem: any) => {
                total += dataItem.qty_stock;
                  return { ...dataItem, qtyUsed: DecimalFormat(dataItem.qty_stock) };
              });
              return { ...item, data: nData || [] };
              
            });
        }

        setData(resData);
        setTotalQtyLint(DecimalFormat(total));
        setSelectedTables(spinnerChooseLint?.selectedTables||[]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectAllChange = (tableId: number, datas: any, isChecked: boolean) => {
    const updatedData = [...data];

    const dataIndex = updatedData.findIndex(table => table.season.id === tableId);

    if (dataIndex !== -1) {
        updatedData[dataIndex].data = updatedData[dataIndex].data.map((item:any) => ({
            ...item,
            selected: isChecked,
        }));

        setData(updatedData);

        setSelectedTables(isChecked
            ? [...selectedTables, updatedData[dataIndex].season.id]
            : selectedTables.filter((id:any) => id !== updatedData[dataIndex].season.id)
        );
    } else {
        console.error("Data index is undefined:", dataIndex);
    }
};

  const handleRowCheckboxChange = (event: any) => {
    const isChecked = event.target.checked;

    const updatedData = [...data];

    const dataIndex = updatedData.findIndex(table => table.data.some((item: any) => item.id === Number(event.target.value)));

    const itemIndex = updatedData[dataIndex].data.findIndex((item: any) => item.id === Number(event.target.value));

    updatedData[dataIndex].data[itemIndex].selected = isChecked;

    setData(updatedData);

    const isAllChecked = updatedData[dataIndex].data.every((item: any) => item.selected);

    setSelectedTables(isAllChecked ? [...selectedTables, updatedData[dataIndex].season.id] : selectedTables.filter((id:any) => id !== updatedData[dataIndex].season.id));
};

  const calculateTotalQuantityUsed = () => {
    const total = selectedRowIds?.reduce((acc:any, table:any) => {
        const tableTotal = table?.reduce((tableAcc:any, item:any) => {
            return tableAcc + Number(item.qtyUsed);
        }, 0);
        return acc + tableTotal;
    }, 0);
    setTotalQuantityUsed(DecimalFormat(total));
};


  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "ginner") {
      if (checkedGinners.includes(itemId)) {
        setCheckedGinners(
          checkedGinners.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedGinners([...checkedGinners, itemId]);
      }
    } else if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
      }
    } else if (name === "invoiceNos") {
      if (checkedInvoiceNos.includes(selectedItem?.invoice_no)) {
        setCheckedInvoiceNos(
          checkedInvoiceNos.filter(
            (item: any) => item !== selectedItem?.invoice_no
          )
        );
      } else {
        setCheckedInvoiceNos([...checkedInvoiceNos, selectedItem?.invoice_no]);
      }
    } else if (name === "reelLotNos") {
      if (checkedReelLotNos.includes(selectedItem?.reel_lot_no)) {
        setCheckedReelLotNos(
          checkedReelLotNos.filter(
            (item: any) => item !== selectedItem?.reel_lot_no
          )
        );
      } else {
        setCheckedReelLotNos([...checkedReelLotNos, selectedItem?.reel_lot_no]);
      }
    }
  };

  const handleInput = (id: number, fieldName: string, fieldValue: any) => {
    const updatedData = data.map((obj: any, index: any) => {
      let nData = obj.data?.map((item: any) => {
        if (item.id == id) {
          const updatedItem = { ...item, qtyUsed: Number(fieldValue) };
          return updatedItem;
        } else {
          return item;
        }
      });
      return { ...obj, data: nData };
    });

    setData(updatedData);
  };

  const handleSubmit = () => {
    const updatedRowErrors:any = {};
  
    data.forEach((item:any) =>
      item.data.forEach((row:any) => {
        if (row.qtyUsed < 0) {
          updatedRowErrors[row.id] = `Quantity Used cannot be less than zero`;
        } else if (Number(row.qtyUsed) > Number(row.total_qty)) {
          updatedRowErrors[row.id] = `Value should be less than or equal to ${row.total_qty}`;
        }
      })
    );
  
    setError(updatedRowErrors);
    const hasErrors = Object.values(updatedRowErrors).some(
      (error) => error !== ""
    );

    if (!hasErrors) {
      const mergedArray = selectedRowIds.flat();
      const chooseLint = mergedArray.map((item: any) => {
        return {
          qtyUsed: DecimalFormat(item.qtyUsed),
          totalQty: DecimalFormat(item.qty_stock),
          id: item.id,
        };
      });

      chooseLint && chooseLint?.forEach((dataItem: any) => {
        dataItem.qtyUsed = dataItem.qtyUsed ? Number(dataItem.qtyUsed) : dataItem.qtyUsed,
        dataItem.totalQty = dataItem.totalQty ? Number(dataItem.totalQty) : dataItem.totalQty
        })
    
      const savedQuantity: any = {
        totalQuantityUsed: Number(totalQuantityUsed),
        chooseLint:chooseLint,
        selectedTables:selectedTables
      };
      sessionStorage.setItem(
        "spinnerChooseLint",
        JSON.stringify(savedQuantity)
      );
      router.push("/spinner/spinner-process/add-spinner-process");
    }
  };

  const clearFilter = () => {
    setCheckedGinners([]);
    setCheckedInvoiceNos([]);
    setCheckedSeasons([]);
    setCheckedReelLotNos([]);
    setIsClear(!isClear);
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
                          displayValue="name"
                          selectedValues={seasons?.filter((item: any) =>
                            checkedSeasons.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "seasons");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "seasons")
                          }
                          options={seasons}
                          showCheckbox
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Ginner
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="name"
                          selectedValues={ginner?.filter((item: any) =>
                            checkedGinners.includes(item.id)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(selectedList, selectedItem, "ginner");
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(selectedList, selectedItem, "ginner")
                          }
                          options={ginner}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Invoice Number
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="invoice_no"
                          selectedValues={invoiceNos?.filter((item: any) =>
                            checkedInvoiceNos.includes(item.invoice_no)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "invoiceNos"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "invoiceNos"
                            )
                          }
                          options={invoiceNos}
                          showCheckbox
                        />
                      </div>

                      <div className="col-12 col-md-6 col-lg-6 mt-2">
                        <label className="text-gray-500 text-[12px] font-medium">
                          Select a Reel Lot Number
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          displayValue="reel_lot_no"
                          selectedValues={reelLotNos?.filter((item: any) =>
                            checkedReelLotNos.includes(item.reel_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() {}}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "reelLotNos"
                            );
                          }}
                          onSearch={function noRefCheck() {}}
                          onSelect={(selectedList: any, selectedItem: any) =>
                            handleChange(
                              selectedList,
                              selectedItem,
                              "reelLotNos"
                            )
                          }
                          options={reelLotNos}
                          showCheckbox
                        />
                      </div>
                    </div>
                    <div className="pt-6 w-100 d-flex justify-content-end customButtonGroup buttotn560Fix">
                      <section>
                        <button
                          className="btn-purple mr-2"
                          onClick={() => {
                            getLint();
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

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />{" "}
      </div>
    );
  }

  const columns = (tableId: number,data:any[]) => [
    {
      name: <p className="text-[13px] font-medium">{translations.common.srNo}</p>,
      width: "70px",
      cell: (row: any, index: any) => index + 1,

    },
    {
      name: <p className="text-[13px] font-medium">Ginner Name</p>,
      selector: (row: any) => row.ginner?.name,

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Invoice No</p>,
      selector: (row: any) => row.invoice_no,

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Bale LotNo</p>,
      selector: (row: any) => row.lot_no,

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">REEL Lot No</p>,
      selector: (row: any) => row.reel_lot_no,

      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium">Program</p>,
      selector: (row: any) => row.program?.program_name,

    },
    {
      name: <p className="text-[13px] font-medium">Total Quantity Received</p>,
      selector: (row: any) => DecimalFormat(row.total_qty),

    },
    {
      name: <p className="text-[13px] font-medium">Quantity in Stock</p>,
      selector: (row: any) => DecimalFormat(row.qty_stock),
    },
    {
      name: <p className="text-[13px] font-medium">Quantity Consumed</p>,
      selector: (row: any) => DecimalFormat(Number(row.total_qty) - Number(row.qty_stock)),
    },
    {
      name: <p className="text-[13px] font-medium">Quantity Used</p>,
      width: "140px",
      cell: (row: any, index: any) => (
        <div>
          <input
            type="number"
            name="qtyUsed"
            className="border h-7 w-28"
            value={row.qtyUsed || ""}
            onChange={(e) => handleInput(row.id, "qtyUsed ", e.target.value)}
          />
          {error[row.id] && (
            <p className="text-sm text-red-500">{error[row.id]}</p>
          )}
        </div>
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
            onChange={(event) => handleSelectAllChange(tableId,data,event.target.checked)}
            checked={selectedTables?.includes(tableId)}
          />
          Select All{" "}
        </div>
      ),
      cell: (row: any,index: any) => (
        <div>
          <input
            type="checkbox"
            name="selectedId"
            value={row.id}
            // checked={selectedRowIds.includes(row.id)}
            checked={!!row.selected}
            onChange={(event) => handleRowCheckboxChange(event)}
          />
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (!roleLoading && !Access?.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
  return (
    <div className="breadcrumb-box">
      <div className="breadcrumb-inner light-bg">
        <div className="breadcrumb-left">
          <ul className="breadcrum-list-wrap">
            <li>
              <NavLink href="/spinner/dashboard" className="active">
                <span className="icon-home"></span>
              </NavLink>
            </li>
            <li>
              <NavLink href="/spinner/spinner-process">Process</NavLink>
            </li>
            <li>
              <NavLink href="/spinner/spinner-process/add-spinner-process">
                {" "}
                New Process
              </NavLink>
            </li>
            <li>Choose Lint</li>
          </ul>
        </div>
      </div>
      <div className="farm-group-box">
        <div className="farm-group-inner">
          <div className="table-form">
            <div className="table-minwidth">
              <div className="search-filter-row">
                <div className="search-filter-left ">
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

                  <div className="flex items-center ml-4">
                    <label className="text-sm">Program: </label>
                    <span className="text-sm">
                      {" "}
                      {data ? data[0]?.data[0]?.program?.program_name : ""}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-6" />

              {data?.length > 0 ? (
                data.map((item: any) => {
                  return (
                    <div key={item?.season?.id}>
                      <div className="py-6">
                        <h4 className="text-xl font-semibold">
                          SEASON: {item?.season?.name}
                        </h4>
                        <h4 className="mt-3 text-md font-semibold">
                          AVAILABLE LINT: {item?.available_lint}
                        </h4>
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
                          columns={columns(item?.season?.id,item?.data)}
                          data={item?.data}
                        />
                      </div>
                      <hr className="my-6" />
                    </div>
                  );
                })
              ) : (
                <div>
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
                      columns={columns(0,data)}
                      data={data}
                    />
                  </div>
                  <hr className="my-6" />
                </div>
              )}
              <div className="flex justify-end gap-5">
                <p className="text-sm font-semibold">
                  Total Available Lint: {totalQtyLint}
                </p>
                <p className="text-sm font-semibold">
                  Total Quantity Used: {totalQuantityUsed}
                </p>
              </div>
              <div className="pt-12 w-100 d-flex justify-end customButtonGroup">
                <section>
                  <button
                    className="btn-purple mr-2"
                    disabled={isDisable}
                    style={
                      isDisable
                        ? { cursor: "not-allowed", opacity: 0.8 }
                        : { cursor: "pointer", backgroundColor: "#D15E9C" }
                    }
                    onClick={handleSubmit}
                  >
                    SUBMIT
                  </button>
                  <button
                    className="btn-outline-purple"
                    onClick={() => {
                      router.push(
                        "/spinner/spinner-process/add-spinner-process"
                      );
                    }}
                  >
                    CANCEL
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
}
