

const CustomToogle = ({checked, onChange, disabled = false}) => {
  return (
    <label className={`relative flex justify-between items-center group p-2 text-xl ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked)
        }}
        value={true}
        className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md"
      />
      <span className="w-11 h-6 flex items-center shrink-0 ml-4 p-1 bg-gray-300 rounded-full duration-300 ease-in-out peer-checked:bg-primary after:w-5 after:h-5 after:bg-gray-50 after:rounded-full after:shadow-lg after:duration-300 peer-checked:after:translate-x-4.5 group-hover:after:translate-x-0.5"></span>
    </label>
  );
};

export default CustomToogle;
