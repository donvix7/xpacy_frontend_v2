import Link from "next/link";

export default function LinkBtn({ children, btnColor, ...otherProps }) {
  return (
    <button
      {...otherProps}
      className={`${
        btnColor ? "bg-white text-primary" : "bg-primary text-white"
      }  border border-primary cursor-pointer  px-5 py-3 font-semibold flex space-x-2.5 font-mono items-center justify-center rounded-md hover:shadow-md`}
    >
      {children}
    </button>
  );
}
