
import { IoShareSocialSharp } from "react-icons/io5";

export default function ShareBtn ({onClick}){
    return   <button onClick={onClick} className="flex items-center border border-primary-200 rounded-lg gap-2 py-1.5 px-2 text-black text-xs font-mono cursor-pointer hover:bg-primary-200"><span><IoShareSocialSharp/></span> Share</button>
}