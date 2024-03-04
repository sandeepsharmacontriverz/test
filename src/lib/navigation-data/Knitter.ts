import { AiFillCreditCard } from "react-icons/ai";
import { BsCameraVideo } from "react-icons/bs";
import { GiTicket } from "react-icons/gi";
import { ImTree } from "react-icons/im";
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
            item: "Knitter Process",
            id: "Knitter Process",
            icon: ImTree,
            size: 20,
            path: "/knitter/process",
            isOpen: false,
        },
        {
            item: "Knitter Sale",
            id: "Knitter Sale",
            icon: AiFillCreditCard,
            size: 20,
            path: "/knitter/sale",
            isOpen: false,
        },
        {
            item: "Knitter Supply Chain",
            id: "Knitter Supply Chain",
            icon: ImSpinner4,
            size: 20,
            path: "/knitter/supply-chain",
            isOpen: false,
        },

        {
            item: "Tracebale Training",
            id: "Tracebale Training",
            icon: BsCameraVideo,
            size: 20,
            path: "/knitter/tracebale-training",

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
                    path: "/knitter/ticketing",
                    icon: GiTicket,
                    size: 20,
                },
            ],
            isOpen: false,
        },
    ];
}
