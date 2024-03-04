"use client";
import React, { useState, useEffect } from "react";
import UserAccess from "@components/core/UserAccess";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTitle from "@hooks/useTitle";
import useRole from "@hooks/useRole";
import Loader from "@components/core/Loader";
import MultiSelectDropdown from "@components/core/MultiSelectDropDown";
import API from "@lib/Api";
import { toasterSuccess } from "@components/core/Toaster";
import { GrAttachment } from "react-icons/gr";

let intializeData: any = {
  firstname: "",
  position: "",
  username: "",
  email: "",
  mobile: "",
  password: "",
  reenterpassword: "",
  status: "",
  role: "",
  ticketCountryAccess: "",
  ticketApproveAccess: null,
  ticketAccessOnly: null,
};

export default function page() {
  useTitle("Add Retailer & Brand");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [countries, setCountries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState<any>([]);
  const [role, setRole] = useState<any>([]);
  const [brandErrors, setBrandErrors] = useState<any>({});
  const [userErrors, setUserErrors] = useState<any>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  const [users, setUsers] = useState<any>([
    {
      firstname: "",
      position: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
      reenterpassword: "",
      status: null,
      role: "",
      ticketCountryAccess: [],
      ticketApproveAccess: null,
      ticketAccessOnly: null,
    },
  ]);

  const [fileName, setFileName] = useState({ logo: "", photo: "" })

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    address: "",
    programsIds: [],
    website: "",
    countriesIds: [],
    contactPerson: "",
    companyInfo: "",
    mobile: "",
    landline: "",
    logo: "",
    photo: "",
  });

  useEffect(() => {
    getUserRoles();
    getCountries();
    getPrograms();
  }, []);

  const getCountries = async () => {
    const res = await API.get("location/get-countries");
    if (res.success) {
      setCountries(res.data);
    }
  };

  const getPrograms = async () => {
    const res = await API.get("program");
    if (res.success) {
      setPrograms(res.data);
    }
  };

  const getUserRoles = async () => {
    const res = await API.get("user/get-user-roles");
    if (res.success) {
      const roles = res.data?.filter((item: any) => item.user_role === "Brand");
      setRole(roles);
    }
  };

  const handleSelectionChange = (
    selectedOptions: string[],
    name: string,
    index: number = 0
  ) => {
    if (name === "countriesIds") {
      setSelectedCountries(selectedOptions);
      const result = selectedOptions
        .map((item: string) => {
          const find: any = countries.find((option: any) => {
            return option.county_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, countriesIds: result };
      });
      setBrandErrors((prevData: any) => {
        return { ...prevData, countriesIds: "" };
      });
    }
    if (name === "programsIds") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = programs.find((option: any) => {
            return option.program_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setFormData((prevData: any) => {
        return { ...prevData, programsIds: result };
      });
      setBrandErrors((prevData: any) => {
        return { ...prevData, programsIds: "" };
      });
    }
    if (name === "ticketCountryAccess") {
      const newUsers = [...users];
      const result = selectedOptions
        .map((item: string) => {
          const find: any = countries.find((option: any) => {
            return option.county_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      newUsers[index]["ticketCountryAccess"] = result;
      setUsers(newUsers);
      const updatedUserErrors = [...userErrors];
      updatedUserErrors[index]["ticketCountryAccess"] = "";
      setUserErrors(updatedUserErrors);

    }
  };

  const alreadyExistsCheck = async (
    name: string,
    value: string,
    index: number
  ) => {
    const res = await API.post("brand/user", {
      [name]: value,
    });

    const newErrors = [...userErrors];

    if (res?.data?.user === true) {
      newErrors[index] = {
        ...newErrors[index],
        [name]: "Already Exists. Please try another",
      };
    } else {
      newErrors[index] = {
        ...newErrors[index],
        [name]: "",
      };
    }

    setUserErrors(newErrors);
  };

  const alreadyExistName = async (e: any) => {
    const { name, value } = e.target;
    const regexAlphabets = /^[()&.\-_a-zA-Z ]*$/;
    if (value != "") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        const res = await API.post("brand/check-brand", {
          [name]: value,
        });

        if (res?.data?.exist === true) {
          setBrandErrors((prev: any) => ({
            ...prev,
            [name]: "Name Already Exists. Please Try Another",
          }));
        } else {
          setBrandErrors((prev: any) => ({
            ...prev,
            [name]: "",
          }));
        }
      }
    }
  };
  const onBlurCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string,
    index: number
  ) => {
    const { name, value } = e.target;

    if (name == "username") {
      if (value != "") {
        alreadyExistsCheck(name, value, index);
      }
    } else {
      const newErrors = [...userErrors];
      const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
      const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

      if (value != "" && type == "alphabets") {
        const valid = regexAlphabets.test(value);
        if (!valid) {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "Accepts only Alphabets and special characters like _,-,()",
          };
        } else {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "",
          };
        }
      } else if (value !== "" && type == "email") {
        const valid = regexEmail.test(value);
        if (!valid) {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "Invalid format",
          };
        } else {
          newErrors[index] = {
            ...newErrors[index],
            [name]: "",
          };
          if (value != "") {
            alreadyExistsCheck(name, value, index);
          }
        }
      }
      setUserErrors(newErrors);
    }
  };

  const onBlurCheckBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "name" && value !== "") {
      alreadyExistName(e);
    }
  };

  const checkFormat = (e: any, type: string) => {
    const { name, value } = e.target;
    const regexWebsite =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regexAlphabets = /^[()\-_a-zA-Z ]*$/;
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (value != "" && type == "alphabets") {
      const valid = regexAlphabets.test(value);
      if (!valid) {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "Accepts only Alphabets and special characters like _,-,()",
        }));
      } else {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (value !== "" && type == "website") {
      const valid = regexWebsite.test(value);
      if (!valid) {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid format for website",
        }));
      } else {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else if (value !== "" && type == "email") {
      const valid = regexEmail.test(value);
      if (!valid) {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "Invalid format for email",
        }));
      } else {
        setBrandErrors((prev: any) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  const onUserAccessChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, type } = e.target;
    const newUsers = [...users];
    const newErrors = [...userErrors];

    if (type === "radio") {
      if (name === `status-${index}`) {
        newUsers[index]["status"] = value === "active" ? true : false;
        newErrors[index] = { ...(newErrors[index] || {}), status: "" };
      } else if (name === `ticketApproveAccess-${index}`) {
        newUsers[index]["ticketApproveAccess"] = value === "yes" ? true : false;
        newErrors[index] = { ...(newErrors[index] || {}), ticketApproveAccess: "" };
      } else if (name === `ticketAccessOnly-${index}`) {
        newUsers[index]["ticketAccessOnly"] = value === "yes" ? true : false;
        newErrors[index] = { ...(newErrors[index] || {}), ticketAccessOnly: "" };
      }
    } else {
      newUsers[index][name] = value;
    }

    newErrors[index] = {
      ...newErrors[index],
      [name]: "",
    };

    setUsers(newUsers);
    setUserErrors(newErrors);
  };



  const handleChange = (event: any) => {
    const { name, value } = event.target;

    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
    setBrandErrors((prevError: any) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleFileChange = async (e: any, defSize: number) => {
    const { name, files } = e.target;
    const allowedFormats = ["jpg", "jpeg", "bmp", "png"];
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setBrandErrors((prevError: any) => ({
        ...prevError,
        [name]: `No file selected.`,
      }));
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setBrandErrors((prevError: any) => ({
        ...prevError,
        [name]: "Invalid file format.Upload a valid Format",
      }));

      e.target.value = "";
      return;
    }

    const maxFileSize = defSize * 1024;

    if (selectedFile.size > maxFileSize) {
      setBrandErrors((prevError: any) => ({
        ...prevError,
        [name]: `File size exceeds the maximum limit (${defSize}KB).`,
      }));

      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]);

    const url = "file/upload";
    try {
      const response = await API.postFile(url, formData);
      if (response.success) {
        setFileName((prevFile: any) => ({
          ...prevFile,
          [e.target.name]: e.target.files[0].name,
        }));
        setFormData((prevData: any) => ({
          ...prevData,
          [name]: response.data,
        }));
        setBrandErrors((prevError: any) => ({
          ...prevError,
          [name]: "",
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const requiredBrandFields = [
    "name",
    "address",
    "contactPerson",
    "programsIds",
    "countriesIds",
  ];

  const requiredUserFields = [
    "firstname",
    "email",
    "mobile",
    "username",
    "password",
    "reenterpassword",
    "status",
    "role",
    "ticketApproveAccess",
    "ticketCountryAccess",
    "ticketAccessOnly",
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    if (dataName === "user") {
      if (requiredUserFields.includes(name)) {
        const strongPasswordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z]).{8,}$/;

        switch (name) {
          case "username":
            return value.trim() == ""
              ? "Username is Required"
              : userErrors[index]?.username !== ""
                ? userErrors[index]?.username
                : "";
          case "firstname":
            return value.trim() === ""
              ? "Name is Required"
              : userErrors[index]?.firstname !== ""
                ? userErrors[index]?.firstname
                : "";
          case "password":
            if (value.trim() === "") {
              return "Password is Required";
            } else if (!strongPasswordRegex.test(value)) {
              return "Password should include special characters, numbers, capital letters and  it should be minimum of 8 characters.";
            } else {
              return "";
            }
          case "reenterpassword":
            return users && users[index].password !== value.trim()
              ? "Passwords not matched"
              : value.trim() === ""
                ? "Re-enter Password is Required"
                : "";
          case "mobile":
            return value.trim() === "" ? "Mobile No is Required" : "";
          case "email":
            return value.trim() === ""
              ? "Email is Required"
              : userErrors[index]?.email !== ""
                ? userErrors[index]?.email
                : /\S+@\S+\.\S+/.test(value)
                  ? ""
                  : "Invalid email format";
          case "ticketCountryAccess":
            return value?.length === 0 || value === null
              ? "Select at least one option"
              : "";
          case "role":
            return value.trim() === "" ? "Field is Required" : "";
          case "status":
            return typeof value !== "boolean"
              ? "Select at least one option"
              : "";
          case "ticketApproveAccess":
            return typeof value !== "boolean"
              ? "Select at least one option"
              : "";
          case "ticketAccessOnly":
            return typeof value !== "boolean"
              ? "Select at least one option"
              : "";
          default:
            return "";
        }
      }
    } else if (dataName === "brand") {
      if (requiredBrandFields.includes(name)) {
        switch (name) {
          case "name":
            return value.trim() === ""
              ? "Name is Required"
              : brandErrors.name !== ""
                ? brandErrors.name
                : "";
          case "address":
            return value.trim() === "" ? "Address is Required" : "";
          case "contactPerson":
            return value.trim() === ""
              ? "Contact Person is Required"
              : brandErrors.contactPerson !== ""
                ? brandErrors.contactPerson
                : "";
          case "programsIds":
            return value?.length === 0 || value === null
              ? "Select at least one option"
              : "";
          case "countriesIds":
            return value?.length === 0 || value === null
              ? "Select at least one option"
              : "";
          default:
            return "";
        }
      }
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const newUserErrors: any = [...userErrors];

    const newBrandErrors: any = {};

    users.map((user: any, index: number) => {
      const userErrors: any = {};
      Object.keys(user).forEach((fieldName: string) => {
        const fieldError = validateField(
          fieldName,
          user[fieldName as keyof any],
          "user",
          index
        );
        if (fieldError) {
          userErrors[fieldName] = fieldError;
        }
      });
      newUserErrors[index] = userErrors;
    });
    Object.keys(formData).forEach((fieldName: string) => {
      newBrandErrors[fieldName] = validateField(
        fieldName,
        formData[fieldName as keyof any],
        "brand"
      );
    });

    const hasBrandErrors = Object.values(newBrandErrors).some(
      (error) => !!error
    );
    const hasUserErrors = newUserErrors.some((errors: any) =>
      Object.values(errors).some((error) => !!error)
    );
    if (hasBrandErrors) {
      setBrandErrors(newBrandErrors);
    }

    if (hasUserErrors) {
      setUserErrors(newUserErrors);
    }

    if (!hasBrandErrors && !hasUserErrors) {
      try {
        setIsSubmitting(true);
        const response = await API.post("brand", {
          ...formData,
          userData: users,
        });
        if (response.success) {
          toasterSuccess("Brand Successfully Created");
          router.push("/settings/retailer-brand-registration");
        } else {
          setIsSubmitting(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        console.log(error);
      }
    } else {
      return;
    }
  };

  if (roleLoading) {
    return <Loader />;
  }
  return (
    <>
      <div>
        <div className="breadcrumb-box">
          <div className="breadcrumb-inner light-bg">
            <div className="breadcrumb-left">
              <ul className="breadcrum-list-wrap">
                <li>
                  <Link href="/dashboard" className="active">
                    <span className="icon-home"></span>
                  </Link>
                </li>
                <li>Settings</li>
                <li>
                  <Link href="/settings/retailer-brand-registration">Retailer & Brand Registration</Link>
                </li>
                <li>Add Retailer & Brand</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-md p-4">
        <div className="flex flex-col md:flex-row gap-10 border-t-4">
          <div className="w-1/2 my-4">
            <div className="flex">
              <div className="w-1/2">
                <label className="text-sm w-full">
                  Name <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  placeholder="Name"
                  onBlur={onBlurCheckBrand}
                  autoComplete="off"
                  className=" border rounded px-2 py-1 w-full text-sm"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {brandErrors?.name !== "" && (
                  <div className="text-sm text-red-500">{brandErrors.name}</div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">
                  Address <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <textarea
                  placeholder="Address"
                  className=" border rounded px-2 py-1 w-full text-sm"
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                {brandErrors?.address !== "" && (
                  <div className="text-sm text-red-500">
                    {brandErrors.address}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Website</label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="website"
                  placeholder="Website"
                  autoComplete="off"
                  onBlur={(e) => checkFormat(e, "website")}
                  className=" border rounded px-2 py-1 w-full text-sm"
                  value={formData.website}
                  onChange={handleChange}
                />
                {brandErrors?.website !== "" && (
                  <div className="text-sm text-red-500">
                    {brandErrors.website}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="contactPerson"
                  autoComplete="off"
                  onBlur={(e) => checkFormat(e, "alphabets")}
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact Person Name"
                  className=" border rounded px-2 py-1 w-full text-sm"
                />
                {brandErrors?.contactPerson !== "" && (
                  <div className="text-sm text-red-500">
                    {brandErrors.contactPerson}
                  </div>
                )}
              </div>
            </div>
            <h1 className="mt-3 font-semibold text-lg">Contact Number:</h1>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Mobile No</label>
              </div>
              <div className="w-1/2">
                <input
                  type="number"
                  name="mobile"
                  autoComplete="off"
                  placeholder="Mobile Number"
                  className=" border rounded px-2 py-1 w-full text-sm"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">LandLine No</label>
              </div>
              <div className="w-1/2">
                <input
                  type="number"
                  name="landline"
                  autoComplete="off"
                  value={formData.landline}
                  onChange={handleChange}
                  placeholder="Landline Number"
                  className=" border rounded px-2 py-1 w-full text-sm"
                />
              </div>
            </div>
          </div>
          <div className="w-1/2 my-4">
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Email</label>
              </div>
              <div className="w-1/2">
                <input
                  type="email"
                  name="email"
                  autoComplete="off"
                  onBlur={(e) => checkFormat(e, "email")}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className=" border rounded px-2 py-1 w-full text-sm"
                />
                {brandErrors?.email !== "" && (
                  <div className="text-sm text-red-500">{brandErrors.email}</div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">
                  Participating Programs <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <MultiSelectDropdown
                  name="programsIds"
                  options={programs?.map((item: any) => {
                    return item.program_name;
                  })}
                  onChange={handleSelectionChange}
                />
                {brandErrors?.programsIds !== "" && (
                  <div className="text-sm text-red-500">
                    {brandErrors.programsIds}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">
                  Mapped Countries <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="w-1/2">
                <MultiSelectDropdown
                  name="countriesIds"
                  options={countries?.map((item: any) => {
                    return item.county_name;
                  })}
                  onChange={handleSelectionChange}
                />
                {brandErrors?.countriesIds !== "" && (
                  <div className="text-sm text-red-500">
                    {brandErrors.countriesIds}
                  </div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Company Information</label>
              </div>
              <div className="w-1/2">
                <textarea
                  name="companyInfo"
                  placeholder="Company Information"
                  className=" border rounded px-2 py-1 w-full text-sm"
                  rows={3}
                  value={formData.companyInfo}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Organisation Logo</label>
              </div>
              <div className="w-1/2">
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="logo"
                      type="file"
                      onChange={(e) => handleFileChange(e, 75)}
                    />
                  </label>
                </div>
                <p className="w-full text-sm">
                  (Max: 75kb) (Format: jpg/jpeg/bmp/png)
                </p>
                {fileName?.logo && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName?.logo}</p>
                  </div>
                )}
                {brandErrors?.logo !== "" && (
                  <div className="text-sm text-red-500">{brandErrors.logo}</div>
                )}
              </div>
            </div>
            <div className="flex mt-2">
              <div className="w-1/2">
                <label className="text-sm w-full">Organisation Photo</label>
              </div>
              <div className="w-1/2">
                <div className="inputFile">
                  <label>
                    Choose File <GrAttachment />
                    <input
                      name="photo"
                      type="file"
                      onChange={(e) => handleFileChange(e, 100)}
                    />
                  </label>
                </div>
                <p className="w-full text-sm">
                  (Max: 100kb) (Format: jpg/jpeg/bmp/png)
                </p>
                {fileName?.photo && (
                  <div className="flex text-sm mt-1">
                    <GrAttachment />
                    <p className="mx-1">{fileName?.photo}</p>
                  </div>
                )}
                {brandErrors?.photo !== "" && (
                  <div className="text-sm text-red-500">{brandErrors.photo}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <hr className="" />
        <div>
          <UserAccess
            intializeData={intializeData}
            onBlur={onBlurCheck}
            userErrors={userErrors}
            role={role}
            type={"brand"}
            selectedCountries={selectedCountries}
            users={users}
            setUsers={setUsers}
            onChange={onUserAccessChange}
            handleSelectionChange={handleSelectionChange}
          />

          <div className="py-6 border-b border-t w-100 d-flex gap-2 customButtonGroup">
            <section>
              <button
                className="btn-purple mr-2"
                style={
                  isSubmitting
                    ? { cursor: "not-allowed", opacity: 0.8 }
                    : { cursor: "pointer", backgroundColor: "#D15E9C" }
                }
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                SUBMIT
              </button>
            </section>
            <section>
              <button
                className="btn-outline-purple"
                onClick={() => router.back()}
              >
                CANCEL
              </button>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
