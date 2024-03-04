"use client";
import React, { useState, useEffect, useRef } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import { useRouter, useSearchParams } from "next/navigation";
import Multiselect from "multiselect-react-dropdown";

import API from "@lib/Api";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
import { DecimalFormat } from "@components/core/DecimalFormat";
import NavLink from "@components/core/nav-link";
import { BiFilterAlt } from "react-icons/bi";

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  useTitle("Choose Yarn");
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});

  const router = useRouter();
  const spinnerId = User.spinnerId;
  const [data, setData] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<any>({ selectAll: [] });
  const [isSelected, setIsSelected] = useState<any>(true);
  const [programName, setProgramName] = useState<any>([]);
  const [totalyarn, setTotalQtyYarn] = useState<any>(0);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [checkedReelLotNos, setCheckedReelLotNos] = useState<any>([]);
  const [checkedSeasons, setCheckedSeasons] = useState<any>([]);
  const [isClear, setIsClear] = useState<any>(false);
  const [showFilter, setShowFilter] = useState(false);
  const [seasons, setSeasons] = useState<any>();
  const [reelLotNos, setReelLotNos] = useState<any>();

  const search = useSearchParams();
  const programId = search.get("id");

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Spinner")) {
      const access = checkAccess("Spinner Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);

  useEffect(() => {
    getSeasons();
  }, []);

  useEffect(() => {
    getProgram()
  }, [programId])

  useEffect(() => {
    if (spinnerId) {
      getSpinner();
      getReelLotNos();
    }
  }, [spinnerId, isClear]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows, data]);

  useEffect(() => {
    if (data && data.length > 0) {
      const selectedArray = data.flatMap((item: any) => {
        return item.data.filter((row: any) => {
          const isSelect = row.yarns.some((selected: any) => selected.selected === true);
          return isSelect;
        });
      });

      if (selectedArray.length > 0) {
        setIsSelected(false);
      } else {
        setIsSelected(true);
      }
    }
  }, [data]);

  const getSpinner = async () => {
    try {
      const res = await API.get(
        `spinner-process/choose-yarn?spinnerId=${spinnerId}&programId=${programId}&seasonId=${checkedSeasons}&reelLotNo=${checkedReelLotNos}`
      );
      if (res.success) {
        let totalNoOfStock = 0;
        let resData = res.data;
        const spinnerChooseYarn = JSON.parse(sessionStorage.getItem("spinnerChooseYarn") || '{}');

        resData = resData.map((item: any) => {
          let allYarnsSelected = true;
          const nData = item.data?.map((dataItem: any) => {
            let updatedDataItem = { ...dataItem };

            if (spinnerChooseYarn && spinnerChooseYarn.chooseYarn) {
              updatedDataItem.yarns = updatedDataItem.yarns.map((yarn: any) => {
                const selectedData = spinnerChooseYarn.chooseYarn.find((obj: any) => obj.id === yarn.id);
                if (selectedData) {
                  setCheckedValues(spinnerChooseYarn?.checkedValues);
                  return {
                    ...yarn,
                    qtyUsed: DecimalFormat(selectedData.qtyUsed),
                    selected: true,
                  };
                } else {
                  allYarnsSelected = false;
                  return {
                    ...yarn,
                    qtyUsed: DecimalFormat(yarn.qty_stock),
                    selected: false,
                  };
                }
              });
            } else {
              updatedDataItem.yarns = updatedDataItem.yarns.map((yarn: any) => ({
                ...yarn,
                qtyUsed: DecimalFormat(yarn.qty_stock),
                selected: false,
              }));
              allYarnsSelected = false;
            }

            updatedDataItem.selected = allYarnsSelected;
            totalNoOfStock += dataItem.qty_stock;
            return updatedDataItem;
          });

          return { ...item, data: nData || [] };
        });
        setData(resData);
        setTotalQtyYarn(totalNoOfStock);
      }


    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getReelLotNos = async () => {
    try {
      const res = await API.get(
        `spinner-process/yarn-reel-lot?spinnerId=${spinnerId}&programId=${programId}`
      );
      if (res.success) {
        setReelLotNos(res.data);
      }
    } catch (error) {
      console.log(error);
    }
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

  const getProgram = async () => {
    const url = "program";
    try {
      const response = await API.get(url);
      if (response.success) {
        const res = response.data;
        const matchingProgram = res.find((item: any) => item.id === Number(programId));
        if (matchingProgram) {
          setProgramName(matchingProgram.program_name);
        }
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleChange = (selectedList: any, selectedItem: any, name: string) => {
    let itemId = selectedItem?.id;
    if (name === "seasons") {
      if (checkedSeasons.includes(itemId)) {
        setCheckedSeasons(
          checkedSeasons.filter((item: any) => item !== itemId)
        );
      } else {
        setCheckedSeasons([...checkedSeasons, itemId]);
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

  const clearFilter = () => {
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
                          Select a Reel Lot Number
                        </label>
                        <Multiselect
                          className="w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom"
                          // id="programs"
                          displayValue="reel_lot_no"
                          selectedValues={reelLotNos?.filter((item: any) =>
                            checkedReelLotNos.includes(item.reel_lot_no)
                          )}
                          onKeyPressFn={function noRefCheck() { }}
                          onRemove={(selectedList: any, selectedItem: any) => {
                            handleChange(
                              selectedList,
                              selectedItem,
                              "reelLotNos"
                            );
                          }}
                          onSearch={function noRefCheck() { }}
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
                            getSpinner();
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

  const calculateTotalQuantityUsed = () => {
    const totalQuantityUsed = selectedRows.reduce(
      (total: any, item: any) => total + Number(item.qtyUsed),
      0
    );

    setTotalQuantityUsed(totalQuantityUsed);
  };


  const updateSelectedRows = () => {
    const selectedYarns: any[] = [];

    data?.forEach((item: any) => {
      item?.data?.forEach((row: any) => {
        const selectedYarnsForItem = row?.yarns?.filter((yarn: any) => yarn.selected)
          .map((selectedYarn: any) => ({
            id: selectedYarn.id,
            process_id: selectedYarn.process_id,
            reelLotNo: row.spinprocess.reel_lot_no ? row.spinprocess.reel_lot_no : null,
            yarnCount: selectedYarn.yarncount.id,
            yarnCountName: selectedYarn.yarncount.yarnCount_name,
            totalQty: Number(row.qty_stock),
            qtyUsed: Number(selectedYarn.yarn_produced)
          }));

        selectedYarns.push(...selectedYarnsForItem);
      });
    });

    setSelectedRows(selectedYarns);
  };

  const handlerow = (id: any, isChecked: boolean, tableId: any) => {
    const updatedArr = data.map((row) => {
      const arrNew = row.data.map((item: any) => {
        if (item.spinprocess.id === id) {
          return {
            ...item,
            selected: isChecked,
            yarns: item.yarns.map((yarn: any) => ({
              ...yarn,
              selected: isChecked,
            })),
          };
        } else {
          return item;
        }
      });

      const updatedSelectAll = [...checkedValues?.selectAll];

      const index = updatedSelectAll.indexOf(tableId);

      if (isChecked && index === -1) {
        updatedSelectAll.push(tableId);
      }

      else if (!isChecked && index !== -1) {
        updatedSelectAll.splice(index, 1);
      }

      setCheckedValues({ ...checkedValues, selectAll: updatedSelectAll });

      return {
        ...row,
        data: arrNew,
      };
    });

    setData(updatedArr);
  };

  const handleParentCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const isChecked = e.target.checked;

    const updatedData = data.map((parentItem: any) => {
      if (parentItem.season_id === id) {
        return {
          ...parentItem,
          selected: isChecked,
          data: parentItem.data.map((childItem: any) => ({
            ...childItem,
            yarns: childItem.yarns.map((yarn: any) => ({
              ...yarn,
              selected: isChecked
            })),
            selected: isChecked
          }))
        };
      } else {
        return parentItem;
      }
    });

    setData(updatedData);

    handleSelectAllToggle(isChecked, id);
  };

  const handleSelectAllToggle = (isChecked: boolean, index: any) => {
    const updatedSelectAll = [...checkedValues.selectAll];
    const selectAllIndex = updatedSelectAll.indexOf(index);

    if (isChecked && selectAllIndex === -1) {
      updatedSelectAll.push(index);
    } else if (!isChecked && selectAllIndex !== -1) {
      updatedSelectAll.splice(selectAllIndex, 1);
    }

    setCheckedValues({ ...checkedValues, selectAll: updatedSelectAll });
  };

  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const updatedArr = data.map((row) => {
      const arrNew = row.data.map((item: any) => {
        if (item.yarns.some((yarn: any) => yarn.id === id.id)) {
          const updatedYarns = item.yarns.map((yarn: any) => ({
            ...yarn,
            selected: yarn.id === id.id ? isChecked : yarn.selected,
          }));

          const areAllChildRowsChecked = updatedYarns.every(
            (yarn: any) => yarn.selected === true
          );
          areAllChildRowsChecked && handleSelectAllToggle(isChecked, index);
          return {
            ...item,
            selected: areAllChildRowsChecked ? isChecked : false,
            yarns: updatedYarns,
          };
        } else {
          return item;
        }
      });

      return {
        ...row,
        data: arrNew,
      };
    });

    setData(updatedArr);
  };



  const columns = (tableId: number) => [
    {
      name: translations?.common?.srNo,
      cell: (row: any, index: any) => (
        <div className="p-1">{row.id !== 0 && <>{index + 1}</>}</div>
      ),
      width: '100px',
      sortable: false,
    },
    {
      name: (
        <p className="text-[12px] font-medium">
          {translations?.ginnerInterface?.baleLotNo}
        </p>
      ),
      width: 'auto',
      selector: (row: any) => row?.spinprocess?.batch_lot_no,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <p className="text-[12px] font-medium">
          {translations?.qualityParameter?.reelLotNumber}
        </p>
      ),
      width: 'auto',
      cell: (row: any) => row?.spinprocess?.reel_lot_no,
      sortable: false,
      wrap: true,
    }, {
      name: (
        <p className="text-[12px] font-medium">
          Yarn Type
        </p>
      ),
      width: 'auto',
      cell: (row: any) => row?.spinprocess?.yarn_type,
      sortable: false,
      wrap: true,
    },
    {
      name: <p className="text-[13px] font-medium"> Total Quantity Received </p>,
      cell: (row: any, index: any) => (
        <div className="p-1">
          <>{DecimalFormat(row?.spinprocess?.net_yarn_qty)}</>
        </div>
      ),
      width: 'auto',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Quantity In Stock </p>,
      cell: (row: any, index: any) => (
        <div className="p-1">
          {row.id !== 0 ? (
            <>{DecimalFormat(row?.qty_stock)}</>
          ) : (
            <p className="text-xs font-semibold">
              Total: {DecimalFormat(row.totalNoOfStock)}
            </p>
          )}
        </div>
      ),
      width: 'auto',
      sortable: false,
    },
    {
      name: <p className="text-[13px] font-medium"> Total Quantity Consumed </p>,
      cell: (row: any, index: any) => (
        <div className="p-1">
          <>{DecimalFormat(Number(row?.spinprocess?.net_yarn_qty) - Number(row?.qty_stock))}</>
        </div>
      ),
      width: 'auto',
      sortable: false,
    },
    {
      name: (
        <div className="flex justify-between ">
          <input
            name="check"
            type="checkbox"
            value={tableId}
            checked={checkedValues?.selectAll?.includes(tableId) || false}
            className="mr-2"
            onChange={(e) => handleParentCheckboxChange(e, tableId)}
          />
          Select All
        </div>
      ),
      cell: (row: any, index: any) => {
        return (
          <div>
            <input
              type="checkbox"
              name={row.id}
              checked={!!row.selected}
              onChange={(e) => handlerow(row.spinprocess.id, e.target.checked, tableId)}
            />
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const handleSubmit = () => {
    const selectedYarns: any[] = [];
    data?.forEach((item: any) => {
      item?.data?.forEach((row: any) => {
        const selectedYarnsForItem = row?.yarns?.filter((yarn: any) => yarn.selected)
          .map((selectedYarn: any) => ({
            id: selectedYarn.id,
            process_id: selectedYarn.process_id,
            reelLotNo: row.spinprocess.reel_lot_no ? row.spinprocess.reel_lot_no : null,
            yarnCount: selectedYarn.yarncount.id,
            yarnType: row?.spinprocess?.yarn_type,
            yarnCountName: selectedYarn.yarncount.yarnCount_name,
            totalQty: Number(row.qty_stock),
            qtyUsed: Number(selectedYarn.yarn_produced)
          }));
        selectedYarns.push(...selectedYarnsForItem);
      });
    });

    if (selectedYarns.length > 0) {
      const chooseYarn = {
        chooseYarn: selectedYarns,
        totalQuantityUsed: totalQuantityUsed,
        checkedValues: checkedValues
      };
      sessionStorage.setItem("spinnerChooseYarn", JSON.stringify(chooseYarn));
      router.push("/spinner/sales/add-spinner-sale");
    } else {
      sessionStorage.removeItem("spinnerChooseYarn");
      router.push("/spinner/sales/add-spinner-sale");
    }
  };

  if (loading || roleLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!roleLoading && !Access.create) {
    return (
      <div className="text-center w-full min-h-[calc(100vh-200px)] flex justify-center items-center">
        <h3>You doesn't have Access of this Page.</h3>
      </div>
    );
  }

  if (!roleLoading && Access?.create) {
    return (
      <>
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
                  <NavLink href="/spinner/sales">Sale</NavLink>
                </li>
                <li>
                  <NavLink href="/spinner/sales/add-spinner-sale">New Sale</NavLink>
                </li>
                <li>Choose Yarn</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100 mt-4">
            <div>
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
                    <span className="text-sm ml-1">
                      {programName || ""}
                      {" "}
                    </span>
                  </div>
                </div>
              </div>

            </div>


            {data?.length > 0 ? (
              data.map((item: any, index) => {
                return (
                  <div key={item?.season_id}>
                    <div className="py-6">
                      <h4 className="text-xl font-semibold">
                        SEASON: {item?.season_name}
                      </h4>
                      <h4 className="mt-3 text-md font-semibold">
                        AVAILABLE YARN: {item?.available_yarn}
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
                        columns={columns(item?.season_id)}
                        data={item?.data}
                        expandableRows={true}
                        expandableRowExpanded={(row: any) =>
                          row?.yarns?.some((data: any) => data.selected === true)
                        }
                        expandableRowsComponent={({
                          data: tableData,
                        }: {
                          data: any;
                        }) => {
                          return (
                            <ExpandedComponent
                              data={item?.data}
                              id={tableData?.spinprocess?.id}
                              tableId={item?.season_id}
                              setData={setData}
                              checkedValues={checkedValues}
                              onChildCheckboxChange={handleChildCheckboxChange}
                            />
                          );
                        }}
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
                    columns={columns(0)}
                    data={data}
                  />
                </div>
                <hr className="my-6" />
              </div>
            )}

            <div className="flex justify-end gap-5 mt-5">
              <p className="text-sm font-semibold">
                {translations?.knitterInterface?.totalAvailLint}:{totalyarn}
              </p>
              <p className="text-sm font-semibold">
                {translations?.knitterInterface?.qtyUsed}:{totalQuantityUsed}
              </p>
            </div>
            <div className="pt-12 w-100 d-flex justify-end  customButtonGroup">
              <button
                className="btn-purple mr-2"
                disabled={isSelected}
                style={
                  isSelected
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                onClick={handleSubmit}
              >
                Submit
              </button>
              <button
                className="btn-outline-purple mr-2"
                onClick={() => router.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const ExpandedComponent: React.FC<{
  data: any;
  id: number;
  setData: any;
  tableId: any;
  checkedValues: any;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, tableId, checkedValues, onChildCheckboxChange, setData }) => {
  const handleChildCheckboxChange = (
    item: any,
    isChecked: boolean,
    index: any
  ) => {
    onChildCheckboxChange(item, isChecked, tableId);
  };

  return (
    <div className="flex" style={{ padding: "20px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}>
              S No
            </th>
            <th style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}>
              Yarn Count
            </th>
            <th style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}>
              Yarn Produced
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((main: any) => main.yarns)
            .filter((yarns: any[]) => yarns.some(yarn => yarn.process_id === id))
            .map((yarns: any[], index: any) => (
              <React.Fragment key={index}>
                {yarns.map((yarn: any, baleIndex: any) => (
                  <tr key={baleIndex}>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      {yarn.id}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      {yarn.yarncount?.yarnCount_name}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      {yarn?.yarn_produced}
                    </td>

                    <td
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        fontSize: 12,
                      }}
                    >
                      <input
                        type="checkbox"
                        name={yarn.id}
                        checked={!!yarn.selected}
                        onChange={(e) =>
                          handleChildCheckboxChange(
                            yarn,
                            e.target.checked,
                            id
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
};

