

export default function FormInput({label, children, id}){
    return (
        <div className="md:flex-1 w-full flex flex-col space-y-2 font-mono">
            <label htmlFor={id} className="text-sm text-black">{label}</label>
            {children}
        </div>
    )
}