"use client"
import Modal from "./Modal";
import ScheduleInspectionForm from "./ScheduleInspectionForm";
import { FaCalendarCheck } from "react-icons/fa6";

export default function ScheduleInspection({ properties = [] }) {
    return (
        <Modal>
            <Modal.Open name="schedule-inspection">
                <button className="py-2.5 px-4 font-mono bg-primary rounded-lg text-white cursor-pointer text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors">
                    <FaCalendarCheck />
                    Schedule Inspection
                </button>
            </Modal.Open>
            <Modal.Window name="schedule-inspection" className="max-w-[520px]">
                <ScheduleInspectionForm properties={properties} />
            </Modal.Window>
        </Modal>
    );
}