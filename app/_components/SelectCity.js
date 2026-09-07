
export default function SelectCity({ cities, register, errors }) {
    return (
        <>
            <select {...register("state", { required: "Please choose a city" })} className={`rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${errors.state ? "border-error" : "border-primary-200"}`}>
                <option value={""}>Choose a city</option>
                {
                    cities?.map((city) => {
                        return <option key={city.id} name="state">{city.location}</option>
                    })
                }
            </select>
            {errors.state && <span className="-mt-2 text-xs text-error">{errors.state.message}</span>}
        </>

    )
}