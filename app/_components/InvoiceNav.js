import { FaArrowLeft } from "react-icons/fa6";
import Logo from "./Logo";
import BackBtn from "./BackBtn";

export default function InvoiceNav(){

    return (
        <nav className="flex py-6 border-b border-primary-100 ">
            <BackBtn/>
            <div className="flex-1 grid place-content-center">
                <Logo/>
            </div>
        </nav>
    )
}