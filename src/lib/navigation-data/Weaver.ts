import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";

import { FaCheckToSlot, FaUsersGear } from "react-icons/fa6";
import { GiTicket } from "react-icons/gi";

import { ImTree } from "react-icons/im";
import { MdRecycling } from "react-icons/md";
import { TbChartHistogram } from "react-icons/tb";
import { ImSpinner4 } from "react-icons/im";

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
        {
            item: "Weaver Process",
            id: "Weaver Process",
            icon: ImTree,
            size: 20,
            path: "/weaver/weaver-process",
            isOpen: false,
        },
        {
            item: "Weaver Sale",
            id: "Weaver Sale",
            icon: AiFillCreditCard,
            size: 20,
            path: "/weaver/weaver-sales",
            isOpen: false,
        },

        {
            item: "Weaver Supply Chain",
            id: "Weaver Supply Chain",
            icon: ImSpinner4,
            size: 20,
            path: "/weaver/supply-chain",
            isOpen: false,
        },

        {
            item: "Tracebale Training",
            id: "Tracebale Training",
            icon: BsCameraVideo,
            size: 20,
            path: "/weaver/tracebale-training",

            isOpen: false,
        },

        {
            item: "Ticketing",
            id: "ticketing",
            icon: GiTicket,
            size: 20,
            childrens: [
                {
                    item: "Ticketing",
                    id: "ticketing",
                    path: "/weaver/ticketing",
                    icon: GiTicket,
                    size: 20,
                },
            ],
            isOpen: false,
        },
    ];
}
