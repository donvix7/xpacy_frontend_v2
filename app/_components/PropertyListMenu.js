import { RiUserSettingsLine } from "react-icons/ri";
import TableItemOptionsMenu from "./TableItemOptionsMenu";

export default function PropertyListMenu({ id }) {
    const actions = [
        {
            label: "Submit service request",
            href: "#",
            icon: <RiUserSettingsLine className="text-gray-400" />,
        },
    ];

    return (
        <TableItemOptionsMenu actions={actions} menuId={`property-list-menu-${id}`} />
    );
}