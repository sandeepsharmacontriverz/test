"use client";
import useTranslations from "@hooks/useTranslation";
import React, { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import { handleDownload } from "@components/core/Download";
import * as XLSX from "xlsx";

import NavLink from "@components/core/nav-link";
import API from "@lib/Api";
import { useRouter } from "next/navigation";
import useTitle from "@hooks/useTitle";
import { IoWarning } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import Select, { GroupBase } from "react-select";

export default function page() {
  useTitle("Upload Database");
  const router = useRouter();
  const { translations, loading } = useTranslations();

  const [isSelected, setIsSelected] = useState<any>(false);

  const [selectedFileFormat, setSelectedFileFormat] = useState("");
  const [country, setCountry] = useState<any>();
  const [state, setState] = useState<any>();
  const [districts, setDistricts] = useState<any>();
  const [blocks, setBlocks] = useState<any>();
  const [jsonStructure, setJsonStructure] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [fileName, setFileName] = useState("");
  const [areaTypes, setAreaTypes] = useState({
    area: "Acre",
    weight: "Kgs",
    yield: "Per Acre",
  });

  const [villageFormat, setVillageFormat] = useState({
    country: "",
    state: "",
    district: "",
    taluk: "",
  });

  const [errors, setErrors] = useState<any>({
    uploadType: "",
    upload: "",
    country: null,
    state: null,
    district: null,
    taluk: null,
  });

  const fileFormats = [
    {
      name: "farmers",
      fileLink: "/files/Farmer_format.xlsx",
      fileName: "Farmer Format",
      fileType: "xlsx",
    },
    {
      name: "procurement",
      fileLink: "/files/Procurement_upload_format.xlsx",
      fileName: "Procurement Format",
      fileType: "xlsx",
    },
    {
      name: "villageData",
      fileLink: "/files/Village-upload-format.csv",
      fileName: "Village Format",
      fileType: "csv",
    },
    {
      name: "garmentType",
      fileLink: "/files/garment_type.csv",
      fileName: "Garment Type Format",
      fileType: "csv",
    },
    {
      name: "styleMark",
      fileLink: "/files/style_mark_number.csv",
      fileName: "Style/Mark No Format",
      fileType: "csv",
    },
    {
      name: "processor",
      fileLink: "/files/processor_list.csv",
      fileName: "Processor List Format",
      fileType: "csv",
    },
    {
      name: "procurement_price",
      fileLink: "/files/procurement_price_update_format.xlsx",
      fileName: "Procurement Price Update Format",
      fileType: "xlsx",
    },
    {
      name: "ginnerExpectedSeed",
      fileLink: "/files/ginner_expected_cotton_data.xlsx",
      fileName: "Ginner Expected Cotton Data",
      fileType: "xlsx",
    },
    {
      name: "ginnerOrder",
      fileLink: "/files/ginner_order_in_hand.xlsx",
      fileName: "Ginner Order in Hand",
      fileType: "xlsx",
    },
    // {
    //   name: 'impact_data',
    //   fileLink: '/files/Impact_data.xlsx',
    //   fileName: 'Impact Data Format',
    //   fileType: 'xlsx',
    // },
  ];

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (villageFormat.country !== undefined && villageFormat.country !== null) {
      getState();
    }
    else {
      setState(null)
      setDistricts(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        state: null,
        district: null
      }));

    }
  }, [villageFormat.country]);

  useEffect(() => {
    if (villageFormat.state !== undefined && villageFormat.state !== null) {
      getDistrict();
    }
    else {
      setDistricts(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        district: null,
      }));
    }

  }, [villageFormat.state]);

  useEffect(() => {
    if (villageFormat.district !== undefined && villageFormat.district !== null) {
      getBlocks();
    }
    else {
      setBlocks(null)
      setVillageFormat((prevData: any) => ({
        ...prevData,
        taluk: null,
      }));
    }

  }, [villageFormat.district]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountry(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getState = async () => {
    try {
      if (villageFormat.country !== "" && villageFormat.country !== undefined && villageFormat.country !== null) {
        const res = await API.get(
          `location/get-states?countryId=${villageFormat.country}`
        );
        if (res.success) {
          setState(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getDistrict = async () => {
    try {
      if (villageFormat.state !== undefined && villageFormat.state !== null) {
        const res = await API.get(
          `location/get-districts?stateId=${villageFormat.state}`
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
      if (villageFormat.district !== undefined && villageFormat.district !== null) {
        const res = await API.get(
          `location/get-blocks?districtId=${villageFormat.district}`
        );
        if (res.success) {
          setBlocks(res.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadData = async (url: any, data: any) => {
    setShow(true);
    setIsSelected(true);
    try {
      const res = await API.post(url, data);
      if (res.success) {
        localStorage.setItem("pass", res.data?.pass?.length);
        if (res.data?.fail?.length > 0) {
          const currentChunk = res.data?.fail?.slice(0, 20000);
          localStorage.setItem("fail", JSON.stringify(currentChunk));
          localStorage.setItem(
            "failCount",
            JSON.stringify(res.data?.fail?.length)
          );
        } else {
          localStorage.setItem("fail", JSON.stringify([]));
        }
        localStorage.setItem("name", selectedFileFormat);
        router.push(`/services/upload-database/upload-status`);
        setShow(false);
      } else {
        setIsSelected(false);
        setShow(false);
      }
    } catch (error) {
      setShow(false);
      setIsSelected(false);
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;
    if (!selectedFileFormat) {
      setErrors((prevError: any) => ({
        ...prevError,
        uploadType: "This field is Required",
      }));
      return;
    }

    if (jsonStructure.length === 0) {
      setErrors((prevError: any) => ({
        ...prevError,
        upload: "This field  is Required",
      }));
      hasErrors = true;
    }

    if (!villageFormat.country) {
      setErrors((prevError: any) => ({
        ...prevError,
        country: "This field  is Required",
      }));
      hasErrors = true;
    }

    if (!villageFormat.state) {
      setErrors((prevError: any) => ({
        ...prevError,
        state: "This field  is Required",
      }));
      hasErrors = true;
    }

    if (!villageFormat.district) {
      setErrors((prevError: any) => ({
        ...prevError,
        district: "This field  is Required",
      }));
      hasErrors = true;
    }

    if (!villageFormat.taluk) {
      setErrors((prevError: any) => ({
        ...prevError,
        taluk: "This field  is Required",
      }));
      hasErrors = true;
    }

    if (
      !hasErrors &&
      selectedFileFormat === "villageData" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        villageData: jsonStructure,
        blockId: villageFormat.taluk,
      };
      uploadData("upload-database/village", jsonData);
    }

    if (
      selectedFileFormat === "garmentType" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        garmentType: jsonStructure,
      };
      uploadData("upload-database/garment-type", jsonData);
    }

    if (
      selectedFileFormat === "styleMark" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        styleMark: jsonStructure,
      };
      uploadData("upload-database/style-mark", jsonData);
    }

    if (
      selectedFileFormat === "ginnerOrder" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        ginnerOrder: jsonStructure,
      };
      uploadData("upload-database/ginner-order", jsonData);
    }

    if (
      selectedFileFormat === "ginnerExpectedSeed" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        ginnerExpectedSeed: jsonStructure,
      };
      uploadData("upload-database/ginner-expected", jsonData);
    }

    if (
      selectedFileFormat === "processor" &&
      jsonStructure?.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        processorData: jsonStructure,
      };
      uploadData("upload-database/processor-list", jsonData);
    }

    if (
      selectedFileFormat === "procurement_price" &&
      jsonStructure?.length > 0 &&
      !errors.upload
    ) {
      const jsonData = {
        procurementPriceData: jsonStructure,
      };
      uploadData("upload-database/procurement-price", jsonData);
    }

    if (
      selectedFileFormat === "farmers" &&
      jsonStructure.farmers?.length > 0 &&
      !errors.upload
    ) {
      jsonStructure?.farmers?.forEach((farmer: any) => {
        if (farmer.agriTotalArea) {
          farmer.agriTotalArea = convertArea(
            farmer.agriTotalArea,
            areaTypes.area
          );
        }
        if (farmer.cottonTotalArea) {
          farmer.cottonTotalArea = convertArea(
            farmer.cottonTotalArea,
            areaTypes.area
          );
        }
        if (farmer.agriEstimatedYield) {
          farmer.agriEstimatedYield = convertYield(
            farmer.agriEstimatedYield,
            areaTypes.yield
          );
        }
        if (farmer.agriEstimatedProd) {
          farmer.agriEstimatedProd = convertWeight(
            farmer.agriEstimatedProd,
            areaTypes.weight
          );
        }
        if (farmer.totalEstimatedCotton) {
          farmer.totalEstimatedCotton = convertWeight(
            farmer.totalEstimatedCotton,
            areaTypes.weight
          );
        }
      });

      uploadData("upload-database/farmer", jsonStructure);
    }
    if (
      selectedFileFormat === "procurement" &&
      jsonStructure.length > 0 &&
      !errors.upload
    ) {
      jsonStructure?.forEach((qtyPurchased: any) => {
        if (qtyPurchased.qtyPurchased) {
          qtyPurchased.qtyPurchased = convertWeight(
            qtyPurchased.qtyPurchased,
            areaTypes.weight
          );
        }
        qtyPurchased.farmerCode = qtyPurchased?.farmerCode?.toString()
        qtyPurchased.grade = qtyPurchased?.grade?.toString()
        qtyPurchased.qtyPurchased = qtyPurchased?.qtyPurchased?.toString()
        qtyPurchased.rate = qtyPurchased?.rate?.toString()
        qtyPurchased.totalAmount = qtyPurchased?.totalAmount?.toString()
      });
      const jsonData = {
        transaction: jsonStructure,
      };
      uploadData("procurement/upload-transactions", jsonData);
    }
  };

  const convertArea = (value: any, unit: any) => {
    if (unit === "mu") {
      const res = value * 0.16;
      return res.toFixed(2);
    } else if (unit === "hectare") {
      const res = value * 2.47;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const convertWeight = (value: any, unit: any) => {
    if (unit === "tons") {
      const res = value * 1000;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const convertYield = (value: any, unit: any) => {
    if (unit === "hectare") {
      const res = value / 2.47;
      return res.toFixed(2);
    } else if (unit === "mu") {
      const res = value / 0.16;
      return res.toFixed(2);
    } else {
      return value;
    }
  };

  const handleFile = (buttonName: string) => {
    const selectedFormat = fileFormats.find(
      (format) => format.name === buttonName
    );
    if (selectedFormat) {
      handleDownload(
        selectedFormat.fileLink,
        selectedFormat.fileName,
        selectedFormat.fileType
      );
    } else {
      console.error("File format not found");
    }
  };

  const handleChange = (name?: any, value?: any, event?: any) => {

    if (
      name == "country" ||
      name == "state" ||
      name == "district" ||
      name == "taluk"
    ) {
      setVillageFormat((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));

      setErrors((prevError: any) => ({
        ...prevError,
        [name]: "",
      }));
    } else {
      setAreaTypes((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  const convertNumericToDate = (numericValue: any) => {
    let date;
    if (typeof numericValue === "number") {
      date = new Date((numericValue - 25569) * 86400 * 1000);
    } else {
      date = numericValue;
      if (date.includes("/")) {
        if (date.includes("-")) {
          date = null;
        } else {
          const dateComponents = date.split("/");

          if (dateComponents.length !== 3) {
            date = null;
          }

          const firstComponent = parseInt(dateComponents[0], 10);
          const secondComponent = parseInt(dateComponents[1], 10);
          const year = parseInt(dateComponents[2], 10);

          if (isNaN(firstComponent) || isNaN(secondComponent) || isNaN(year)) {
            date = null;
          }

          if (firstComponent > 12) {
            if (firstComponent > 12 && firstComponent < 31) {
              date = new Date(year, secondComponent - 1, firstComponent);
            }
            else if (secondComponent > 12) {
              date = new Date(firstComponent, year - 1, secondComponent);
            }
            else {
              date = new Date(firstComponent, secondComponent - 1, year);
            }
          } else if (secondComponent > 12) {
            date = new Date(year, firstComponent - 1, secondComponent);
          } else {
            date = new Date(year, firstComponent - 1, secondComponent);
          }
        }
      } else if (date.includes("-")) {
        const dateComponents = date.split("-");

        if (dateComponents.length !== 3) {
          date = null;
        }

        const firstComponent = parseInt(dateComponents[0], 10);
        const secondComponent = parseInt(dateComponents[1], 10);
        const year = parseInt(dateComponents[2], 10);

        if (isNaN(firstComponent) || isNaN(secondComponent) || isNaN(year)) {
          date = null;
        }

        if (firstComponent > 12) {
          if (firstComponent > 12 && firstComponent < 31) {
            date = new Date(year, secondComponent - 1, firstComponent);
          }
          else if (secondComponent > 12) {
            date = new Date(firstComponent, year - 1, secondComponent);
          }
          else {
            date = new Date(firstComponent, secondComponent - 1, year);
          }
        } else if (secondComponent > 12) {
          date = new Date(year, firstComponent - 1, secondComponent);
        } else {
          date = new Date(year, firstComponent - 1, secondComponent);
        }
      }
    }
    return date;
  };

  const headerMapping: any = {
    "Program:": "program",
    "Brand:": "brand",
    "Farm Group:": "farmGroup",
    "Season:": "season",
  };

  // Function to validate the Excel headers against JSON keys
  const validateHeaders = (excelHeaders: any, expectedKeys: any) => {
    return excelHeaders.every((header: any) => expectedKeys.includes(header));
  };

  const excelToJson = async (event: any) => {
    const file = event.target?.files[0];
    if (!selectedFileFormat) {
      return setErrors((prevError: any) => ({
        ...prevError,
        uploadType: "Select this field first",
      }));
    }

    if (file) {
      const allowedFormats = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!allowedFormats.includes(file?.type)) {
        setErrors((prevError: any) => ({
          ...prevError,
          upload: `Invalid file format. Please upload a xlsx, csv or xls file.`,
        }));
        return null;
      }

      if (file.name) {
        setFileName(file.name);
      }

      if (selectedFileFormat === "farmers") {
        setIsSelected(true);
        const reader = new FileReader();
        reader.onload = async (e: any) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          const sheetName = workbook.SheetNames[0];
          const sheet: any = workbook.Sheets[sheetName];

          const headers: any = {};
          XLSX.utils
            .sheet_to_json(sheet, {
              header: 1,
              range: 1,
            })
            .forEach((row: any) => {
              row.forEach((value: any, index: any) => {
                const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
                const mergedCell = sheet[cellAddress];
                if (!mergedCell || !mergedCell.m) {
                  headers[cellAddress] = value;
                }
              });
            });

          const json: any = {};
          for (let row = 1; row <= 4; row++) {
            const headerCell = sheet["A" + row];
            const valueCell = sheet["B" + row];

            if (headerCell && valueCell) {
              const header = headerCell.v; // Remove extra spaces
              const value = valueCell.v;

              const key = headerMapping[header] || header;
              json[key] = value;
            }
          }

          const preprocessHeader = (header: string) => {
            return header
              .replace(/[^\w\s]/gi, "")
              .replace(/\s+/g, "_")
              .toLowerCase();
          };

          const convertHeaderName = (header: string) => {
            const headerMappingsComplex: { [key: string]: string } = {
              date_of_joining: "dateOfJoining",
              first_name: "firstName",
              last_name: "lastName",
              farmer_code: "farmerCode",
              country: "country",
              state: "state",
              district: "district",
              talukblocktehsil: "block",
              certification_status: "certStatus",
              estimated_yield_kgac: "agriEstimatedYield",
              ics_name: "icsName",
              total_agriculture_area: "agriTotalArea",
              total_cotton_area: "cottonTotalArea",
              total_estimated_cotton: "totalEstimatedCotton",
              total_estimated_production: "agriEstimatedProd",
              tracenet_id: "tracenetId",
              village: "village",
            };

            const preprocessedHeader =
              typeof header === "string" ? preprocessHeader(header) : ""; // Preprocess the header name

            return (
              headerMappingsComplex[preprocessedHeader] || preprocessedHeader
            );
            // return headerMappingsComplex[preprocessHeader(header)] || preprocessHeader(header);
          };

          const range = XLSX.utils.decode_range(sheet["!ref"]);
          const headersComplex = [];
          const rows = [];

          for (let C = range.s.c; C <= range.e.c && C < 10; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 4, c: C });
            const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
            headersComplex.push(header);
          }

          for (let C = 10; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 5, c: C });
            const header = convertHeaderName(sheet[cellAddress]?.v); // Preprocess the header
            headersComplex.push(header);
          }

          for (let R = range.s.r + 6; R <= range.e.r; ++R) {
            const row: any = {};
            for (let C = 0; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              row[headersComplex[C]] = sheet[cellAddress]?.v || "";
            }
            rows.push(row);
          }

          const farmersData = rows;
          farmersData.forEach((farmer: any) => {
            if (farmer.dateOfJoining) {
              farmer.dateOfJoining = convertNumericToDate(farmer.dateOfJoining);
            }
            farmer.certStatus = farmer.certStatus;
            farmer.agriTotalArea =
              farmer?.agriTotalArea === "" ? 0 : farmer?.agriTotalArea;
            farmer.agriEstimatedYield =
              farmer?.agriEstimatedYield === ""
                ? 0
                : farmer?.agriEstimatedYield;
            farmer.cottonTotalArea =
              farmer?.cottonTotalArea === "" ? 0 : farmer?.cottonTotalArea;
            farmer.totalEstimatedCotton =
              farmer?.totalEstimatedCotton === ""
                ? 0
                : farmer?.totalEstimatedCotton;
            farmer.agriEstimatedProd =
              farmer?.agriEstimatedProd === "" ? 0 : farmer?.agriEstimatedProd;
            farmer.farmerCode = farmer?.farmerCode.toString();
          });

          const jsonData = {
            ...json,
            farmers: farmersData,
          };
          const expectedHeaders = [
            "sno",
            "dateOfJoining",
            "firstName",
            "lastName",
            "farmerCode",
            "country",
            "state",
            "district",
            "block",
            "village",
            "agriTotalArea",
            "agriEstimatedYield",
            "agriEstimatedProd",
            "cottonTotalArea",
            "totalEstimatedCotton",
            "tracenetId",
            "icsName",
            "certStatus",
          ];
          if (!validateHeaders(headersComplex, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
            setIsSelected(false);
          } else {
            setJsonStructure(jsonData);
            setIsSelected(false);
            if (jsonData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const workbook = XLSX.read(await file.arrayBuffer(), {
          type: "buffer",
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: any = XLSX.utils.sheet_to_json(sheet);

        const excelHeaders =
          jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

        if (selectedFileFormat === "villageData") {
          const newJsonStructure: any = jsonData.map((item: any) => ({
            village: item["Village Name"],
          }));
          const expectedHeaders = ["Sno", "Village Name"];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(newJsonStructure);
            if (newJsonStructure.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        if (selectedFileFormat === "garmentType") {
          const newJsonStructure: any = jsonData.map((item: any) => ({
            name: String(item["name"]),
          }));
          const expectedHeaders = ["id", "name"];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(newJsonStructure);
            if (newJsonStructure.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }
        if (selectedFileFormat === "ginnerOrder") {
          const convertedData = jsonData.map((item: any) => ({
            season: item["Season"],
            uploadDate: item["Upload Date"],
            ginningMill: item["Ginning Mill"],
            brand: item["Brand"],
            program: item["Program"],
            confirmedBales: item["Confirmed No of Bales Order in Hand"],
            confirmedLintOrder: item["Confirmed Lint Order in Hand MT"],
          }));

          convertedData.forEach((data: any) => {
            if (data.uploadDate) {
              data.uploadDate = convertNumericToDate(data.uploadDate);
            }
          });
          const expectedHeaders = [
            "Season",
            "Upload Date",
            "Ginning Mill",
            "Brand",
            "Program",
            "Confirmed No of Bales Order in Hand",
            "Confirmed Lint Order in Hand MT",
          ];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }
        if (selectedFileFormat === "ginnerExpectedSeed") {
          const convertedData = jsonData.map((item: any) => ({
            season: item["Season"],
            ginningMill: item["Ginning Mill"],
            brand: item["Brand"],
            program: item["Program"],
            expectedSeedCotton: item["Expected Seed Cotton (KG)"],
            expectedLint: item["Expected Lint in MT"],
          }));
          const expectedHeaders = [
            "Season",
            "Ginning Mill",
            "Brand",
            "Program",
            "Expected Seed Cotton (KG)",
            "Expected Lint in MT",
          ];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        if (selectedFileFormat === "styleMark") {
          const newJsonStructure: any = jsonData.map((item: any) => ({
            style_mark_no: String(item["style_mark_no"]),
          }));
          const expectedHeaders = ["id", "style_mark_no"];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(newJsonStructure);
            if (newJsonStructure.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        if (selectedFileFormat === "procurement") {
          const convertedData = jsonData.map((item: any) => ({
            season: item["Season"],
            date: item["Date"],
            farmerName: item["Farmer Name"],
            farmerCode: item["Farmer Code/ Tracenet Id"],
            country: item["Country"],
            state: item["State"],
            district: item["District"],
            block: item["Taluk/Block/Tehsil"],
            village: item["Village"],
            qtyPurchased: item["Qty. Purchased (Kg)"],
            rate: item["Rate (INR/Kg)"],
            grade: item["Grade"],
            totalAmount: item["Total Amount"],
            ginner: item["Ginner"],
            vehicle: item["Transport Vehicle"],
            paymentMethod: item["Payment Method"],
          }));
          convertedData.forEach((data: any) => {
            if (data.date) {
              data.date = convertNumericToDate(data.date);
            }
          });
          const expectedHeaders = [
            "Season",
            "Date",
            "Country",
            "State",
            "District",
            "Taluk/Block/Tehsil",
            "Village",
            "Farmer Name",
            "Farmer Code/ Tracenet Id",
            "Qty. Purchased (Kg)",
            "Rate (INR/Kg)",
            "Grade",
            "Total Amount",
            "Ginner",
            "Transport Vehicle",
            "Payment Method",
          ];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        if (selectedFileFormat === "processor") {
          const convertedData = jsonData.map((item: any) => ({
            name: item["name"],
            address: item["address"],
          }));
          const expectedHeaders = ["id", "name", "address"];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }

        if (selectedFileFormat === "procurement_price") {
          const convertedData = jsonData.map((item: any) => ({
            transactionId: item["Transaction ID"],
            oldPrice: item["Old Price"],
            newPrice: item["New Price"],
          }));
          const expectedHeaders = ["Transaction ID", "Old Price", "New Price"];
          if (!validateHeaders(excelHeaders, expectedHeaders)) {
            setErrors((prevError: any) => ({
              ...prevError,
              upload: "Wrong Format.",
            }));
            return;
          } else {
            setJsonStructure(convertedData);
            if (convertedData.length == 0) {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "The file you selected is empty",
              }));
              return;
            } else {
              setErrors((prevError: any) => ({
                ...prevError,
                upload: "",
              }));
            }
          }
        }
      }
    }
  };

  if (loading) {
    return <div> Loading...</div>;
  }
  return (
    <div>
      <div className="breadcrumb-box">
        <div className="breadcrumb-inner light-bg">
          <div className="breadcrumb-left">
            <ul className="breadcrum-list-wrap">
              <li>
                <NavLink href="/dashboard" className="active">
                  <span className="icon-home"></span>
                </NavLink>
              </li>
              <li>Services</li>
              <li>Upload Database</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-md p-4">
        <div className="w-100">
          <p className="text-sm font-semibold">
            Download these valid format excel sheets to use in upload
          </p>
          <div className="customFormSet mt-3">
            <div className="w-100">
              <div className="row">
                <div className="py-3 flex justify-left gap-6 flex-wrap">
                  <div className="flex items-center">
                    <button
                      name="farmers"
                      type="button"
                      onClick={() => handleFile("farmers")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Farmer Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      name="procurement"
                      type="button"
                      onClick={() => handleFile("procurement")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Procurement Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      name="villageData"
                      type="button"
                      onClick={() => handleFile("villageData")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Village Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      name="garmentType"
                      type="button"
                      onClick={() => handleFile("garmentType")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Garment Type Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      name="styleMark"
                      onClick={() => handleFile("styleMark")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Style/Mark No Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      name="processor"
                      onClick={() => handleFile("processor")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Processor List Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      name="procurement_price"
                      onClick={() => handleFile("procurement_price")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Procurement Price Update Format
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      name="ginnerExpectedSeed"
                      onClick={() => handleFile("ginnerExpectedSeed")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Ginner expected Steel Cotton Data
                    </button>
                  </div>
                  <div className="flex items-center">
                    <button
                      name="ginnerOrder"
                      type="button"
                      onClick={() => handleFile("ginnerOrder")}
                      className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
                    >
                      <FaDownload className="mr-2" />
                      Ginner Order in Hand
                    </button>
                  </div>
                  {/* <div className='flex items-center'>
              <button
                name='impact_data'
                type="button"
                onClick={() => handleFile('impact_data')}
                className="bg-orange-400 flex text-sm rounded text-white px-2 py-1.5"
              >
                <FaDownload className='mr-2' />
                Impact Data Format
              </button>
            </div> */}
                </div>
              </div>
              <div className=" text-sm flex items-center">
                <IoWarning size={18} />
                <p className="text-sm m-1">
                  Do not use cell formatting or formulas
                </p>
              </div>
              <hr className="my-4" />
              <div className="row mt-5">
                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Select Upload Type *
                  </label>

                  {/* <Form.Select
                    aria-label="uploadType"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                    name="uploadType"
                    value={selectedFileFormat || ""}
                    onChange={(e: any) => {
                      setSelectedFileFormat(e.target.value);
                      setVillageFormat({
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });
                      setAreaTypes({
                        area: "acre",
                        weight: "kgs",
                        yield: "acre",
                      });
                      setErrors({
                        uploadType: "",
                        upload: "",
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });
                      setJsonStructure([]);
                      setFileName("");
                    }}
                  >
                    <option value="">Select Upload Type</option>
                    {fileFormats.map((format) => (
                      <option key={format.name} value={format.name}>
                        {format.fileName}
                      </option>
                    ))}
                  </Form.Select> */}

                  <Select
                    name="uploadType"
                    value={selectedFileFormat ?
                      {
                        label: fileFormats?.find((file: any) => file.name === selectedFileFormat)?.fileName,
                        value: selectedFileFormat
                      } : null}

                    menuShouldScrollIntoView={false}
                    isClearable
                    placeholder="Select Upload Type"
                    className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                    options={(fileFormats || []).map(({ id, fileName, name }: any) => ({
                      label: fileName,
                      value: name,
                      key: id
                    }))}
                    onChange={(item: any, e: any) => {
                      setSelectedFileFormat(item?.value);
                      setJsonStructure([]);
                      setVillageFormat({
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });
                      setAreaTypes({
                        area: "Acre",
                        weight: "Kgs",
                        yield: "Per Acre",
                      });
                      setErrors({
                        uploadType: "",
                        upload: "",
                        country: "",
                        state: "",
                        district: "",
                        taluk: "",
                      });

                    }}
                  />
                  {errors.uploadType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.uploadType}
                    </p>
                  )}
                </div>
              </div>

              {(selectedFileFormat == "" || selectedFileFormat !== null || selectedFileFormat !== undefined ||
                selectedFileFormat == "farmers" ||
                selectedFileFormat == "garmentType" ||
                selectedFileFormat == "styleMark" ||
                selectedFileFormat === "processor" ||
                selectedFileFormat == "ginnerOrder" ||
                selectedFileFormat == "procurement" ||
                selectedFileFormat == "ginnerExpectedSeed") && (
                  <>
                    {selectedFileFormat != "procurement" &&
                      selectedFileFormat != "ginnerExpectedSeed" &&
                      selectedFileFormat != "villageData" &&
                      selectedFileFormat != "procurement_price" &&

                      (
                        <div className="row">
                          <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                            <label className="text-gray-500 text-[12px] font-medium">
                              Area Measured in *
                            </label>
                            {/* <Form.Select
                              aria-label="Country"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                              name="area"
                              value={areaTypes.area || ""}
                              onChange={(event) => handleChange(event)}
                            >
                              <option value="acre">Acre</option>
                              <option value="hectare">Hectare</option>
                              <option value="mu">Mu</option>
                            </Form.Select> */}
                            <Select
                              name="area"
                              value={areaTypes.area ? { label: areaTypes.area, value: areaTypes.area } : null}
                              menuShouldScrollIntoView={false}
                              placeholder="Select Area"
                              className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                              options={[
                                { label: "Acre", value: "acre" },
                                { label: "Hectare", value: "hectare" },
                                { label: "Mu", value: "mu" }
                              ]}
                              onChange={(item: any) => {
                                handleChange("area", item?.label);
                              }}
                            />
                          </div>
                        </div>
                      )}
                    {selectedFileFormat != "villageData" &&
                      selectedFileFormat != "procurement_price" &&
                      <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Weight Measured in *
                          </label>
                          {/* <Form.Select
                          aria-label="Weight"
                          className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                          name="weight"
                          value={areaTypes.weight || ""}
                          onChange={(event) => handleChange(event)}
                        >
                          <option value="kgs">Kgs</option>
                          <option value="tons">Tons</option>
                        </Form.Select> */}
                          <Select
                            name="weight"
                            value={areaTypes.weight ? { label: areaTypes.weight, value: areaTypes.weight } : null}
                            menuShouldScrollIntoView={false}
                            placeholder="Select Weight"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={[
                              { label: "Kgs", value: "kgs" },
                              { label: "Tons", value: "tons" }
                            ]}
                            onChange={(item: any) => {
                              handleChange("weight", item?.label);
                            }}
                          />

                        </div>
                      </div>
                    }
                    {(selectedFileFormat != "procurement") && (selectedFileFormat != "villageData") && (selectedFileFormat != "procurement_price") && (
                      <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                          <label className="text-gray-500 text-[12px] font-medium">
                            Yield Estimated for
                          </label>
                          {/* <Form.Select
                            aria-label="Yield"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm"
                            name="yield"
                            value={areaTypes.yield || ""}
                            onChange={(event) => handleChange(event)}
                          >
                            <option value="acre">Per Acre</option>
                            <option value="hectare">Per Hectare</option>
                            <option value="mu">Per Mu</option>
                          </Form.Select> */}
                          <Select
                            name="yield"
                            value={areaTypes.yield ? { label: areaTypes.yield, value: areaTypes.yield } : null}
                            menuShouldScrollIntoView={false}
                            placeholder="Select Yield"
                            className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                            options={[
                              { label: "Per Acre", value: "acre" },
                              { label: "Per Hectare", value: "hectare" },
                              { label: "Per Mu", value: "mu" }
                            ]}
                            onChange={(item: any) => {
                              handleChange("yield", item?.label);
                            }}
                          />

                        </div>
                      </div>
                    )}
                  </>
                )}

              {selectedFileFormat === "villageData" && (
                <>
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Country *
                      </label>
                      <Select
                        name="country"
                        value={villageFormat.country ? { label: country?.find((county: any) => county.id == villageFormat.country)?.county_name, value: villageFormat.country } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select a Country"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(country || []).map(({ id, county_name }: any) => ({
                          label: county_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("country", item?.value);
                        }}
                      />
                      {errors.country && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        State *
                      </label>
                      <Select
                        name="state"
                        value={villageFormat.state ? { label: state?.find((state: any) => state.id == villageFormat.state)?.state_name, value: villageFormat.state } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select State"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(state || []).map(({ id, state_name }: any) => ({
                          label: state_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("state", item?.value);
                        }}
                      />
                      {errors.state && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        District *
                      </label>
                      <Select
                        name="district"
                        value={villageFormat.district ? { label: districts?.find((district: any) => district.id == villageFormat.district)?.district_name, value: villageFormat.district } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select District"
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(districts || []).map(({ id, district_name }: any) => ({
                          label: district_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("district", item?.value);
                        }}
                      />
                      {errors.district && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                      <label className="text-gray-500 text-[12px] font-medium">
                        Block/Taluk *
                      </label>

                      <Select
                        name="taluk"
                        value={villageFormat.taluk ? { label: blocks?.find((taluk: any) => taluk.id == villageFormat.taluk)?.block_name, value: villageFormat.taluk } : null}
                        menuShouldScrollIntoView={false}
                        isClearable
                        placeholder="Select Block/Taluk "
                        className="dropDownFixes rounded-md formDropDown mt-1 text-sm borderBottom"
                        options={(blocks || []).map(({ id, block_name }: any) => ({
                          label: block_name,
                          value: id,
                          key: id
                        }))}
                        onChange={(item: any) => {
                          handleChange("taluk", item?.value);
                        }}
                      />
                      {errors.taluk && (
                        <p className="text-red-500  text-sm mt-1">
                          {errors.taluk}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-12 mb-2">
                  <label className="text-gray-500 text-[12px] font-medium">
                    Upload Excel
                  </label>
                  <div className="inputFile">
                    <label>
                      Choose File <GrAttachment />
                      <input
                        type="file"
                        accept=".xlsx, .csv, .xls"
                        name="upload"
                        id="upload"
                        onChange={excelToJson}
                        onClick={(event: any) => {
                          event.currentTarget.value = null;
                        }}
                      />
                    </label>
                  </div>
                  {fileName && (
                    <div className="flex text-sm mt-1">
                      <GrAttachment />
                      <p className="mx-1">{fileName}</p>
                    </div>
                  )}
                  {errors.upload && (
                    <p className="text-red-500 text-sm mt-1">{errors.upload}</p>
                  )}
                </div>
              </div>
              {show && (
                <div className="flex justify-center items-center mt-5">
                  <p className="text-green-600 ">
                    Uploading Database, Please wait....
                  </p>
                </div>
              )}
              <div className="pt-12 w-100 d-flex justify-content-between customButtonGroup">
                <section>
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
                    {translations.common.submit}
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
