"use client";
import React, { useState, useEffect } from "react";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import API from "@lib/Api";
import DataTable from "react-data-table-component";
import User from "@lib/User";
import useTranslations from "@hooks/useTranslation";
import Loader from "@components/core/Loader";
import checkAccess from "@lib/CheckAccess";
interface ExpandedData {
  baleNo: string;
  weight2: string;
  staple2: string;
  id: string;
  index: any;
}
interface CheckedValues {
  [key: string]: boolean;
}

export default function page() {
  const [roleLoading, hasAccess] = useRole();
  useTitle("Choose Bale");
  const { translations, loading } = useTranslations();
  const [Access, setAccess] = useState<any>({});


  const router = useRouter();
  const ginnerId = User.ginnerId;
  const [data, setData] = useState<any[]>([]);
  const [checkedValues, setCheckedValues] = useState<CheckedValues>({});
  const [isSelected, setIsSelected] = useState<any>(true);
  const [programName, setProgramName] = useState<any>([]);
  const [totalyarn, setTotalQtyYarn] = useState<any>(0);
  const [totalQuantityUsed, setTotalQuantityUsed] = useState<any>(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const search = useSearchParams();
  const programId = search.get("id");

  useEffect(() => {
    if (!roleLoading && hasAccess?.processor?.includes("Ginner")) {
      const access = checkAccess("Ginner Sale");
      if (access) setAccess(access);
    }
  }, [roleLoading, hasAccess]);
  useEffect(() => {
    getProgram()
  }, [programId])
  useEffect(() => {
    if (ginnerId) {
      getGinner();
    }
    // const ProgramName: any = sessionStorage.getItem("ginnerSales");
    // setProgramName(JSON.parse(ProgramName));
  }, [ginnerId]);

  useEffect(() => {
    updateSelectedRows();
  }, [data]);

  useEffect(() => {
    calculateTotalQuantityUsed();
  }, [selectedRows, data]);

  useEffect(() => {
    if (data && data.length > 0) {
      let selectedArray: any = [];
      selectedArray = data
        .map((item: any) => {
          let isSelect = item?.bales?.filter((selected: any) => {
            return selected.select === true;
          });
          if (isSelect?.length > 0) {
            return item;
          }
          return null;
        })
        .filter((val: any) => val !== null);

      if (selectedArray.length > 0) {
        setIsSelected(false);
      } else {
        setIsSelected(true);
      }
    }
  }, [data]);

  const getGinner = async () => {
    try {
      const response = await API.get(
        `ginner-process/sales/choose-bale?ginnerId=${ginnerId}&programId=${programId}`
      );
      if (response.success) {
        let total: number = 0;
        const storedData: any = sessionStorage.getItem("selectedBales");
        let selectedData = (JSON.parse(storedData) as any[]) || [];

        const updatedData = response.data.map((el: any, index: any) => {
          total += Number(el?.weight);
          const selectedRow = selectedData.find((data: any) => {
            const matchingBale = data.bales.some((selectedBale: any) =>
              el.bales.some((bale: any) => selectedBale.baleId === bale.id)
            );
            return matchingBale;
          });

          return {
            ...el,
            index,
            bales: el.bales.map((e: any, innerIndex: any) => {
              const selected =
                selectedRow &&
                selectedRow.bales.some(
                  (selectedBale: any) => selectedBale.baleId === e.id
                );
              return {
                ...e,
                select: selected,
              };
            }),
          };
        });

        const newD = updatedData.map((data: any) => {
          return {
            ...data,
            select: data.bales.every((bale: any) => bale.select)
              ? true
              : checkedValues.selectAll,
          };
        });
        const isSelectAllChecked = newD.every((el: any) => el.select);
        setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });

        setData(newD);
        setTotalQtyYarn(total);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleParentCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked;
    const newdata = data.map((el: any) => ({
      ...el,
      bales: el.bales.map((bale: any) => ({
        ...bale,
        select: isChecked,
      })),
      select: isChecked,
    }));
    setData(newdata);
    const updatedCheckedValues: CheckedValues = {};

    updatedCheckedValues["selectAll"] = isChecked;
    data.forEach((row: any) => {
      updatedCheckedValues[row.id] = isChecked;
    });

    setCheckedValues(updatedCheckedValues);
  };

  const calculateTotalQuantityUsed = () => {
    console.log(selectedRows)
    const totalWeight = selectedRows.reduce(
      (total: any, item: any) =>
        total +
        item.bales.reduce(
          (baleTotal: any, bale: any) => baleTotal + Number(bale.weight),
          0
        ),
      0
    );
    setTotalQuantityUsed(totalWeight);
  };

  const updateSelectedRows = () => {
    const selectedBales: any = data
      .map((row) => {
        const selectedBales = row.bales
          .filter((bale: any) => bale.select)
          .map((bale: any) => ({
            baleId: bale.id,
            baleNo: bale.bale_no,
            reel_lot_no: row.ginprocess?.reel_lot_no,
            lot_no: row.ginprocess?.lot_no,
            weight: bale.weight,
            process_id: bale.process_id,
          }));

        if (selectedBales.length > 0) {
          return {
            bales: selectedBales,
          };
        }
        return null;
      })
      .filter(Boolean);
    setSelectedRows(selectedBales);
  };

  const handleChildCheckboxChange = (
    id: any,
    isChecked: boolean,
    index: any
  ) => {
    const newdata = data.map((el: any) => {
      if (el.index === index) {
        const updatedBales = el.bales.map((bale: any) => {
          if (bale.id === id.id) {
            return {
              ...bale,
              select: isChecked,
            };
          }
          return bale;
        });
        const areAllChildRowsChecked = updatedBales.every(
          (bale: any) => bale.select
        );

        return {
          ...el,
          select: areAllChildRowsChecked ? isChecked : false,
          bales: updatedBales,
        };
      }
      return el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };
  const handlerow = (id: any, isChecked: boolean, index: any) => {
    const newdata = data.map((el: any) => {
      return el.index === index
        ? {
          ...el,
          select: isChecked,
          bales: el.bales.map((e: any) => ({
            ...e,
            select: isChecked,
          })),
        }
        : el;
    });

    setData(newdata);
    const isSelectAllChecked = newdata.every((el: any) => el.select);
    setCheckedValues({ ...checkedValues, selectAll: isSelectAllChecked });
  };

  const columns = [
    {
      name: "S. No",
      cell: (row: any, index: any) => index + 1,
      sortable: false,
    },
    {
      name: "Date",
      selector: (row: any) => row.ginprocess?.date?.substring(0, 10),
    },
    {
      name: "Lot No",
      selector: (row: any) => row.ginprocess?.lot_no,
      sortable: false,
    },
    {
      name: "Weight",
      selector: (row: any) => `${row.weight ? row.weight : 0}`,
      sortable: false,
    },
    {
      name: (
        <div className="flex justify-between ">
          <input
            name="check"
            type="checkbox"
            checked={checkedValues.selectAll || false}
            className="mr-2"
            onChange={handleParentCheckboxChange}
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
              checked={row.select || false}
              onChange={(e) => handlerow(row.id, e.target.checked, index)}
            />
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const handleSubmit = () => {
    const selectedBales = data
      .map((row) => {
        const selectedBales = row.bales
          .filter((bale: any) => bale.select)
          .map((bale: any) => ({
            baleId: bale.id,
            baleNo: bale.bale_no,
            reel_lot_no: row.ginprocess?.reel_lot_no,
            lot_no: row.ginprocess?.lot_no,
            weight: bale.weight,
            process_id: bale.process_id,
          }));

        if (selectedBales.length > 0) {
          return {
            bales: selectedBales,
          };
        }
        return null;
      })
      .filter(Boolean);

    sessionStorage.setItem("selectedBales", JSON.stringify(selectedBales));
    router.push("/ginner/sales/add-lint-sale");
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
                <li className="active">
                  <Link href="/ginner/dashboard">
                    <span className="icon-home"></span>
                  </Link>
                </li>

                <li>
                  <Link href="/ginner/sales">Sale</Link>
                </li>
                <li>
                  <Link href="/ginner/sales/add-lint-sale">New Sale</Link>
                </li>
                <li>Choose Bale</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md mt-4 p-4">
          <div className="w-100 mt-4">
            <div>
              <div className="mb-3">
                <label className="text-sm">Program: </label>
                <span className="text-sm ml-1">
                  {programName || ""}
                </span>
              </div>
            </div>
            <div className="items-center rounded-lg overflow-hidden border border-grey-100">
              <DataTable
                columns={columns}
                data={data}
                expandableRows={true}
                expandableRowExpanded={(row) =>
                  row?.bales?.some((data: any) => data.select === true)
                } 
                expandableRowsComponent={({
                  data: tableData,
                }: {
                  data: ExpandedData;
                }) => {
                  return (
                    <ExpandedComponent
                      data={data}
                      id={tableData?.index}
                      setData={setData}
                      checkedValues={checkedValues}
                      onChildCheckboxChange={handleChildCheckboxChange}
                    />
                  );
                }}
              />
            </div>
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

  checkedValues: CheckedValues;
  onChildCheckboxChange: (id: string, checked: boolean, index: any) => void;
}> = ({ data, id, checkedValues, onChildCheckboxChange, setData }) => {
  const [innerData, setInnerData] = useState<any[]>([]);

  // useEffect(() => {
  //   const newdata = data.map((el: any) => ({
  //     ...el,
  //     bales: el.bales.map((e: any) => ({
  //       ...e,
  //       select: checkedValues.selectAll,
  //     })),
  //     select: checkedValues.selectAll,
  //   }));
  //   // setData(newdata);
  // }, [checkedValues]);

  // const getData = async () => {
  //   try {
  //     const response = await API.get(
  //       "ginner-process/sales/choose-bale?ginnerId=${ginnerId}&programId=8"
  //     );
  //     if (response.success) {
  //       setInnerData(
  //         response.data.map((el: any) => ({
  //           ...el,
  //           select: checkedValues.selectAll,
  //         }))
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const handleChildCheckboxChange = (
    item: any,
    isChecked: boolean,
    index: any
  ) => {
    onChildCheckboxChange(item, isChecked, index);
  };

  return (
    <div className="flex" style={{ padding: "20px" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Bale No
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Weight
            </th>
            {/* <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Staple
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Mic
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Strength (g/tex)
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Trash
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            >
              Colour Grade
            </th>
            <th
              style={{ padding: "8px", border: "1px solid #ddd", fontSize: 14 }}
            ></th> */}
          </tr>
        </thead>
        <tbody>
          {data
            .filter((e: any) => e.index === id)
            .map((item: any, index: any) => {
              return (
                <React.Fragment key={index}>
                  {item.bales.map((bale: any, baleIndex: any) => (
                    <tr key={baleIndex}>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.bale_no}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.weight}
                      </td>
                      {/* <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.staple}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.mic}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.strength}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.trash}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        {bale.color_grade}
                      </td> */}
                      <td
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          fontSize: 12,
                        }}
                      >
                        <input
                          type="checkbox"
                          name={bale.id}
                          checked={bale.select || false}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              bale,
                              e.target.checked,
                              item.index
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
