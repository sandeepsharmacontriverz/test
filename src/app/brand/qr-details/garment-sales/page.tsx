"use client";
import React, { useState, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import { useSearchParams } from "next/navigation";

import useTitle from "@hooks/useTitle";

import User from "@lib/User";
import { MdLocationPin } from "react-icons/md";
import { FaArrowDown } from "react-icons/fa";

import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import DataTable from "react-data-table-component";
import API from "@lib/Api";


const L = typeof window !== 'undefined' ? require("leaflet") : null;

let Icon = null;
if (typeof window !== 'undefined') {
    Icon = require("leaflet").Icon;
}

const MapContainer = dynamic(() => import("react-leaflet").then((module) => module.MapContainer), {
    ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((module) => module.TileLayer), {
    ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((module) => module.Marker), {
    ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((module) => module.Popup), {
    ssr: false,
});


const customIcon = Icon ? new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
        renderToString(<MdLocationPin />)
    )}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
}) : null;


export default function page() {
    useTitle("Processor Details");
    const [data, setData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

    const search = useSearchParams();
    const id = search.get("id");

    const [showData, setShowData] = useState<any>({
        garment: false,
        fabric: false,
        spinner: false,
        ginner: false,
        farmerGroup: false
    });


    useEffect(() => {
        if (id) {
            getProcessorList();
        }
    }, [id, selectedLocation]);

    const getProcessorList = async () => {
        const url = ``;
        try {
            const response = await API.get(url);
            setData(response.data);

            if (response.data.length > 0) {
                setSelectedLocation({
                    name: '',
                    latitude: '',
                    longitude: '',
                });
            } else {
                setSelectedLocation(null);
            }
        } catch (error) {
            console.log(error, "error");
        }
    }

    //test map
    // await fetch(url)
    // .then((res) => {
    //     return res.json();
    //   })
    //   .then((data) => {
    //     setData(data.results)
    //     setSelectedLocation({
    //         name: data.results[0].name,
    //         latitude: data.results[0].location.lat,
    //         longitude: data.results[0].location.lon,
    //       });
    //     })
    //     .catch((err: any) => {
    //         if (err.status == undefined) {
    //             console.log(err);
    //         }
    //     });
    // };

    const columns: any = [
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Garment Name
                    </div>
                    <FaArrowDown onClick={() => setShowData({ ...showData, garment: !showData.garment })} className="mt-2 hover:cursor-pointer" size={16} />
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.garment && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of dispatch: <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Order Reference No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Style Mark No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Garment/Product Type : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Garmet size : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Color : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Boxes : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of pices : <span className="font-medium"></span>
                                </div>
                            </div>
                        )}
                </>
            )
            ,
            sortable: false,
        },

        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Fabric Processor Name
                    </div>
                    <FaArrowDown onClick={() => setShowData({ ...showData, fabric: !showData.fabric })} className="mt-2 hover:cursor-pointer" size={16} />
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.fabric && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of fabric sale : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Order Ref No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Batch /Lot No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Job details from garment : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Fabric Type : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric Length : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric GSM : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Finished Fabric Nett weight : <span className="font-medium"></span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Spinner Name
                    </div>
                    <FaArrowDown onClick={() => setShowData({ ...showData, spinner: !showData.spinner })} className="mt-2 hover:cursor-pointer" size={16} />
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.spinner && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Yarn sale : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Spin Lot No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    REEL Lot No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Yarn Type : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Yarn Count : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Boxes : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Box ID : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Blend : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Blend Qty : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Total weight : <span className="font-medium"></span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Ginner Name
                    </div>
                    <FaArrowDown onClick={() => setShowData({ ...showData, ginner: !showData.ginner })} className="mt-2 hover:cursor-pointer" size={16} />
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.ginner && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Yarn sale : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Invoice Number : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    No of Bales : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Bale Lot No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Bales/Press No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    REEL Lot No : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Rate/KG : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Total weight : <span className="font-medium"></span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
        {
            name: (
                <div className="py-2">
                    <div className="text-md font-semibold">
                        Farmer Group Name
                    </div>
                    <FaArrowDown onClick={() => setShowData({ ...showData, farmerGroup: !showData.farmerGroup })} className="mt-2 hover:cursor-pointer" size={16} />
                </div>
            ),
            cell: (row: any) => (
                <>
                    {
                        showData.farmerGroup && (
                            <div className="w-full h-full">
                                <div className="border p-1 font-semibold">
                                    Date of Sale : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Transaction Id : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold ">
                                    Village : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    State : <span className="font-medium"></span>
                                </div>
                                <div className="border p-1 font-semibold">
                                    Program : <span className="font-medium"></span>
                                </div>
                            </div>
                        )
                    }
                </>
            ),
            sortable: false,
        },
    ].filter(Boolean);

    return (
        <div>
            <div className="flex bg-[#172554] items-center justify-center p-4">
                <p className="text-white text-3xl font-medium"> Processor Details </p>
            </div>
            <div className="w-100 bg-white rounded-lg p-4">
                <MapContainer
                    center={[selectedLocation && selectedLocation?.latitude || 0, selectedLocation && selectedLocation?.longitude || 0]}
                    zoom={13}
                    style={{ height: "600px", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {data.map((location: any, index: any) => (
                        <Marker
                            key={index}
                            position={[location?.location?.lat, location?.location?.lon]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div>
                                    <p className="font-bold text-lg"> {location?.name}</p>
                                    <p> {location?.country}</p>
                                    <p> {location?.organisation}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                <DataTable
                    data={[data]}
                    persistTableHead
                    noDataComponent=''
                    columns={columns}
                />

            </div>
        </div>

    );

}

