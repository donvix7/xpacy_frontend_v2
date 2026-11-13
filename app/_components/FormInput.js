

export default function FormInput({label, children, id}){
    return (
        <div className="flex w-full min-w-0 flex-col space-y-2 font-mono md:flex-1 [&>input]:w-full [&>select]:w-full [&>div]:w-full">
            <label htmlFor={id} className="text-[13px] font-medium text-mute">{label}</label>
            {children}
        </div>
    )
}
