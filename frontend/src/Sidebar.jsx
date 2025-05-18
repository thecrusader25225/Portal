import { useState } from "react";
import { CgBoard } from "react-icons/cg";
import { GrLicense } from "react-icons/gr";
import { RiAccountCircleFill, RiCustomerService2Fill } from "react-icons/ri";

export default function Sidebar() {
    const [location, setLocation] = useState("Dashboard")
    const buttons = [
        {
            name: "Dashboard",
            onclick: () => setLocation("Dashboard"),
            icon: CgBoard
        },
        {
            name: "Account Details",
            onclick: () => setLocation("Account"),
            icon: RiAccountCircleFill
        },
        {
            name: "Licensing",
            onclick: () => setLocation("License"),
            icon: GrLicense
        },
        {
            name: "Helpdesk",
            onclick: () => setLocation("Helpdesk"),
            icon: RiCustomerService2Fill
        }
    ]
    return <div className={`w-[calc(15%)] h-full flex flex-col gap-4 backdrop-blur-md mx-8 `}>

        <span className="flex  h-24 items-center   rounded-l-full">
            <img className="h-full" alt="logo" src="./logo.png" />
            <p className="text-3xl font-bold text-white">AURAA</p>
        </span>

        <div className="flex flex-col justify-center p-4 basic">
            {/* <p className="text-xs font-bold text-gray-300">INSPECTIONS</p> */}
            {
                buttons.map(b =>
                    <button className="flex items-center p-4 button gap-2" onClick={b.onclick}>
                        <b.icon />
                        <p>{b.name}</p>
                    </button>
                )
            }
        </div>
    </div>
}