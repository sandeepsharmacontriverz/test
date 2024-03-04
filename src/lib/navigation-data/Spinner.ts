import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";

import { FaCheckToSlot, FaUsersGear } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";

import { ImTree } from "react-icons/im";
import { MdRecycling } from "react-icons/md";
import { TbChartHistogram } from "react-icons/tb";
interface MenuItem {
    id: string;
    item: string;
    path?: string;
    icon?: any;
    childrens?: MenuItem[];
    isOpen?: boolean;
    size?: number;

}
export default class User {
    static list: MenuItem[] = [
        // 5
        {
            item: "Spinner Process",
            id: "spinner-process",
            icon: ImTree,
            size: 20,
            path: "/spinner/spinner-process",
            isOpen: false,
        },
        {
            item: "Spinner Sale",
            id: "spinner-sale",
            icon: AiFillCreditCard,
            size: 20,
            path: "/spinner/sales",
            isOpen: false,
        },
        {
            item: "Comber Noil",
            id: "spinner-comber",
            icon: MdRecycling,
            size: 20,
            path: "/spinner/comber-noil",
            isOpen: false,
        },
        // 7
        {
            item: "Quality",
            id: "Qualityparameter",
            icon: TbChartHistogram,
            size: 20,
            childrens: [
                {
                    item: "Cotton Quality Parameters",
                    id: "Qualityparameter-1",
                    path: "/spinner/quality-parameter/cotton-quality-parameter",
                    icon: FaCheckToSlot,
                    size: 20,
                },
            ],
            isOpen: false,
        },
        // 9
        {
            item: "Training",
            id: "training",
            icon: BsCameraVideo,
            size: 20,
            childrens: [
                {
                    id: "training-1",
                    item: "Training Video",
                    path: "/spinner/training/training-video",
                    icon: BsCameraVideo,
                    size: 20,
                },{
                    id: "training-2",
                    item: "Tracebale Training",
                    path: "/spinner/training/tracebale-training",
                    icon: FaUsersGear,
                    size: 20,
                },
            ],
            isOpen: false,
        },
        // 10
        {
            item: "Ticketing",
            id: "ticketing",
            icon: GiTicket,
            size: 20,
            childrens: [
                {
                    item: "Ticketing",
                    id: "ticketing",
                    path: "/spinner/ticketing",
                    icon: GiTicket,
                    size: 20,
                },
            ],
            isOpen: false,
        },
    ];
}
