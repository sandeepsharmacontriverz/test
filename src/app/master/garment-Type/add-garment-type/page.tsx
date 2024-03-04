"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useTranslations from '@hooks/useTranslation'
import { toasterSuccess, toasterError } from '@components/core/Toaster'

import User from "@lib/User";
import API from "@lib/Api";
import useTitle from "@hooks/useTitle";
import NavLink from "@components/core/nav-link";
export default function Page() {
    const router = useRouter();
    useTitle("Add Garment Type")
    const numInputs = 16;

    const [inputValues, setInputValues] = useState(new Array(numInputs).fill(""));
    const [inputError, setInputError] = useState({ isError: false, message: "", inputIndex: -1 });

    const handleInputChange = (index: any, value: any) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = value;
        setInputValues(newInputValues);
    };


    const handleCancel = () => {
        setInputError({ isError: false, message: "", inputIndex: -1 });
        router.back();
    };
    const isInputEmpty = (inputValue: any) => {
        return inputValue.trim() === "";
    };
    const isCropNamesValid = (inputValues: string[]): number => {
        const regex = /^[\(\)_\-a-zA-Z0-9\s]+$/;
        for (const [i, value] of Object.entries(inputValues)) {
            if (value && !regex.test(value)) {
                return Number(i);
            }
        }
        return -1;
    }
    const addData = async () => {
        const url = "garment-type/multiple";
        const inputData = inputValues.filter(inputValue => inputValue !== '' && inputValue !== null);

        const formattedData = inputData

        try {
            const response = await API.post(url, {
                "garmentTypes": formattedData
            });

            if (response.data.pass.length > 0) {
                const dataPassed = response.data.pass;
                const passedName = dataPassed.map((name: any) => name.data.name).join(', ');
                toasterSuccess(`Following Garment Type(s) have been added successfully: ${passedName}`);
            }

            if (response.data.fail.length > 0) {
                const dataFailed = response.data.fail;
                const failedName = dataFailed.map((name: any) => name.data.name).join(', ');
                toasterError(`Following Garment Type(s) are skipped as they already exist: ${failedName}`);
            }

            router.push('/master/garment-Type');
        } catch (error) {
            console.log(error, "error");
        }
    };


    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (isInputEmpty(inputValues[0])) {
            setInputError({ isError: true, message: "Garment Type is Required.", inputIndex: 0 });
        } else {
            const notValidIndex = isCropNamesValid(inputValues);
            if (notValidIndex > -1) {
                setInputError({ isError: true, message: "Only letters, digits, white space, (, ), _ and - allowed.", inputIndex: notValidIndex });
            } else {
                setInputError({ isError: false, message: "", inputIndex: -1 });
                addData();
            }
        }
    };
    useEffect(() => {
        User.role()
    }, [])
    const { translations, loading } = useTranslations();
    if (loading) {
        return <div> Loading...</div>;
    }

    return (
        <div>
            <div className="breadcrumb-box">
                <div className="breadcrumb-inner light-bg">
                    <div className="breadcrumb-left">
                        <ul className="breadcrum-list-wrap">
                            <li className="active">
                                <NavLink href="/dashboard">
                                    <span className="icon-home"></span>
                                </NavLink>
                            </li>
                            <li>Master</li>
                            <li>
                                <NavLink href="/master/garment-Type">
                                    Garment Type
                                </NavLink>
                            </li>
                            <li>Add Garment Type</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div >
                <form onSubmit={handleSubmit}>
                    <div className="columns lg:columns-4 md:columns-2 sm:columns-1 mt-3 ">
                        {inputValues.map((value, index) => (
                            <div key={index} className="mb-3">

                                <input
                                    type="text"
                                    placeholder={index === 0 ? "Garment Type" + "*" : "Garment Type"}
                                    value={value}
                                    className={`w-100 shadow-none h-11 rounded-md mt-1 form-control gray-placeholder text-gray-500 text-sm borderCustom${index === inputError.inputIndex && inputError.isError ? 'border-red-500' : 'border'}`}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />

                                {inputError.isError && index === inputError.inputIndex && (
                                    <p className="text-red-500 text-sm">{inputError.message}</p>
                                )}
                            </div>
                        ))}
                    </div>


                    <div>
                        <hr className="mt-5 mb-5" />
                        <div className="justify-between mt-4 px-2 space-x-3 customButtonGroup">
                            <button
                                className="btn-purple mr-2"
                            >
                                {translations.common.submit}
                            </button>
                            <button
                                type="button"
                                className="btn-outline-purple"
                                onClick={handleCancel}

                            >
                                {translations.common.cancel}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

    );
}