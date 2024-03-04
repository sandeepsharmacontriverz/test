"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "./MultiSelectDropDown";
import API from "@lib/Api";

export default function UserAccess({
  type,
  users,
  setUsers,
  onChange,
  onBlur,
  intializeData,
  selectedCountries,
  handleSelectionChange,
  role,
  userErrors,
}: any) {
  const handleAddMore = () => {
    setUsers([...users, { ...intializeData }]);
  };

  const handleDeleteRow = (index: any) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
  };

  const [countries, setCountries] = useState<any>([]);

  const getCountries = async () => {
    try {
      const res = await API.get("location/get-countries");
      if (res.success) {
        setCountries(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCountries();
  }, []);

  const PreData = (user: any) => {
    const userId = user?.map((obj: any) => Number(obj));
    let matchNames = countries
      .filter((country: any) => userId?.includes(country.id))
      .map((country: any) => country.county_name);
    return matchNames;
  };

  return (
    <>
      <div>
        <h4 className="text-sm font-semibold">User Access </h4>
        {users?.map((user: any, index: number) => (
          <div key={index} className="pt-4 items-center">
            <div className="w-full flex justify-end mt-3 mr-5">
              {index !== 0 && (
                <button
                  className="ml-2 text-white rounded-full bg-red-600 p-1 w-6 h-6 flex items-center justify-center"
                  onClick={() => handleDeleteRow(index)}
                >
                  X
                </button>
              )}
            </div>
            {index > 0 && (
              <h4 className="my-3 text-sm font-semibold">User {index + 1}</h4>
            )}
            <div className="flex flex-wrap gap-3">
              <div className="w-full flex gap-3">
                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Name <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="text"
                      name="firstname"
                      id={`name_${index}`}
                      autoComplete="off"
                      onBlur={(e) => onBlur(e, "alphabets", index)}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.firstname}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Name"
                    />
                    {userErrors[index]?.firstname !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.firstname}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">Position</label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="text"
                      name="position"
                      id={`position_${index}`}
                      autoComplete="off"
                      onBlur={(e) => onBlur(e, "alphabets", index)}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.position || ""}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Position in Company"
                    />
                    {userErrors[index]?.position !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.position}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Email <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="text"
                      name="email"
                      autoComplete="off"
                      id={`email_${index}`}
                      onBlur={(e) => onBlur(e, "email", index)}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.email}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Email"
                    />
                    {userErrors[index]?.email !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="number"
                      name="mobile"
                      autoComplete="off"
                      id={`mobile_${index}`}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.mobile}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Mobile"
                    />
                    {userErrors[index]?.mobile !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.mobile}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Username <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="text"
                      name="username"
                      onBlur={(e) => onBlur(e, "string", index)}
                      autoComplete="off"
                      id={`username_${index}`}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.username}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Username"
                    />
                    {userErrors[index]?.username !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.username}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Password <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="password"
                      name="password"
                      id={`password_${index}`}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.password}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Password"
                    />
                    {userErrors[index]?.password !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.password}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Re-enter Password <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <input
                      type="password"
                      name="reenterpassword"
                      id={`reenterpassword_${index}`}
                      className=" border rounded px-2 py-1 w-full text-sm"
                      value={user?.reenterpassword}
                      onChange={(e) => onChange(e, index)}
                      placeholder="Re-enter Password"
                    />
                    {userErrors[index]?.reenterpassword !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.reenterpassword}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Status <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <label className=" px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        value="active"
                        checked={users[index].status === true}
                        className=" px-2 py-1 text-sm"
                        onChange={(e) => onChange(e, index)}
                      />{" "}
                      Active
                    </label>
                    <label className="px-2 py-1 text-sm">
                      <input
                        type="radio"
                        name={`status-${index}`}
                        value="inactive"
                        checked={users[index].status === false}
                        className=" px-2 py-1 text-sm"
                        onChange={(e) => onChange(e, index)}
                      />{" "}
                      Inactive
                    </label>
                    {userErrors[index]?.status !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <div className="w-1/4 flex">
                  <div className="w-1/4 px-2 py-1">
                    <label className="text-sm">
                      Role <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="w-3/4 ">
                    <select
                      name="role"
                      placeholder="Select Role"
                      value={user?.role || ""}
                      onChange={(e) => onChange(e, index)}
                      className="border rounded px-2 py-1 w-full text-sm"
                    >
                      <option value="">Select Role</option>
                      {role?.map((item: any) => (
                        <option key={item.id} value={item.id}>
                          {item.user_role}
                        </option>
                      ))}
                    </select>
                    {userErrors[index]?.role !== "" && (
                      <div className="text-sm pt-1 text-red-500">
                        {userErrors[index]?.role}
                      </div>
                    )}
                  </div>
                </div>
                {type && type === "brand" && (
                  <>
                    <div className="w-1/4 flex">
                      <div className="w-1/4 px-2 py-1">
                        <label className="text-sm">
                          Ticket Approve Access{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="w-3/4 ">
                        <label className=" px-2 py-1 text-sm">
                          <input
                            type="radio"
                            name={`ticketApproveAccess-${index}`}
                            value="yes"
                            checked={users[index].ticketApproveAccess === true}
                            className=" px-2 py-1 text-sm"
                            onChange={(e) => onChange(e, index)}
                          />{" "}
                          Yes
                        </label>
                        <label className="px-2 py-1 text-sm">
                          <input
                            type="radio"
                            name={`ticketApproveAccess-${index}`}
                            value="no"
                            checked={users[index].ticketApproveAccess === false}
                            className=" px-2 py-1 text-sm"
                            onChange={(e) => onChange(e, index)}
                          />{" "}
                          No
                        </label>
                        {userErrors[index]?.ticketApproveAccess !== "" && (
                          <div className="text-sm pt-1 text-red-500">
                            {userErrors[index]?.ticketApproveAccess}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/4 flex">
                      <div className="w-1/4 px-2 py-1">
                        <label className="text-sm">
                          Ticket Country Access{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="w-3/4 ">
                        <MultiSelectDropdown
                          name="ticketCountryAccess"
                          initiallySelected={
                            user.ticketCountryAccess
                              ? PreData(user?.ticketCountryAccess)
                              : ""
                          }
                          options={selectedCountries?.map((item: any) => {
                            return item;
                          })}
                          onChange={(e) =>
                            handleSelectionChange(
                              e,
                              "ticketCountryAccess",
                              index
                            )
                          }
                        />
                        {userErrors[index]?.ticketCountryAccess !== "" && (
                          <div className="text-sm pt-1 text-red-500">
                            {userErrors[index]?.ticketCountryAccess}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-1/4 flex">
                      <div className="w-1/4 px-2 py-1">
                        <label className="text-sm">
                          Ticket Approve Access Only{" "}
                          <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <div className="w-3/4 ">
                        <label className=" px-2 py-1 text-sm">
                          <input
                            type="radio"
                            name={`ticketAccessOnly-${index}`}
                            value="yes"
                            checked={user?.ticketAccessOnly === true}
                            className=" px-2 py-1 text-sm"
                            onChange={(e) => onChange(e, index)}
                          />{" "}
                          Yes
                        </label>
                        <label className="px-2 py-1 text-sm">
                          <input
                            type="radio"
                            name={`ticketAccessOnly-${index}`}
                            value="no"
                            checked={user?.ticketAccessOnly === false}
                            className=" px-2 py-1 text-sm"
                            onChange={(e) => onChange(e, index)}
                          />{" "}
                          No
                        </label>
                        {userErrors[index]?.ticketAccessOnly !== "" && (
                          <div className="text-sm pt-1 text-red-500">
                            {userErrors[index]?.ticketAccessOnly}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end mr-5 mb-5 mt-2">
          <button
            onClick={handleAddMore}
            className="bg-orange-400 rounded text-white px-2 py-2 text-sm  "
          >
            Add More
          </button>
        </div>
      </div>
    </>
  );
}
