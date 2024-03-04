"use client";
import React, { useState, useEffect } from "react";
import ProcessorRegistration from "@components/core/ProcessorRegistration";
import UserAccess from "@components/core/UserAccess";
import Link from "next/link";
import useRole from "@hooks/useRole";
import useTitle from "@hooks/useTitle";
import API from "@lib/Api";
import { useRouter } from "next/navigation";
import { toasterError, toasterSuccess } from "@components/core/Toaster";
import Loader from "@components/core/Loader";

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
};

export default function page() {
  useTitle("Add Spinner");
  const [roleLoading] = useRole();
  const router = useRouter();

  const [programs, setPrograms] = useState([]);
  const [yarnCount, setYarnCount] = useState([]);
  const [unitCert, setUnitCert] = useState([]);
  const [brands, setBrands] = useState([]);
  const [role, setRole] = useState<any>([]);
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
      role: null,
    },
  ]);

  const [processorFormData, setProcessorFormData] = useState<any>({
    name: "",
    shortName: "",
    address: "",
    countryId: "",
    stateId: "",
    programIds: [],
    latitude: "",
    longitude: "",
    website: "",
    contactPerson: "",
    yarnCountRange: [],
    rangeFrom: "",
    rangeTo: "",
    unitCert: [],
    companyInfo: "",
    logo: "",
    photo: "",
    certs: "",
    brand: [],
    mobile: "",
    landline: "",
    email: "",
    yarnType: "",
  });

  const [userErrors, setUserErrors] = useState<any>([]);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    getUserRoles();
    getPrograms();
    getUnitCertification();
    getYarnCountRange();
    getBrands();
  }, []);

  const getPrograms = async () => {
    const res = await API.get("program");
    if (res.success) {
      setPrograms(res.data);
    }
  };

  const getUnitCertification = async () => {
    try {
      const res = await API.get("unit/unit-certification");
      if (res.success) {
        setUnitCert(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getYarnCountRange = async () => {
    try {
      const res = await API.get("yarncount");
      if (res.success) {
        setYarnCount(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const res = await API.get("brand");
      if (res.success) {
        setBrands(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getUserRoles = async () => {
    const res = await API.get("user/get-user-roles");
    if (res.success) {
      const roles = res.data?.filter(
        (item: any) => item.user_role === "Spinner"
      );
      setRole(roles);
    }
  };
  const alreadyExistsCheck = async (name: string, value: string, index: number) => {
    const res = await API.post("brand/user", {
      [name]: value
    });

    const newErrors = [...userErrors];

    if (res?.data?.user === true) {
      newErrors[index] = {
        ...newErrors[index],
        [name]: "Already Exists"
      };
    } else {
      newErrors[index] = {
        ...newErrors[index],
        [name]: ""
      };
    }

    setUserErrors(newErrors);
  };

  const alreadyExistName = async (name: string, value: string, index: number) => {
    const res = await API.post("spinner/check-spinner", {
      [name]: value
    });

    if (res?.data?.exist === true) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "Name Already Exists. Please Try Another",
      }));
    }
    else {
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  }
  const onBlurCheck = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    if (name === "name" && value !== "") {
      alreadyExistName(name, value, index)
    }
    else if (value != "") {
      alreadyExistsCheck(name, value, index);
    }

  }


  const onUserAccessChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value, type } = e.target;
    const newUsers = [...users];
    if (type === 'radio') {
      if (name === `status-${index}`) {
        newUsers[index]['status'] = value === 'active' ? true : false;
      }
    } else {
      newUsers[index][name] = value;
    }

    setUsers(newUsers);
  };

  const handleSelectionChange = (
    selectedOptions: string[],
    name: string,
    index: number = 0
  ) => {

    if (name === "unitCert") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = unitCert.find((option: any) => {
            return option.certification_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        unitCert: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (name === "brand") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = brands.find((option: any) => {
            return option.brand_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        brand: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "programIds") {
      const result = selectedOptions
        .map((item: string) => {
          const find: any = programs.find((option: any) => {
            return option.program_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        programIds: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "yarnCountRange") {

      const result = selectedOptions
        .map((item: string) => {
          const find: any = yarnCount.find((option: any) => {
            return option.yarnCount_name === item;
          });
          return find ? find.id : null;
        })
        .filter((id) => id !== null);

      setProcessorFormData((prevData: any) => ({
        ...prevData,
        yarnCountRange: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }


    if (name === "yarnType") {
      const result = selectedOptions
      setProcessorFormData((prevData: any) => ({
        ...prevData,
        yarnType: result,
      }));
      setErrors((prev: any) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const dataUpload = async (e: any) => {
    const url = "file/upload";

    const dataVideo = new FormData();
    dataVideo.append("file", e.target.files[0]);

    try {
      const response = await API.postFile(url, dataVideo);
      if (response.success) {
        setProcessorFormData((prevFormData: any) => ({
          ...prevFormData,
          [e.target.name]: response.data,
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const handleChange = (
    event:
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    if (name === "logo" || name === "photo" || name === "certs") {
      dataUpload(event);
    } else {
      setProcessorFormData((prevData: any) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const requiredUserFields = [
    "firstname",
    "email",
    "mobile",
    "username",
    "password",
    "reenterpassword",
    "status",
    "role",
  ];

  const requiredSpinnerFields = [
    "name",
    "shortName",
    "address",
    "contactPerson",
    "programIds",
    "countryId",
    "stateId",
    "brand",
    "rangeFrom",
    "rangeTo"
  ];

  const validateField = (
    name: string,
    value: any,
    dataName: string,
    index: number = 0
  ) => {
    if (dataName === 'user') {
      if (requiredUserFields.includes(name)) {
        switch (name) {
          case "username":
            return userErrors[index]?.username !== "" ? userErrors[index]?.username : value.trim() === "" ? "Username is required" : "";
          case "firstname":
            return value.trim() === "" ? "Name is required" : "";
          case "password":
            return value.trim() === "" ? "Password is required" : "";
          case "reenterpassword":
            return users && users[index].password !== value.trim()
              ? "Passwords not matched"
              : value.trim() === ""
                ? "Re-enter Password is required"
                : "";
          case "mobile":
            return value.trim() === "" ? "Mobile No is required" : "";
          case "email":
            return userErrors[index]?.email !== "" ? userErrors[index]?.email : value.trim() === ""
              ? "Email is required"
              : /\S+@\S+\.\S+/.test(value)
                ? ""
                : "Invalid email format";
          case "ticketCountryAccess":
            return value?.length === 0 || value === null
              ? "Select at least one option"
              : "";
          case "role":
            return value?.length === 0 || value === null
              ? "Field is required"
              : "";
          case "status":
            return typeof value !== "boolean" ? "Select at least one option" : "";
          default:
            return "";
        }
      }
    } else if (dataName === 'spinner') {
      if (requiredSpinnerFields.includes(name)) {
        switch (name) {
          case "name":
            return value.trim() === "" ? "spinner Name is required" : errors.name !== "" ? errors.name : "";
          case "shortName":
            return value.trim() === "" ? "Spin Short Name is required" : "";
          case "address":
            return value.trim() === "" ? "Address is required" : "";
          case "contactPerson":
            return value.trim() === "" ? "Contact Person is required" : "";
          case "rangeFrom":
            return value.trim() === "" ? "This Field is required" : "";
          case "rangeTo":
            return value.trim() === "" ? "This Field is required" : "";
          case "programIds":
            return value?.length === 0 || value === null
              ? "Program is required"
              : "";
          case "brand":
            return value?.length === 0 || value === null
              ? "Brand Mapped is required"
              : "";
          case "countryId":
            return value.trim() === "" || value === null
              ? "Country is required"
              : "";
          case "stateId":
            return value.trim() === "" || value === null
              ? "State is required"
              : "";
          default:
            return "";
        }
      }
    };
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const newUserErrors: any = [];
    const newSpinnerErrors: any = {};

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

    Object.keys(processorFormData).forEach((fieldName: string) => {
      newSpinnerErrors[fieldName] = validateField(
        fieldName,
        processorFormData[fieldName as keyof any],
        "spinner"
      );
    });

    const hasSpinnerErrors = Object.values(newSpinnerErrors).some((error) => !!error);
    const hasUserErrors = newUserErrors.some((errors: any) =>
      Object.values(errors).some((error) => !!error)
    );

    if (hasSpinnerErrors) {
      setErrors(newSpinnerErrors)
    }

    if (hasUserErrors) {
      setUserErrors(newUserErrors);
    }

    if (
      !hasSpinnerErrors && !hasUserErrors && !errors.name
    ) {
      try {
        const response = await API.post("spinner", {
          ...processorFormData,
          yarnCountRange: String(processorFormData.yarnCountRange),
          yarnType: String(processorFormData.yarnType),
          userData: users,
        });
        if (response.success) {
          toasterSuccess("spinner Successfully Created");
          router.push("/settings/processor-registration/spinner");
        }
      } catch (error) {
        toasterError("An Error occurred.");
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
                <li>Services</li>
                <li>Processor Registration</li>
                <li>Spinner</li>
                <li>Add Spinner</li>
              </ul>
            </div>
          </div>
        </div>

        <ProcessorRegistration
          type="Spinner"
          errors={errors}
          onBlur={onBlurCheck}
          processorFormData={processorFormData}
          onProcessorChangeData={handleChange}
          handleMultiSelect={handleSelectionChange}
        />
      </div>
      <div>
        <hr className="mt-5 mb-5" />
        <UserAccess
          intializeData={intializeData}
          userErrors={userErrors}
          role={role}
          onBlur={onBlurCheck}
          users={users}
          setUsers={setUsers}
          onChange={onUserAccessChange}
          handleSelectionChange={handleSelectionChange}
        />
        <hr className="mt-5 mb-5" />
        <div className="justify-between mt-4 px-2 space-x-3 ">
          <button
            className="bg-green-500 rounded text-white px-2 py-2 text-sm"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <button
            className="bg-gray-300 rounded text-black px-2 py-2 text-sm"
            onClick={() => router.push('/settings/processor-registration/spinner')}
          >
            Cancel
          </button>
        </div>
        <hr className="mt-5 mb-5" />
      </div>
    </>
  );
}
